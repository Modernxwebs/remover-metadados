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
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const jsonLdMatch = content.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);

  const title = titleMatch ? titleMatch[1] : null;
  const desc = descMatch ? descMatch[1] : null;
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  const robots = robotsMatch ? robotsMatch[1] : null;
  const hasH1 = !!h1Match;
  const hasJsonLd = !!jsonLdMatch;

  const isErrorPage = relPath.includes('404') || relPath.includes('500');

  console.log(`Page: /${relPath}`);
  console.log(`  Title: [${title ? title.length : 0} chars] "${title || 'MISSING'}"`);
  console.log(`  Desc:  [${desc ? desc.length : 0} chars] "${desc ? desc.substring(0, 60) + '...' : 'MISSING'}"`);
  console.log(`  Canonical: ${canonical || 'NONE'}`);
  console.log(`  Robots: ${robots || 'DEFAULT'}`);
  console.log(`  H1: ${hasH1 ? 'YES' : 'NO'} | Schema JSON-LD: ${hasJsonLd ? 'YES' : 'NO'}`);

  if (!title) { console.error(`  ❌ Missing title!`); issues++; }
  if (!desc && !isErrorPage) { console.error(`  ❌ Missing description!`); issues++; }
  if (!canonical && !isErrorPage) { console.error(`  ❌ Missing canonical URL!`); issues++; }
  if (!hasH1) { console.error(`  ❌ Missing H1 tag!`); issues++; }

  console.log('');
});

console.log(`Audit finished with ${issues} critical issue(s).`);
