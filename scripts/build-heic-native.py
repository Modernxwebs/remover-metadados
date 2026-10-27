#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Rebuilds the vendored HEIC native module from the source archives described in public/licenses/source/.
import os
import pathlib
import re
import subprocess
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--workdir', required=True, help='Directory containing unpacked source archives')
parser.add_argument('--emsdk', required=True, help='Activated Emscripten SDK 4.0.14 directory')
parser.add_argument('--cmake', required=True, help='Path to CMake 3.31.6 executable')
args = parser.parse_args()
root = pathlib.Path(args.workdir).resolve()
sdk = pathlib.Path(args.emsdk).resolve()
emscripten = sdk / 'upstream/emscripten'
cmake_dir = pathlib.Path(args.cmake).resolve().parent
env = os.environ.copy()
env['PATH'] = str(cmake_dir) + ':' + str(emscripten) + ':' + str(sdk / 'node/22.16.0_64bit/bin') + ':' + env['PATH']
env['EM_CONFIG'] = str(sdk / '.emscripten')
env['EM_CACHE'] = str(root / 'em-cache')
log = (root / 'build.log').open('w')

def run(args, cwd=root):
    print('Running:', pathlib.Path(str(args[0])).name, ' '.join(str(x) for x in args[1:4]), flush=True)
    log.write('\nCOMMAND ' + json.dumps([str(x) for x in args]) + '\n'); log.flush()
    result = subprocess.run([str(x) for x in args], cwd=cwd, env=env, stdout=log, stderr=subprocess.STDOUT)
    if result.returncode:
        log.flush()
        print((root / 'build.log').read_text()[-7000:], flush=True)
        raise SystemExit(result.returncode)

emcmake = emscripten / 'emcmake'
cmake = cmake_dir / 'cmake'
de_build = root / 'de265-build'
prefix = root / 'decoder-prefix'
run([emcmake, cmake, '-G', 'Unix Makefiles', '-S', root / 'libde265-1.1.3', '-B', de_build,
     '-DCMAKE_BUILD_TYPE=Release', '-DBUILD_SHARED_LIBS=OFF', '-DENABLE_SIMD=OFF', '-DENABLE_SDL=OFF',
     '-DENABLE_DECODER=OFF', '-DENABLE_ENCODER=OFF', '-DENABLE_SHERLOCK265=OFF', '-DWITH_FUZZERS=OFF',
     '-DCMAKE_INSTALL_PREFIX=' + str(prefix), '-DCMAKE_C_FLAGS=-O2', '-DCMAKE_CXX_FLAGS=-O2'])
run([cmake, '--build', de_build, '--parallel', '4'])
run([cmake, '--install', de_build])

heif = root / 'libheif-1.23.7'
post = root / 'post-with-build-info.js'
post.write_text((heif / 'post.js').read_text() + '\nModule.getCodecVersions = function () { return { libheif: UTF8ToString(Module._heif_get_version()), libde265: UTF8ToString(Module._de265_get_version()) }; };\n')
heif_build = root / 'heif-build'
plugin_names = re.findall(r'plugin_option\(([A-Z0-9_]+)\s', (heif / 'CMakeLists.txt').read_text())
flags = ['-DWITH_' + name + '=OFF' for name in plugin_names if name != 'LIBDE265']
run([emcmake, cmake, '-G', 'Unix Makefiles', '-S', heif, '-B', heif_build,
     '-DCMAKE_BUILD_TYPE=Release', '-DBUILD_SHARED_LIBS=OFF', '-DWITH_LIBDE265=ON', '-DWITH_LIBDE265_PLUGIN=OFF',
     '-DLIBDE265_INCLUDE_DIR=' + str(prefix / 'include'), '-DLIBDE265_LIBRARY=' + str(prefix / 'lib/libde265.a'),
     '-DENABLE_PLUGIN_LOADING=OFF', '-DENABLE_MULTITHREADING_SUPPORT=OFF', '-DENABLE_PARALLEL_TILE_DECODING=OFF',
     '-DWITH_UNCOMPRESSED_CODEC=OFF', '-DWITH_LIBSHARPYUV=OFF', '-DWITH_EXAMPLES=OFF', '-DWITH_GDK_PIXBUF=OFF',
     '-DBUILD_TESTING=OFF', '-DBUILD_DOCUMENTATION=OFF', '-DWITH_HEADER_COMPRESSION=OFF',
     '-DCMAKE_C_FLAGS=-O2', '-DCMAKE_CXX_FLAGS=-O2', *flags])
run([cmake, '--build', heif_build, '--parallel', '4'])

archive = heif_build / 'libheif/libheif.a'
symbols = subprocess.check_output([str(sdk / 'upstream/bin/llvm-nm'), str(archive), '--format=just-symbols'], env=env).decode()
exports = sorted(set('_' + s for s in symbols.splitlines() if re.match(r'^(heif_|de265_)\w+$', s)))
exports += ['_free', '_malloc', '_memcpy']
native_output = root / 'patched-libheif.js'
run([emscripten / 'emcc', '-Wl,--whole-archive', archive, '-Wl,--no-whole-archive', prefix / 'lib/libde265.a',
     '-lembind', '--post-js', root / 'post-with-build-info.js', '-O2', '-o', native_output,
     '-sEXPORTED_FUNCTIONS=' + json.dumps(exports), '-sMODULARIZE=1', '-sEXPORT_NAME=libheif',
     '-sEXPORT_ES6=1', '-sWASM=1', '-sSINGLE_FILE=1', '-sWASM_ASYNC_COMPILATION=0', '-sDYNAMIC_EXECUTION=0',
     '-sALLOW_MEMORY_GROWTH=1', '-sINITIAL_MEMORY=67108864', '-sMAXIMUM_MEMORY=536870912',
     '-sENVIRONMENT=worker', '-sFILESYSTEM=0'])
print('Native patched decoder built:', native_output.stat().st_size, 'bytes', flush=True)
