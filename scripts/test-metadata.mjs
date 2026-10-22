import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { exiftoolPath } from 'exiftool-vendored';
import JSZip from 'jszip';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

// Run against `astro dev --background`. External traffic is intercepted so that
// fixture coordinates and filenames cannot reach analytics or map providers.
const origin = process.env.TEST_ORIGIN || 'http://localhost:4321';
const dir = await mkdtemp(path.join(tmpdir(), 'metadata-verification-'));
const tool = await exiftoolPath();
const exif = (...args) => execFileSync(tool, args, { encoding: 'utf8' });
const metadata = file => JSON.parse(exif('-j', '-G1', '-n', file))[0];
const rows = [];
const checks = [];
const check = (name, fn) => { fn(); checks.push(name); };
const fixtures = [];
const width = 48, height = 32;
const pixels = Buffer.alloc(width * height * 3);
for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 73 + (i >> 4) * 19) % 256;
const image = () => sharp(pixels, { raw: { width, height, channels: 3 } });
for (const ext of ['jpg', 'png', 'webp', 'avif', 'tiff', 'gif']) {
  const input = path.join(dir, `fixture.${ext}`);
  let pipeline = image();
  if (ext === 'jpg') pipeline = pipeline.jpeg({ quality: 91 });
  else pipeline = pipeline[ext]();
  await pipeline.toFile(input);
  if (['jpg', 'png', 'webp', 'avif', 'tiff'].includes(ext)) {
    exif('-overwrite_original', '-Artist=Audit Test Author', '-GPSLatitude=23.55', '-GPSLatitudeRef=S', '-GPSLongitude=46.63', '-GPSLongitudeRef=W', input);
  } else exif('-overwrite_original', '-Comment=Audit Test Comment', input);
  fixtures.push({ ext, input });
}
// Small uncompressed BMP with the same generated RGB pixels.
const stride = Math.ceil(width * 3 / 4) * 4;
const bmp = Buffer.alloc(54 + stride * height);
bmp.write('BM'); bmp.writeUInt32LE(bmp.length, 2); bmp.writeUInt32LE(54, 10);
bmp.writeUInt32LE(40, 14); bmp.writeInt32LE(width, 18); bmp.writeInt32LE(height, 22);
bmp.writeUInt16LE(1, 26); bmp.writeUInt16LE(24, 28);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const src = (y * width + x) * 3, dst = 54 + (height - 1 - y) * stride + x * 3;
  bmp[dst] = pixels[src + 2]; bmp[dst + 1] = pixels[src + 1]; bmp[dst + 2] = pixels[src];
}
await writeFile(path.join(dir, 'fixture.bmp'), bmp);
fixtures.push({ ext: 'bmp', input: path.join(dir, 'fixture.bmp') });
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32"><title>Audit Test Author</title><desc>Audit Test Description</desc><metadata>Audit Test Metadata</metadata><rect width="48" height="32" fill="red"/></svg>';
await writeFile(path.join(dir, 'fixture.svg'), svg);
fixtures.push({ ext: 'svg', input: path.join(dir, 'fixture.svg') });
if (process.env.HEIC_FIXTURE) {
  const input = path.join(dir, 'fixture.heic');
  await writeFile(input, await readFile(process.env.HEIC_FIXTURE));
  exif('-overwrite_original', '-Artist=Audit Test Author', input);
  fixtures.push({ ext: 'heic', input });
}

const browser = await puppeteer.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : process.platform === 'darwin' ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {}),
});
const page = await browser.newPage();
const external = [];
await page.setRequestInterception(true);
page.on('request', request => {
  if (request.url().startsWith(origin) || /^(data:|blob:|about:)/.test(request.url())) return request.continue();
  external.push(request.url());
  const type = request.resourceType();
  return request.respond({ status: 200,
    contentType: type === 'script' ? 'application/javascript' : type === 'stylesheet' ? 'text/css' : 'text/html',
    body: type === 'script' || type === 'stylesheet' ? '' : '<!doctype html><title>Intercepted external request</title>',
  });
});
const consoleErrors = [];
page.on('pageerror', err => consoleErrors.push(String(err)));

