# Patched HEIC worker: source and replacement

The application uses a modified heic-to 1.6.6 wrapper with a project build of
libheif **1.23.7** and libde265 **1.1.3**. The earlier npm decoder embedded older
native code with published security advisories; installing an npm package or
passing npm audit alone did not resolve those native-library issues.

`build.json` records the sources, compiler versions, worker limits, build-driver
hashes and decoder hash. Browser tests call the native version functions at
runtime and check that the loaded libraries match the recorded patched versions.
These checks are not a comprehensive security audit or a guarantee for all files.

## Included source

- `heic-to-1.6.6.tar.gz`: upstream preferred wrapper source, README, build script
  and license. The upstream `src/lib/` generated JavaScript files are deliberately
  omitted because they embed an earlier native library. `archives.json` records
  both the original upstream archive hash and the filtered archive hash and lists
  the omitted files. Do not restore those old generated decoder files.
- `libheif-1.23.7.tar.gz`: unmodified upstream native source and license.
- `libde265-1.1.3.tar.gz`: unmodified upstream native source and license.

All archive download URLs and SHA-256 values are in `archives.json`.
Verify the provided archives with `sha256sum --check SHA256SUMS` on Linux or
`shasum -a 256 --check SHA256SUMS` on macOS, from this directory.

The root repository's `scripts/build-heic-native.py` is the original MIT build
driver. `scripts/build-heic-wrapper.mjs` includes modified upstream wrapper code
and is LGPL-3.0-or-later. Together with these archives they provide the source
needed to modify and replace the shipped decoder.

## Rebuild

The recorded build used Emscripten 4.0.14, CMake 3.31.6, esbuild 0.25.4 and make
on macOS ARM64. Other build hosts and bit-identical cross-host output have not
been verified. The compiled target is WebAssembly for a browser worker.

Install and activate the official Emscripten SDK 4.0.14 in a separate build
directory, install CMake, and install the pinned esbuild in a separate tools
directory. These tools are only needed to rebuild the native decoder; normal
website builds use the committed vendor asset.

Extract the three source archives into the same separate working directory,
preserving their top-level folder names. From the project source checkout:

```sh
python3 scripts/build-heic-native.py --workdir /absolute/path/heic-build --emsdk /absolute/path/emsdk --cmake /absolute/path/cmake
node scripts/build-heic-wrapper.mjs --workdir /absolute/path/heic-build --esbuild /absolute/path/codec-tools/node_modules/esbuild/lib/main.js --output /absolute/path/rebuilt-heic-to.js
```

The native build disables other external codecs, plugin loading, parallel tile
decoding and uncompressed-codec support. The self-contained WASM module does not
fetch a remote decoder or require JavaScript eval. The project wrapper handles
asynchronous module initialization, terminates timed-out workers, and checks
input and decoded-image sizes. It reports linked versions through native APIs.

Replace `public/vendor/heic-to.js` with your rebuilt module. Preserve its
`heicTo` and `getDecoderVersions` exports. Rebuild and redeploy the static site.
There is no application signature preventing a user's deliberate replacement;
the maintainer's consistency check detects changes against its reviewed record
and must be deliberately updated when reviewing a new build.

Review upstream advisories, update source archives/notices and the build record,
and run both browser suites with a non-sensitive HEIC fixture before distributing
a changed decoder. `npm run audit:native` checks release freshness and the CI
workflow runs it weekly. A fresh version number is not proof of zero defects.

Source: https://github.com/hoppergee/heic-to/tree/v1.6.6,
https://github.com/strukturag/libheif/tree/v1.23.7,
https://github.com/strukturag/libde265/tree/v1.1.3,
https://github.com/emscripten-core/emscripten/tree/4.0.14.

See the adjacent full license texts and the root THIRD_PARTY_NOTICES.md.
