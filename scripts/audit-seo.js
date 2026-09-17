import fs from 'fs';
import path from 'path';

const distDir = './dist';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Auditing ${htmlFiles.length} HTML pages in dist/...\n`);

let issues = 0;

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');

  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const descMatch = content.match(/<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["']/i);
  const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["'](.*?)["']/i);
  const robotsMatch = content.match(/<meta[^>]+name=["']robots["'][^>]+content=["'](.*?)["']/i);
  const allH1s = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const jsonLdMatches = content.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  const title = titleMatch ? titleMatch[1] : null;
  const desc = descMatch ? descMatch[1] : null;
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  const robots = robotsMatch ? robotsMatch[1] : null;
  const hasH1 = allH1s.length === 1;
  const hasJsonLd = jsonLdMatches.length > 0;

  // Validate JSON-LD blocks
  let jsonLdValid = true;
  jsonLdMatches.forEach((m, idx) => {
    const raw = m.replace(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/i, '').replace(/<\/script>/i, '');
    try {
      JSON.parse(raw);
    } catch (err) {
      jsonLdValid = false;
      console.error(`  ❌ Invalid JSON in JSON-LD block #${idx + 1}: ${err.message}`);
      issues++;
    }
  });

  const isErrorPage = relPath.includes('404') || relPath.includes('500');
  const isRedirect = /<meta[^>]+http-equiv=["']refresh["']/i.test(content);

  console.log(`Page: /${relPath}`);
  console.log(`  Title: [${title ? title.length : 0} chars] "${title || 'MISSING'}"`);
  console.log(`  Desc:  [${desc ? desc.length : 0} chars] "${desc ? desc.substring(0, 60) + '...' : 'MISSING'}"`);
  console.log(`  Canonical: ${canonical || 'NONE'}`);
  console.log(`  Robots: ${robots || 'DEFAULT'}`);
  console.log(`  H1 count: ${allH1s.length} | Schema JSON-LD blocks: ${jsonLdMatches.length} (Valid: ${jsonLdValid ? 'YES' : 'NO'})`);

  if (!title) { console.error(`  ❌ Missing title!`); issues++; }
  if (!desc && !isErrorPage && !isRedirect) { console.error(`  ❌ Missing description!`); issues++; }
  if (!canonical && !isErrorPage) { console.error(`  ❌ Missing canonical URL!`); issues++; }
  if (allH1s.length !== 1 && !isRedirect) { console.error(`  ❌ Expected exactly 1 H1 tag, found ${allH1s.length}!`); issues++; }
  if (!hasJsonLd && !isRedirect) { console.error(`  ❌ Missing Schema JSON-LD!`); issues++; }

  console.log('');
});

console.log(`Audit finished with ${issues} critical issue(s).`);