async function clean(input, format = 'original') {
  const bytes = [...await readFile(input)];
  const result = await page.evaluate(async ({ bytes, name, format }) => {
    const { removeMetadata } = await import('/src/scripts/metadataRemover.js');
    const result = await removeMetadata(new File([new Uint8Array(bytes)], name), undefined, { format });
    return { name: result.filename, mime: result.blob.type, bytes: [...new Uint8Array(await result.blob.arrayBuffer())] };
  }, { bytes, name: path.basename(input), format });
  const output = path.join(dir, `out-${format}-${result.name}`);
  await writeFile(output, Buffer.from(result.bytes));
  return { output, name: result.name, mime: result.mime };
}
const selectedTags = tags => Object.fromEntries(Object.entries(tags).filter(([key]) => /:(Artist|GPSLatitude|GPSLongitude|Comment|Title|Author|Creator|Producer|Subject|Keywords)$/.test(key)));
function pngChunks(buffer, type) {
  const chunks = [];
  for (let pos = 8; pos + 12 <= buffer.length;) {
    const n = buffer.readUInt32BE(pos), kind = buffer.toString('ascii', pos + 4, pos + 8);
    if (kind === type) chunks.push(buffer.subarray(pos, pos + n + 12));
    pos += n + 12;
  }
  return Buffer.concat(chunks);
}
try {
  await page.goto(origin, { waitUntil: 'networkidle0' });
  for (const { ext, input } of fixtures) {
    const before = selectedTags(metadata(input));
    const { output, name, mime } = await clean(input);
    const tags = metadata(output), after = selectedTags(tags);
    check(`${ext}: selected personal tags removed`, () => assert.equal(Object.keys(after).length, 0));
    if (!['bmp', 'svg'].includes(ext)) assert.ok(Object.keys(before).length, `${ext}: fixture must contain metadata`);
    const expectedExt = ['heic'].includes(ext) ? 'jpg' : ['tiff', 'gif', 'bmp'].includes(ext) ? 'png' : ext;
    check(`${ext}: documented default output`, () => assert.ok(name.endsWith(`.${ext === 'avif' && mime === 'image/webp' ? 'webp' : expectedExt}`)));
    let pixelComparison = 'not compared';
    if (!['svg', 'heic'].includes(ext)) {
      const a = await (ext === 'bmp' ? image() : sharp(input)).ensureAlpha().raw().toBuffer();
      const b = await sharp(output).ensureAlpha().raw().toBuffer();
      let changed = 0;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) changed++;
      pixelComparison = `${changed} of ${a.length} channel values changed`;
      if (['png', 'bmp', 'gif'].includes(ext)) check(`${ext}: fixture pixels preserved`, () => assert.ok(b.equals(a), `${ext}: decoded pixel mismatch`));
    }
    if (ext === 'png') {
      const inputBytes = await readFile(input), outputBytes = await readFile(output);
      check('PNG: original IDAT bytes preserved', () => assert.deepEqual(pngChunks(outputBytes, 'IDAT'), pngChunks(inputBytes, 'IDAT')));
    }
    rows.push({ format: ext, output: name.split('.').pop(), mime, before, after, pixelComparison,
      inputSha256: createHash('sha256').update(await readFile(input)).digest('hex'),
      outputSha256: createHash('sha256').update(await readFile(output)).digest('hex') });
  }
  // A format explicitly selected by the user always takes the conversion path.
  for (const format of ['jpg', 'png', 'webp', 'avif']) {
    const result = await clean(fixtures.find(f => f.ext === 'png').input, format);
    check(`PNG → ${format}: personal tags absent`, () => assert.equal(Object.keys(selectedTags(metadata(result.output))).length, 0));
  }
  for (const ext of ['gif', 'tiff']) {
    const input = path.join(dir, `animated.${ext}`);
    await sharp(Buffer.concat([pixels, Buffer.from(pixels.map(n => 255 - n))]), {
      raw: { width, height: height * 2, channels: 3, pageHeight: height },
    })[ext]().toFile(input);
    assert.equal((await sharp(input, { animated: true }).metadata()).pages, 2);
    const result = await clean(input);
    const info = await sharp(result.output).metadata();
    check(`${ext}: default PNG has one frame/page`, () => { assert.equal(info.format, 'png'); assert.equal(info.pages || 1, 1); assert.equal(info.height, height); });
  }
  // Transparent pixels survive PNG export; JPEG deliberately composites white.
  const transparent = path.join(dir, 'transparent.png');
  await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(transparent);
  const opaqueResult = await clean(transparent, 'jpg');
  const rgb = await sharp(opaqueResult.output).raw().toBuffer();
  check('JPEG conversion composites transparency on white', () => assert.ok(rgb.every(value => value >= 254)));
  // Exercise Office package properties and independently inspect the resulting ZIP.
  for (const ext of ['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp']) {
    const zip = new JSZip();
    zip.file('docProps/core.xml', '<core>Audit Test Author</core>');
    zip.file('docProps/app.xml', '<app>Audit Test Company</app>');
    zip.file('docProps/custom.xml', '<custom>Audit Test Secret</custom>');
    zip.file('docProps/thumbnail.png', 'Audit Test Thumbnail');
    zip.file('meta.xml', '<meta>Audit Test Author</meta>');
    zip.file('word/comments.xml', '<comment>Audit Test Comment</comment>');
    const input = path.join(dir, `fixture.${ext}`);
    await writeFile(input, await zip.generateAsync({ type: 'nodebuffer' }));
    const result = await clean(input);
    const outputZip = await JSZip.loadAsync(await readFile(result.output));
    check(`${ext}: document properties cleared`, () => assert.equal(outputZip.file('docProps/custom.xml'), null));
    for (const name of ['docProps/core.xml', 'docProps/app.xml', 'meta.xml']) {
      assert.ok(!(await outputZip.file(name).async('string')).includes('Audit Test'));
    }
    assert.ok((await outputZip.file('word/comments.xml').async('string')).includes('Audit Test Comment'));
    rows.push({ format: ext, output: ext, verified: 'Synthetic package properties cleared; comment entry retained. Not a full document compatibility test.' });
  }
  // PDF standard fields versus custom properties and detached XMP bytes.
  const pdf = await PDFDocument.create(); pdf.addPage(); pdf.setAuthor('Audit Test Author'); pdf.setTitle('Audit Test Title');
  const info = pdf.context.lookup(pdf.context.trailerInfo.Info);
  info.set(PDFName.of('CustomSecret'), PDFString.of('Audit Test Custom Secret'));
  const xmp = pdf.context.stream('<x:xmpmeta xmlns:x="adobe:ns:meta/">Audit Test XMP Author</x:xmpmeta>', { Type: 'Metadata', Subtype: 'XML' });
  pdf.catalog.set(PDFName.of('Metadata'), pdf.context.register(xmp));
  const pdfInput = path.join(dir, 'fixture.pdf'); await writeFile(pdfInput, await pdf.save());
  const pdfOut = await clean(pdfInput);
  const pdfTags = metadata(pdfOut.output);
  check('PDF: standard author and title cleared', () => { assert.ok(!pdfTags['PDF:Author']); assert.ok(!pdfTags['PDF:Title']); });
  rows.push({ format: 'pdf', output: 'pdf', before: selectedTags(metadata(pdfInput)), after: selectedTags(pdfTags), customSecretRemains: pdfTags['PDF:CustomSecret'] === 'Audit Test Custom Secret', detachedXmpBytesRemain: (await readFile(pdfOut.output)).includes(Buffer.from('Audit Test XMP Author')) });
  // ID3 envelope around synthetic audio bytes: not an audio playback test.
  const audio = Buffer.from([0xff, 0xfb, 0x90, 0x64, 1, 2, 3, 4]);
  const id3 = Buffer.from([73, 68, 51, 3, 0, 0, 0, 0, 0, 0]);
  const tail = Buffer.alloc(128); tail.write('TAGAudit Test Artist');
  const mp3Input = path.join(dir, 'fixture.mp3'); await writeFile(mp3Input, Buffer.concat([id3, audio, tail]));
  const mp3Out = await clean(mp3Input);
  const mp3Bytes = await readFile(mp3Out.output);
  check('MP3: ID3v1/v2 envelopes removed; audio bytes preserved', () => assert.deepEqual(mp3Bytes, audio));
  rows.push({ format: 'mp3', output: 'mp3', verified: 'Synthetic ID3v1/v2 envelopes removed; enclosed bytes unchanged. Other tag families and playback not checked.' });
  // Network regression: inspect sample, visit GPS tab, opt in, switch files, clear.
  for (const route of ['/ver-metadados/', '/en/metadata-viewer/']) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle0' });
    const start = external.length;
    await page.click('#viewer-sample-btn');
    await page.waitForFunction(() => document.querySelector('#gps-lat-val')?.textContent !== '—');
    await page.click('#tab-btn-gps');
    await new Promise(resolve => setTimeout(resolve, 250));
    check(`${route}: no map request before consent`, () => assert.equal(external.slice(start).filter(url => /openstreetmap|google\.com\/maps/.test(url)).length, 0));
    assert.equal(await page.$eval('#gps-map-iframe', el => el.getAttribute('src')), null);
    const snapshot = await page.$eval('#gps-map-iframe', el => el.referrerPolicy);
    assert.equal(snapshot, 'no-referrer');
    const [mapRequest] = await Promise.all([
      page.waitForRequest(request => request.url().startsWith('https://www.openstreetmap.org/export/embed.html')),
      page.click('#btn-load-map'),
    ]);
    const marker = new URL(mapRequest.url()).searchParams.get('marker');
    const displayedLatitude = await page.$eval('#gps-lat-val', el => el.textContent);
    check(`${route}: request shares selected coordinates only after consent`, () => assert.ok(marker.startsWith(String(Number(displayedLatitude)))));
    await page.click('#viewer-sample-btn');
    await page.waitForFunction(() => document.querySelector('#gps-map-iframe')?.getAttribute('src') === null);
    check(`${route}: switching files resets consent`, () => assert.equal(external.slice(start).filter(url => url.startsWith('https://www.openstreetmap.org/export/embed.html')).length, 1));
    await page.click('#viewer-clear-all-btn');
    assert.equal(await page.$eval('#gps-map-iframe', el => el.getAttribute('src')), null);
  }
  assert.deepEqual(consoleErrors, []);
  const engine = await readFile('src/scripts/metadataRemover.js');
  const report = {
    generatedAt: new Date().toISOString(),
    engineSha256: createHash('sha256').update(engine).digest('hex'),
    environment: { browser: await browser.version(), exiftool: exif('-ver').trim(), sharp: sharp.versions.sharp, node: process.version },
    method: 'Maintainer-run browser fixtures, checked with ExifTool, sharp and direct ZIP/byte inspection. Not a third-party security audit or proof for every file.',
    checks, results: rows,
    notVerified: ['Every C2PA variant or AI generator', 'Watermarks or steganography', 'Every browser, color profile, malformed file or encryption mode', 'Full Office application compatibility', 'Video playback and complete metadata coverage', ...(process.env.HEIC_FIXTURE ? [] : ['HEIC (set HEIC_FIXTURE to exercise a real container)'])],
  };
  await writeFile(path.join(dir, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  if (process.argv.includes('--publish')) await writeFile('public/verification-results.json', JSON.stringify(report, null, 2) + '\n');
  console.log(`${checks.length} checks passed. Results and outputs: ${dir}`);
} finally {
  await browser.close();
}
