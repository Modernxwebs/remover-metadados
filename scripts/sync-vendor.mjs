import { copyFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const packages = [
  ['exifr', '7.1.3', 'node_modules/exifr/dist/full.umd.js', 'public/vendor/exifr.full.umd.js'],
  ['jszip', '3.10.2', 'node_modules/jszip/dist/jszip.min.js', 'public/vendor/jszip.min.js'],
  ['@jsquash/avif', '2.1.1', 'node_modules/@jsquash/avif/codec/enc/avif_enc.wasm', 'public/vendor/avif_enc.wasm'],
];
for (const [name, version, source, target] of packages) {
  const installed = JSON.parse(await readFile(`node_modules/${name}/package.json`, 'utf8'));
  if (installed.version !== version) throw new Error(`Review source/license notices for ${name} ${installed.version} before replacing pinned ${version}.`);
  if (process.argv.includes('--check')) {
    if (!(await readFile(source)).equals(await readFile(target))) throw new Error(`Vendor asset differs from installed dependency: ${target}`);
  } else await copyFile(source, target);
}
const build = JSON.parse(await readFile('public/licenses/source/build.json', 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
if (digest(await readFile('public/vendor/heic-to.js')) !== build.decoderSha256) throw new Error('Patched HEIC decoder differs from its reviewed build record.');
for (const [file, expected] of Object.entries(build.buildSourceSha256)) {
  if (digest(await readFile(file)) !== expected) throw new Error(`HEIC build source changed; rebuild and review the codec record: ${file}`);
}
const archives = JSON.parse(await readFile('public/licenses/source/archives.json', 'utf8'));
for (const archive of archives) {
  if (digest(await readFile(`public/licenses/source/${archive.file}`)) !== archive.sha256) throw new Error(`Source archive checksum mismatch: ${archive.file}`);
}
console.log(process.argv.includes('--check') ? 'Vendor packages, patched decoder, build sources and archive checksums verified.' : 'Synced upstream vendor files and verified the separately rebuilt HEIC decoder.');
