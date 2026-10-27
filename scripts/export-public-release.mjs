import { readdir, lstat, mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputIndex = process.argv.indexOf('--output');
const outputArg = outputIndex >= 0 ? process.argv[outputIndex + 1] : '';
if (!outputArg || !path.isAbsolute(outputArg)) throw new Error('Provide --output with a new absolute destination path.');
const output = path.resolve(outputArg);
if (output === root || output.startsWith(path.join(root, 'src') + path.sep) || output.startsWith(path.join(root, 'public') + path.sep)) {
  throw new Error('Choose a destination outside the source and public directories.');
}

const rootFiles = [
  '.env.example', '.gitignore', '.gitleaksignore', 'README.md', 'LICENSE', 'LICENSE-SCOPE.md',
  'CONTRIBUTING.md', 'SECURITY.md', 'THIRD_PARTY_NOTICES.md', 'astro.config.mjs',
  'package.json', 'package-lock.json', 'tsconfig.json',
];
const trees = ['src', 'public', 'scripts', 'docs', '.github'];
const forbidden = /(^|\/)(?:\.git|node_modules|dist|\.astro|\.vscode|\.idea|\.aws|\.ssh|\.codex|\.agents|__pycache__|artifacts|audit-results|test-results)(\/|$)|(^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|pfx|pyc|log|bak|tmp)$/i;
const files = [...rootFiles];
async function visit(relative) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink requires manual review: ${name}`);
    if (forbidden.test(name)) throw new Error(`Excluded local or sensitive path in a public tree: ${name}`);
    if (entry.name.startsWith('.') && name !== 'public/.well-known') throw new Error(`Unexpected hidden path: ${name}`);
    if (/^public\/[a-z0-9-]{8,128}\.txt$/i.test(name) && !['public/robots.txt', 'public/humans.txt', 'public/llms-full.txt'].includes(name)) {
      throw new Error(`Possible verification key in public source: ${name}`);
    }
    if (entry.isDirectory()) await visit(name);
    else if (entry.isFile()) files.push(name);
    else throw new Error(`Unsupported file type: ${name}`);
  }
}
for (const tree of trees) await visit(tree);
for (const name of rootFiles) {
  if (!(await lstat(path.join(root, name))).isFile()) throw new Error(`Expected regular file: ${name}`);
}
const example = await readFile(path.join(root, '.env.example'), 'utf8');
if (example.split('\n').some(line => /^[A-Z_][A-Z0-9_]*=.+/.test(line))) throw new Error('.env.example must not contain configured values.');

// Refuse to overwrite any existing release. Never copy the original Git history.
await mkdir(path.dirname(output), { recursive: true });
await mkdir(output);
const manifest = [];
for (const name of files.sort()) {
  const source = path.join(root, name);
  const destination = path.join(output, name);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  const bytes = await readFile(destination);
  manifest.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(path.join(output, 'PUBLIC_RELEASE_MANIFEST.json'), JSON.stringify({
  format: 1,
  description: 'SHA-256 of the exported public source files. Excludes Git history, local settings and generated output.',
  files: manifest,
}, null, 2) + '\n');
console.log(`Exported ${manifest.length} files and a SHA-256 manifest to ${output}. No Git history or remote was copied.`);
