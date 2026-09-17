const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
let brokenLinks = 0;
let checkedLinks = 0;

function getAllFiles(dir, exts) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = getAllFiles(distDir, ['.html']);

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const regex = /href=["']([^"'#?]+)(?:[#?][^"']*)?["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      continue;
    }
    if (!href.startsWith('/')) {
      continue;
    }
    checkedLinks++;
    
    // Check if target exists
    const cleanHref = href.replace(/^\//, '');
    const target = path.join(distDir, cleanHref);
    let exists = false;
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      exists = true;
    } else if (fs.existsSync(target + '.html')) {
      exists = true;
    } else if (fs.existsSync(path.join(target, 'index.html'))) {
      exists = true;
    } else if (cleanHref === '' && fs.existsSync(path.join(distDir, 'index.html'))) {
      exists = true;
    }
    
    if (!exists) {
      console.error('Broken link in', path.relative(distDir, file), '->', href);
      brokenLinks++;
    }
  }
}

console.log(`Checked ${checkedLinks} internal links across ${htmlFiles.length} HTML pages. Broken links: ${brokenLinks}`);
if (brokenLinks > 0) {
  process.exit(1);
}
