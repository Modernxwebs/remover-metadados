import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://remover-metadados.com';
const appUrls = new Map();
let count = 0;
async function audit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await audit(file); continue; }
    if (!file.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    if (/<meta[^>]*http-equiv="refresh"/i.test(html)) continue;
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    const entities = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => {
      const data = JSON.parse(match[1]); return data['@graph'] || [data];
    });
    const pages = entities.filter(node => ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'].includes(node['@type']));
    assert.equal(pages.length, 1, `${file}: one page entity`);
    assert.equal(pages[0].url, canonical, `${file}: page URL matches canonical`);
    const apps = entities.filter(node => node['@type'] === 'WebApplication');
    const home = [`${site}/`, `${site}/en/`].includes(canonical);
    const viewer = [`${site}/ver-metadados/`, `${site}/en/metadata-viewer/`].includes(canonical);
    assert.equal(apps.length, home || viewer ? 1 : 0, `${file}: application only on its tool page`);
    for (const app of apps) {
      const expected = home ? `${site}/` : `${site}/ver-metadados/`;
      assert.equal(app['@id'], `${expected}#app`, `${file}: stable app ID`);
      assert.equal(app.url, expected, `${file}: stable app URL`);
      if (appUrls.has(app['@id'])) assert.equal(appUrls.get(app['@id']), app.url);
      appUrls.set(app['@id'], app.url);
    }
    for (const article of entities.filter(node => ['BlogPosting', 'TechArticle'].includes(node['@type']))) {
      assert.equal(pages[0].mainEntity?.['@id'], article['@id'], `${file}: page links to article`);
    }
    count++;
  }
}
await audit('dist');
assert.equal(appUrls.size, 2, 'Separate, stable remover and viewer identities');
console.log(`Structured-data identity and page-role checks passed for ${count} pages.`);
