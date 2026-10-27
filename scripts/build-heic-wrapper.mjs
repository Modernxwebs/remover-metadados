// SPDX-License-Identifier: LGPL-3.0-or-later
// Builds a modified heic-to 1.6.6 wrapper. Upstream license and source are in
// public/licenses/source/. This file includes code derived from that wrapper.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return path.resolve(process.argv[index + 1]);
}
const workdir = argument('--workdir');
const esbuildPath = argument('--esbuild');
const output = argument('--output');
const esbuild = await import(pathToFileURL(esbuildPath).href);
const upstream = path.join(workdir, 'heic-to-1.6.6');
let source = await readFile(path.join(upstream, 'src/index.js'), 'utf8');

const start = source.indexOf('// Lazy-load worker');
const end = source.indexOf('const encodeByCanvas', start);
if (start < 0 || end < 0) throw new Error('Unexpected upstream wrapper source');
source = source.slice(0, start) + `// Project modifications: bounded worker execution and runtime codec versions.
let worker;
let requestId = 0;
let decoderVersions = null;
const workerUrls = new WeakMap();
const releaseWorkerUrl = current => {
  const url = workerUrls.get(current);
  if (url) URL.revokeObjectURL(url);
  workerUrls.delete(current);
};
const getDecoderVersions = () => decoderVersions;
const loadWorker = () => {
  if (!worker) {
    const url = URL.createObjectURL(new Blob([WORKER_FILE_CONTENT], { type: 'application/javascript' }));
    const created = new Worker(url);
    worker = created;
    workerUrls.set(created, url);
    const release = () => releaseWorkerUrl(created);
    created.addEventListener('message', release, { once: true });
    created.addEventListener('error', release, { once: true });
  }
  return worker;
};
const decodeBuffer = buffer => new Promise((resolve, reject) => {
  const current = loadWorker();
  const id = String(++requestId);
  const cleanup = () => {
    clearTimeout(timer);
    current.removeEventListener('message', onMessage);
    current.removeEventListener('error', onError);
  };
  const onMessage = event => {
    if (event.data.id !== id) return;
    cleanup();
    decoderVersions = event.data.versions || null;
    if (event.data.error) reject(new Error(String(event.data.error)));
    else resolve(event.data.imageData);
  };
  const onError = event => {
    event.preventDefault();
    cleanup();
    releaseWorkerUrl(current);
    current.terminate();
    if (worker === current) worker = undefined;
    reject(new Error('HEIC decoder worker failed'));
  };
  const timer = setTimeout(() => {
    cleanup();
    releaseWorkerUrl(current);
    current.terminate();
    if (worker === current) worker = undefined;
    reject(new Error('HEIC decoding exceeded the 30-second limit'));
  }, 30000);
  current.addEventListener('message', onMessage);
  current.addEventListener('error', onError);
  try { current.postMessage({ id, buffer }, [buffer]); }
  catch (error) { cleanup(); reject(error); }
});

` + source.slice(end);
const signature = 'const heicTo = async ({blob, type, quality, options}) => {';
if (!source.includes(signature)) throw new Error('Unexpected upstream heicTo interface');
source = source.replace(signature, signature + `
  if (blob.size > 100 * 1024 * 1024) throw new Error('HEIC input exceeds the 100 MiB limit');`);
source = source.replace('export {\n', 'export {\n  getDecoderVersions,\n');

let workerSource = await readFile(path.join(upstream, 'src/worker.js'), 'utf8');
workerSource = workerSource.replace('LIB_HEIF_PATH', JSON.stringify(path.join(workdir, 'patched-libheif.js')));
workerSource = workerSource.replace('const libheif = buildLibheif()', `let libheif;
const ready = Promise.resolve(buildLibheif()).then(module => { libheif = module; });
// Messages below report initialization failures; avoid an earlier unhandled rejection.
ready.catch(() => {});
const codecVersions = () => { try { return libheif?.getCodecVersions?.() || null; } catch { return null; } };`);
workerSource = workerSource.replace('    const imageData = await decodeBuffer(message.data.buffer);', '    await ready;\n    const imageData = await decodeBuffer(message.data.buffer);');
workerSource = workerSource.replace('    const height = image.get_height();', `    const height = image.get_height();
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 || width * height > 64000000) {
      throw new Error('HEIC decoded dimensions exceed the 64-megapixel limit');
    }`);
workerSource = workerSource.replace('postMessage({ id, imageData, error: "" });', 'postMessage({ id, imageData, error: "", versions: codecVersions() });');
workerSource = workerSource.replace('imageData: null,', 'imageData: null,\n      versions: codecVersions(),');
await writeFile(path.join(workdir, 'project-heic-index.js'), source);
await writeFile(path.join(workdir, 'project-heic-worker.js'), workerSource);
const workerBuild = await esbuild.build({
  entryPoints: [path.join(workdir, 'project-heic-worker.js')], bundle: true, write: false,
  minify: true, target: 'es2020', platform: 'browser', legalComments: 'inline',
  // The native WASM is embedded; no worker-relative asset URL is needed.
  define: { 'import.meta.url': '""' },
});
await esbuild.build({
  entryPoints: [path.join(workdir, 'project-heic-index.js')], outfile: output,
  bundle: true, minify: true, target: 'es2020', platform: 'browser', format: 'esm',
  legalComments: 'inline',
  banner: { js: '/*! Modified heic-to 1.6.6 with libheif 1.23.7 / libde265 1.1.3. LGPL-3.0-or-later. Sources and licenses: /licenses/ */' },
  define: { WORKER_FILE_CONTENT: JSON.stringify(workerBuild.outputFiles[0].text) },
});
console.log('Built the separately served patched HEIC decoder.');
