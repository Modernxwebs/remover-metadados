import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { exiftoolPath } from 'exiftool-vendored';

// Serve the production build with its hosting headers. Astro preview does not
// apply Cloudflare _headers. This loopback-only server is a test harness.
const dist = path.resolve('dist');
const headersText = await readFile('public/_headers', 'utf8');
const block = headersText.match(/^\/\*\n((?:  .+\n)+)/m)?.[1];
assert.ok(block, 'Global security header block exists');
const headers = Object.fromEntries(block.trimEnd().split('\n').map(line => {
  const separator = line.indexOf(':');
  return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
}));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.txt': 'text/plain' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.resolve(dist, '.' + pathname);
    if (!file.startsWith(dist + path.sep)) {
      if (file !== dist) throw new Error('Invalid path');
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, { ...headers, 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { ...headers, 'Content-Type': 'text/plain' });
    response.end('Not found');
  }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const temp = await mkdtemp(path.join(tmpdir(), 'metadata-security-'));
const payload = '<img src=x onerror="window.__metadataXss=1">';
const name = `\"><img src=x onerror="window.__metadataXss=1">.jpg`;
const imagePath = path.join(temp, 'synthetic.jpg');
await sharp({ create: { width: 24, height: 16, channels: 3, background: '#f5cd4e' } }).jpeg().toFile(imagePath);
execFileSync(await exiftoolPath(), ['-overwrite_original', `-Artist=${payload}`, `-Make=${payload}`, '-Model=Synthetic Fixture', imagePath]);
const bytes = [...await readFile(imagePath)];
const checks = [];
function check(description, fn) { fn(); checks.push(description); }
const browser = await puppeteer.launch({ headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : process.platform === 'darwin' ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {}),
});
try {
  const page = await browser.newPage();
  const external = [];
  const errors = [];
  const csp = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().startsWith(origin + '/') || /^(data:|blob:|about:)/.test(request.url())) return request.continue();
    external.push({ url: request.url(), body: request.postData() || '', type: request.resourceType() });
    return request.respond({ status: 200, contentType: request.resourceType() === 'script' ? 'text/javascript' : request.resourceType() === 'stylesheet' ? 'text/css' : 'text/plain', body: '' });
  });
  await page.exposeFunction('recordCspViolation', directive => csp.push(directive));
  await page.evaluateOnNewDocument(() => {
    window.__metadataXss = 0;
    window.__telemetry = [];
    window.gtag = (...args) => window.__telemetry.push(args);
    document.addEventListener('securitypolicyviolation', event => window.recordCspViolation(event.violatedDirective));
  });

  async function upload(selector, files) {
    await page.$eval(selector, (input, files) => {
      const transfer = new DataTransfer();
      for (const { name, bytes } of files) transfer.items.add(new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, files);
  }
  for (const route of ['/', '/en/']) {
    const response = await page.goto(origin + route, { waitUntil: 'networkidle0' });
    check(`${route}: production security headers served`, () => {
      assert.equal(response.headers()['x-content-type-options'], 'nosniff');
      assert.match(response.headers()['content-security-policy'], /object-src 'none'/);
      assert.equal(response.headers()['referrer-policy'], 'no-referrer');
    });
    await upload('#file-input', [{ name, bytes }]);
    await page.waitForSelector('.file-name-text');
    const rendered = await page.$eval('.file-name-text', element => ({ text: element.textContent, title: element.title, injected: element.querySelectorAll('img').length }));
    check(`${route}: malicious filename is displayed literally`, () => {
      assert.equal(rendered.text, name); assert.equal(rendered.title, name); assert.equal(rendered.injected, 0);
    });
    await page.click('.process-one-btn');
    await page.waitForFunction(() => document.querySelector('.status-done'));
    await page.select('#global-format-select', 'avif');
    await page.waitForFunction(() => document.querySelector('.status-done'), { timeout: 60000 });
    check(`${route}: AVIF conversion works under production CSP`, () => assert.deepEqual(csp, []));
    await page.click('.remove-btn');
    const remaining = await page.$$eval('.file-row', elements => elements.length);
    check(`${route}: escaped filename still maps to working remove control`, () => assert.equal(remaining, 0));
    const marker = '__synthetic_private_marker__';
    await upload('#file-input', [{ name: marker + '.' + marker, bytes: [1, 2, 3] }]);
    await page.click('.process-one-btn');
    await page.waitForFunction(() => document.querySelector('.status-error'));
    const telemetry = await page.evaluate(() => window.__telemetry);
    check(`${route}: telemetry excludes arbitrary extensions and raw errors`, () => {
      assert.ok(!JSON.stringify(telemetry).includes(marker));
      assert.ok(!JSON.stringify(telemetry).includes(payload));
      const failure = telemetry.find(row => row[1] === 'metadata_error');
      assert.equal(failure[2].file_type, 'unknown');
      assert.equal(failure[2].error_code, 'processing_failed');
      assert.ok(!('error_message' in failure[2]));
    });
    assert.equal(await page.evaluate(() => window.__metadataXss), 0);
  }

  for (const route of ['/ver-metadados/', '/en/metadata-viewer/']) {
    await page.goto(origin + route, { waitUntil: 'networkidle0' });
    await upload('#viewer-file-input', [{ name, bytes }, { name: 'second.jpg', bytes }]);
    await page.waitForFunction(() => document.querySelectorAll('.file-pill').length === 2);
    const pill = await page.$eval('.file-pill-name', element => ({ text: element.textContent, title: element.title, injected: element.querySelectorAll('img').length }));
    check(`${route}: multi-file strip escapes filenames`, () => { assert.equal(pill.text, name); assert.equal(pill.title, name); assert.equal(pill.injected, 0); });
    for (const [tab, grid] of [['#tab-btn-camera', '#grid-camera'], ['#tab-btn-doc', '#grid-doc']]) {
      await page.click(tab);
      const result = await page.$eval(grid, element => ({ text: element.textContent, injected: element.querySelectorAll('img').length }));
      check(`${route}: ${tab} renders metadata as text`, () => { assert.ok(result.text.includes(payload)); assert.equal(result.injected, 0); });
    }
    check(`${route}: no filename or metadata script executed`, () => assert.equal(errors.length, 0));
    assert.equal(await page.evaluate(() => window.__metadataXss), 0);
    assert.equal(await page.$eval('#risk-findings-list', element => element.querySelectorAll('img').length), 0);
  }

  await page.goto(origin + '/en/about/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('remover_metadados_drop_db', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('incoming_files', { keyPath: 'id' });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('incoming_files', 'readwrite');
      tx.objectStore('incoming_files').put({ id: 'pending', files: [new File(['synthetic'], 'expired.txt')], timestamp: Date.now() - 60000 });
      tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = reject;
    };
    request.onerror = reject;
  }));
  await page.goto(origin + '/en/', { waitUntil: 'networkidle0' });
  const leftover = await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('remover_metadados_drop_db', 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('incoming_files', 'readonly');
      const query = tx.objectStore('incoming_files').get('pending');
      query.onsuccess = () => resolve(query.result || null);
      tx.oncomplete = () => db.close(); tx.onerror = reject;
    }; request.onerror = reject;
  }));
  check('Expired cross-page file transfer is deleted', () => assert.equal(leftover, null));

  if (process.env.HEIC_FIXTURE) {
    await upload('#file-input', [{ name: 'synthetic-test.heic', bytes: [...await readFile(process.env.HEIC_FIXTURE)] }]);
    await page.click('.process-one-btn');
    await page.waitForFunction(() => document.querySelector('.status-done'), { timeout: 60000 });
    check('HEIC conversion works under production CSP without unsafe-eval', () => assert.ok(!csp.includes('script-src')));
    const versions = await page.evaluate(() => window.metadataRemoverDecoderVersions?.());
    check('HEIC worker links patched native libraries', () => assert.deepEqual(versions, { libheif: '1.23.7', libde265: '1.1.3' }));
    await upload('#file-input', [{ name: 'invalid.heic', bytes: [1, 2, 3, 4] }]);
    await page.click('.process-one-btn');
    await page.waitForFunction(() => document.querySelector('.status-error'));
    check('Malformed HEIC fails without executing code or hanging the page', () => assert.equal(errors.length, 0));
  }

  await mkdir('artifacts/security-qa', { recursive: true });
  for (const width of [390, 1365]) {
    await page.setViewport({ width, height: 900 });
    for (const route of ['/en/about/', '/en/contact/', '/sobre/', '/contato/']) {
      await page.goto(origin + route, { waitUntil: 'networkidle0' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      check(`${route} at ${width}px: no horizontal page overflow`, () => assert.equal(overflow, false));
      await page.screenshot({ path: `artifacts/security-qa/${route.replaceAll('/', '-')}-${width}.png`, fullPage: true });
    }
  }
  check('No unhandled browser errors', () => assert.deepEqual(errors, []));
  check('No production CSP violations', () => assert.deepEqual(csp, []));
  check('Processing loads no external scripts on a local deployment', () => assert.equal(external.filter(request => request.type === 'script').length, 0));
  check('Synthetic private markers never occur in external requests', () => assert.ok(!JSON.stringify(external).includes('__synthetic_private_marker__') && !JSON.stringify(external).includes(payload)));
  console.log(`${checks.length} production-browser security checks passed.\n${checks.map(name => `- ${name}`).join('\n')}`);
  if (!process.env.HEIC_FIXTURE) console.log('HEIC production-CSP case not run; set HEIC_FIXTURE to include a real container.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
