import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const notices = [];
const records = [];
for (const [directory, entry] of Object.entries(lock.packages).sort(([a], [b]) => a.localeCompare(b))) {
  if (!directory || entry.dev) continue;
  let pkg;
  try { pkg = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT' && entry.optional) continue; throw error; }
  const license = pkg.license || entry.license;
  if (!license) throw new Error(`Missing license metadata: ${directory}`);
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(file => file.isFile() && /^(?:licen[cs]e|copying|notice|copyright)(?:\.|$)/i.test(file.name))
    .map(file => file.name).sort();
  const repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url || '';
  records.push({ name: pkg.name, version: pkg.version, license, repository, noticeFiles: files });
  notices.push(`\n${'='.repeat(72)}\n${pkg.name} ${pkg.version}\nLicense: ${license}\nSource: ${repository}\n`);
  for (const file of files) notices.push(`\n--- ${file} ---\n${await readFile(path.join(directory, file), 'utf8')}\n`);
}
await mkdir('public/licenses', { recursive: true });
const introduction = 'Third-party dependency notices\n\nGenerated from installed non-development packages in package-lock.json.\nThis is an installation inventory, not a statement that every package is\nshipped in the browser. Optional platform packages not installed are omitted.\nNative codec and separate HEIC notices are in adjacent files and source/.\nUpstream copyright and license notices are preserved verbatim below.\n';
await writeFile('public/licenses/dependencies.txt', introduction + notices.join(''));
await writeFile('public/licenses/dependencies.json', JSON.stringify(records, null, 2) + '\n');
// The website copies live in a different directory from the repository notices.
for (const [source, target] of [['LICENSE', 'PROJECT-LICENSE.txt'], ['LICENSE-SCOPE.md', 'LICENSE-SCOPE.md'], ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md']]) {
  let text = await readFile(source, 'utf8');
  text = text.replace('[MIT license](LICENSE)', '[MIT license](PROJECT-LICENSE.txt)');
  text = text.replace('[`public/licenses/`](public/licenses/)', '[license files](./)');
  await writeFile(`public/licenses/${target}`, text);
}
console.log(`Generated notices for ${records.length} installed non-development packages.`);
