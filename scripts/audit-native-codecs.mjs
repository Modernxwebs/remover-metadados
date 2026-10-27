import { readFile } from 'node:fs/promises';

// npm audit does not inspect native code embedded in a vendored browser module.
const build = JSON.parse(await readFile('public/licenses/source/build.json', 'utf8'));
for (const [repository, current] of [
  ['strukturag/libheif', build.libheif],
  ['strukturag/libde265', build.libde265],
]) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'remover-metadados-codec-release-check' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Could not check ${repository}: HTTP ${response.status}`);
  const release = await response.json();
  const latest = release.tag_name?.replace(/^v/, '');
  if (latest !== current) throw new Error(`${repository}: bundled ${current}, latest release ${latest}. Review advisories, rebuild and retest before the next release; do not just edit the version record.`);
  console.log(`${repository}: bundled ${current} matches the latest upstream release.`);
}
console.log('Release freshness is not proof that a codec has no vulnerabilities. Review upstream advisories as well.');
