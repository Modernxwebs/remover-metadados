/**
 * metadataRemover.js
 * Browser-side metadata removal engine.
 * All processing is local — no file ever leaves the device.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Read a File as an ArrayBuffer
 * @param {File} file
 * @returns {Promise<ArrayBuffer>}
 */
async function readAsArrayBuffer(file) {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {ArrayBuffer} */(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Re-encode an image through a canvas to strip metadata.
 * Works for JPEG, PNG, WebP, GIF, BMP, HEIC (after conversion), TIFF (limited).
 * @param {File} file
 * @param {string} outputMime
 * @param {number} [quality]
 * @returns {Promise<Blob>}
 */
function stripViaCanvas(file, outputMime = 'image/jpeg', quality = 0.95) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        outputMime,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

// ─── PNG chunk stripper ─────────────────────────────────────────────────────

/**
 * Strip all metadata chunks from a PNG file.
 * Keeps: IHDR, IDAT, IEND, PLTE, tRNS, gAMA, cHRM, sRGB, sBIT, bKGD, pHYs, sPLT, hIST
 * Removes: tEXt, iTXt, zTXt, eXIf, tIME, and any private chunks
 * @param {ArrayBuffer} buffer
 * @returns {ArrayBuffer}
 */
function stripPngMetadata(buffer) {
  const view = new DataView(buffer);
  const KEEP = new Set(['IHDR', 'IDAT', 'IEND', 'PLTE', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'sBIT', 'bKGD', 'pHYs', 'sPLT', 'hIST', 'acTL', 'fcTL', 'fdAT']);

  // Verify PNG signature
  const PNG_SIG = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== PNG_SIG[i]) throw new Error('Not a valid PNG file');
  }

  const chunks = [];
  let offset = 8;
  while (offset < buffer.byteLength) {
    const length = view.getUint32(offset);
    const typeBytes = new Uint8Array(buffer, offset + 4, 4);
    const type = String.fromCharCode(...typeBytes);
    const chunkEnd = offset + 4 + 4 + length + 4; // len + type + data + crc

    if (KEEP.has(type)) {
      chunks.push(new Uint8Array(buffer, offset, chunkEnd - offset));
    }
    offset = chunkEnd;
    if (type === 'IEND') break;
  }

  // Reassemble
  const total = 8 + chunks.reduce((sum, c) => sum + c.byteLength, 0);
  const out = new Uint8Array(total);
  out.set(PNG_SIG, 0);
  let pos = 8;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.byteLength;
  }
  return out.buffer;
}

// ─── SVG metadata stripper ──────────────────────────────────────────────────

/**
 * Strip metadata from SVG by removing <metadata>, <title>, <desc> elements
 * and non-essential attributes.
 * @param {string} svgText
 * @returns {string}
 */
function stripSvgMetadata(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;

  // Remove metadata, title, desc, and script elements
  const toRemove = root.querySelectorAll('metadata, desc, title, script');
  toRemove.forEach(el => el.remove());

  // Remove common metadata & editor attributes from root SVG element
  const metaAttrs = [
    'inkscape:version', 'sodipodi:docname', 'dc:format', 'dc:type',
    'cc:license', 'rdf:about', 'xmlns:dc', 'xmlns:cc', 'xmlns:rdf', 'xmlns:inkscape',
    'xmlns:sodipodi', 'xmlns:xlink', 'adobe:adobe-illustrator'
  ];
  metaAttrs.forEach(attr => root.removeAttribute(attr));

  return new XMLSerializer().serializeToString(doc);
}

// ─── PDF metadata stripper ─────────────────────────────────────────────────

/**
 * Strip metadata from PDF using pdf-lib.
 * Clears Info dictionary fields and removes XMP streams.
 * @param {ArrayBuffer} buffer
 * @returns {Promise<Uint8Array>}
 */
async function stripPdfMetadata(buffer) {
  const { PDFDocument, PDFName } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });

  // Clear all Info dictionary fields
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));

  // Remove XMP metadata and PieceInfo streams if present
  try {
    const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
    if (catalog && typeof catalog.delete === 'function' && typeof PDFName?.of === 'function') {
      catalog.delete(PDFName.of('Metadata'));
      catalog.delete(PDFName.of('PieceInfo'));
    }
  } catch (err) {
    console.warn('Could not remove PDF catalog metadata stream:', err);
  }

  return pdfDoc.save();
}

// ─── DOCX / XLSX / PPTX / ODT / ODS / ODP (Office Open XML & ODF) ───────────

/**
 * Strip metadata from Office files (docx, xlsx, pptx, odt, ods, odp).
 * Removes docProps/core.xml, docProps/app.xml, meta.xml, and thumbnails.
 * @param {ArrayBuffer} buffer
 * @returns {Promise<Blob>}
 */
async function stripOfficeMetadata(buffer) {
  const JSZip = await getJSZip();
  const zip = await JSZip.loadAsync(buffer);

  const CLEAN_CORE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;

  const CLEAN_APP = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Office</Application>
</Properties>`;

  const CLEAN_ODF_META = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  office:version="1.2">
  <office:meta></office:meta>
</office:document-meta>`;

  // Microsoft Office (docx, xlsx, pptx)
  if (zip.files['docProps/core.xml']) {
    zip.file('docProps/core.xml', CLEAN_CORE);
  }
  if (zip.files['docProps/app.xml']) {
    zip.file('docProps/app.xml', CLEAN_APP);
  }
  if (zip.files['docProps/custom.xml']) {
    zip.remove('docProps/custom.xml');
  }
  if (zip.files['docProps/thumbnail.jpeg']) zip.remove('docProps/thumbnail.jpeg');
  if (zip.files['docProps/thumbnail.png']) zip.remove('docProps/thumbnail.png');

  // OpenDocument Format (odt, ods, odp)
  if (zip.files['meta.xml']) {
    zip.file('meta.xml', CLEAN_ODF_META);
  }
  if (zip.files['Thumbnails/thumbnail.png']) {
    zip.remove('Thumbnails/thumbnail.png');
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// ─── Main dispatch ──────────────────────────────────────────────────────────

/**
 * Remove metadata from a single File.
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{ blob: Blob; filename: string }>}
 */
export async function removeMetadata(file, onProgress) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  onProgress?.(10);

  // ── Images via canvas re-encode ──────────────────────────
  if (['jpg', 'jpeg'].includes(ext)) {
    const blob = await stripViaCanvas(file, 'image/jpeg', 0.95);
    onProgress?.(100);
    return { blob, filename: `${baseName}.jpg` };
  }

  if (ext === 'webp') {
    const blob = await stripViaCanvas(file, 'image/webp', 0.95);
    onProgress?.(100);
    return { blob, filename: `${baseName}.webp` };
  }

  if (ext === 'gif') {
    const blob = await stripViaCanvas(file, 'image/png'); // GIF → PNG (strips all)
    onProgress?.(100);
    return { blob, filename: `${baseName}.png` };
  }

  if (ext === 'bmp') {
    const blob = await stripViaCanvas(file, 'image/png');
    onProgress?.(100);
    return { blob, filename: `${baseName}.png` };
  }

  if (['heic', 'heif'].includes(ext)) {
    onProgress?.(15);
    try {
      const decodeHeic = await getHeicDecoder();
      if (decodeHeic) {
        onProgress?.(40);
        const jpegBlob = await decodeHeic({
          blob: file,
          type: 'image/jpeg',
          quality: 0.95,
        });
        onProgress?.(80);

        // Re-encode via canvas for 100% EXIF & GPS sanitization
        const jpegFile = new File([jpegBlob], `${baseName}.jpg`, { type: 'image/jpeg' });
        const blob = await stripViaCanvas(jpegFile, 'image/jpeg', 0.95).catch(() => jpegBlob);
        onProgress?.(100);
        return { blob, filename: `${baseName}.jpg` };
      }
    } catch (err) {
      console.warn('heic-to conversion error, trying native canvas fallback:', err);
    }

    // Fallback: try canvas directly (works in Safari/iOS/macOS with native HEIC decoding)
    try {
      const blob = await stripViaCanvas(file, 'image/jpeg', 0.95);
      onProgress?.(100);
      return { blob, filename: `${baseName}.jpg` };
    } catch (fallbackErr) {
      throw new Error('Falha ao processar arquivo HEIC. Não foi possível decodificar a imagem.');
    }
  }

  // ── PNG chunk-level strip with canvas fallback ───────────
  if (ext === 'png') {
    try {
      const buffer = await readAsArrayBuffer(file);
      onProgress?.(40);
      const cleaned = stripPngMetadata(buffer);
      onProgress?.(100);
      return { blob: new Blob([cleaned], { type: 'image/png' }), filename: `${baseName}.png` };
    } catch (pngErr) {
      console.warn('PNG chunk strip failed, falling back to canvas re-encode:', pngErr);
      const blob = await stripViaCanvas(file, 'image/png');
      onProgress?.(100);
      return { blob, filename: `${baseName}.png` };
    }
  }

  // ── TIFF — decode via UTIF or fallback to native canvas ──
  if (['tif', 'tiff'].includes(ext)) {
    try {
      const UTIF = await getUtif();
      if (UTIF) {
        onProgress?.(30);
        const buffer = await readAsArrayBuffer(file);
        const ifds = UTIF.decode(buffer);
        if (ifds && ifds.length > 0) {
          const first = ifds[0];
          UTIF.decodeImage(buffer, first);
          const rgba = UTIF.toRGBA8(first);
          const canvas = document.createElement('canvas');
          canvas.width = first.width;
          canvas.height = first.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = ctx.createImageData(first.width, first.height);
            imgData.data.set(rgba);
            ctx.putImageData(imgData, 0, 0);
            onProgress?.(80);
            const blob = await new Promise((resolve, reject) => {
              canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png');
            });
            onProgress?.(100);
            return { blob, filename: `${baseName}.png` };
          }
        }
      }
    } catch (utifErr) {
      console.warn('UTIF decode failed, attempting canvas fallback:', utifErr);
    }

    // Native browser fallback (Safari/macOS)
    try {
      const blob = await stripViaCanvas(file, 'image/png');
      onProgress?.(100);
      return { blob, filename: `${baseName}.png` };
    } catch {
      throw new Error('TIFF não pôde ser processado neste navegador');
    }
  }

  // ── SVG ──────────────────────────────────────────────────
  if (ext === 'svg') {
    const text = await file.text();
    onProgress?.(50);
    const cleaned = stripSvgMetadata(text);
    onProgress?.(100);
    return { blob: new Blob([cleaned], { type: 'image/svg+xml' }), filename: `${baseName}.svg` };
  }

  // ── PDF ──────────────────────────────────────────────────
  if (ext === 'pdf') {
    const buffer = await readAsArrayBuffer(file);
    onProgress?.(30);
    const cleaned = await stripPdfMetadata(buffer);
    onProgress?.(100);
    return { blob: new Blob([cleaned], { type: 'application/pdf' }), filename: `${baseName}.pdf` };
  }

  // ── Office Open XML ──────────────────────────────────────
  if (['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    const buffer = await readAsArrayBuffer(file);
    onProgress?.(30);
    const blob = await stripOfficeMetadata(buffer);
    onProgress?.(100);
    return { blob, filename: file.name };
  }

  // ── Audio: MP3 / M4A / AAC — strip ID3 by re-reading ───
  if (['mp3'].includes(ext)) {
    // For MP3: strip ID3 tags by finding audio data start
    const buffer = await readAsArrayBuffer(file);
    onProgress?.(50);
    const stripped = stripMp3Id3(buffer);
    onProgress?.(100);
    return { blob: new Blob([stripped], { type: 'audio/mpeg' }), filename: file.name };
  }

  // ── MP4 / MOV / MKV / AVI — metadata strip via mp4box ──
  if (['mp4', 'm4v', 'mov'].includes(ext)) {
    try {
      const blob = await stripMp4Metadata(file);
      onProgress?.(100);
      return { blob, filename: file.name };
    } catch {
      throw new Error(`Não foi possível processar o arquivo de vídeo: ${file.name}`);
    }
  }

  // ── Fallback: unsupported format ──────────────────────────
  throw new Error(`Formato não suportado: .${ext}`);
}

// ─── MP3 ID3 stripper ──────────────────────────────────────────────────────

/**
 * Strip ID3v2 tags from the beginning of an MP3 file.
 * ID3v1 tags (last 128 bytes) are also stripped.
 * @param {ArrayBuffer} buffer
 * @returns {ArrayBuffer}
 */
function stripMp3Id3(buffer) {
  const view = new DataView(buffer);
  let start = 0;

  // Strip ID3v2 header (starts with "ID3")
  if (
    buffer.byteLength >= 10 &&
    view.getUint8(0) === 0x49 && // I
    view.getUint8(1) === 0x44 && // D
    view.getUint8(2) === 0x33    // 3
  ) {
    // ID3v2 size is encoded as 4 sync-safe bytes at offset 6..9
    const b1 = view.getUint8(6) & 0x7f;
    const b2 = view.getUint8(7) & 0x7f;
    const b3 = view.getUint8(8) & 0x7f;
    const b4 = view.getUint8(9) & 0x7f;
    const flags = view.getUint8(5);
    const hasFooter = (flags & 0x10) !== 0;
    const tagSize = (b1 << 21) | (b2 << 14) | (b3 << 7) | b4;
    start = Math.min(10 + tagSize + (hasFooter ? 10 : 0), buffer.byteLength);
  }

  // Strip ID3v1 tail (last 128 bytes if starts with "TAG")
  let end = buffer.byteLength;
  if (
    end >= 128 &&
    view.getUint8(end - 128) === 0x54 && // T
    view.getUint8(end - 127) === 0x41 && // A
    view.getUint8(end - 126) === 0x47    // G
  ) {
    end -= 128;
  }

  if (start >= end) return new ArrayBuffer(0);
  return buffer.slice(start, end);
}

// ─── MP4 / MOV / M4V metadata stripper ─────────────────────────────────────

/**
 * Strip MP4/MOV metadata (udta boxes & XMP uuid boxes).
 * @param {File} file
 * @returns {Promise<Blob>}
 */
async function stripMp4Metadata(file) {
  const buffer = await readAsArrayBuffer(file);
  const cleaned = removeMp4Udta(buffer);
  return new Blob([cleaned], { type: file.type || 'video/mp4' });
}

/**
 * Walk MP4 boxes and remove 'udta' user data boxes and XMP 'uuid' boxes.
 * @param {ArrayBuffer} buffer
 * @returns {ArrayBuffer}
 */
function removeMp4Udta(buffer) {
  const data = new Uint8Array(buffer);
  const result = [];

  function readBox(data, offset, end) {
    while (offset < end) {
      if (offset + 8 > end) break;
      const view = new DataView(data.buffer, data.byteOffset + offset);
      let boxSize = view.getUint32(0);
      const typeBytes = [view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7)];
      const boxType = String.fromCharCode(...typeBytes);

      let headerSize = 8;
      if (boxSize === 1) {
        boxSize = Number(view.getBigUint64(8));
        headerSize = 16;
      }
      if (boxSize === 0) boxSize = end - offset; // extends to EOF
      if (boxSize < headerSize) break;

      const boxEnd = offset + boxSize;

      // Skip 'udta' (User Data) box wherever it occurs
      if (boxType === 'udta') {
        offset = boxEnd;
        continue;
      }

      // Skip XMP 'uuid' box: be 7a cf cb 97 a9 42 e8 9c 71 99 94 91 e3 af ac
      if (boxType === 'uuid' && boxSize >= headerSize + 16) {
        const u = data.subarray(offset + headerSize, offset + headerSize + 16);
        if (u[0] === 0xbe && u[1] === 0x7a && u[2] === 0xcf && u[3] === 0xcb) {
          offset = boxEnd;
          continue;
        }
      }

      if (boxType === 'moov') {
        // Recurse into moov
        const headerBytes = data.slice(offset, offset + headerSize);
        const childBytes = collectMoovChildren(data, offset + headerSize, boxEnd);
        const newSize = headerSize + childBytes.byteLength;
        const newHeader = new Uint8Array(headerSize);
        new DataView(newHeader.buffer).setUint32(0, newSize);
        newHeader.set(headerBytes.slice(4), 4);
        result.push(newHeader, new Uint8Array(childBytes));
        offset = boxEnd;
        continue;
      }

      // Keep other boxes as-is
      result.push(data.slice(offset, boxEnd));
      offset = boxEnd;
    }
  }

  function collectMoovChildren(data, offset, end) {
    const parts = [];
    while (offset < end) {
      if (offset + 8 > end) break;
      const view = new DataView(data.buffer, data.byteOffset + offset);
      let boxSize = view.getUint32(0);
      const typeBytes = [view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7)];
      const boxType = String.fromCharCode(...typeBytes);

      let headerSize = 8;
      if (boxSize === 1) {
        boxSize = Number(view.getBigUint64(8));
        headerSize = 16;
      }
      if (boxSize === 0) boxSize = end - offset;
      if (boxSize < headerSize) break;

      const boxEnd = offset + boxSize;

      if (boxType === 'udta') {
        offset = boxEnd;
        continue;
      }

      if (boxType === 'uuid' && boxSize >= headerSize + 16) {
        const u = data.subarray(offset + headerSize, offset + headerSize + 16);
        if (u[0] === 0xbe && u[1] === 0x7a && u[2] === 0xcf && u[3] === 0xcb) {
          offset = boxEnd;
          continue;
        }
      }

      parts.push(data.slice(offset, boxEnd));
      offset = boxEnd;
    }
    const total = parts.reduce((s, p) => s + p.byteLength, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.byteLength; }
    return out.buffer;
  }

  readBox(data, 0, data.byteLength);

  const total = result.reduce((s, p) => s + p.byteLength, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of result) { out.set(part, pos); pos += part.byteLength; }
  return out.buffer;
}

// ─── Bulk ZIP download ──────────────────────────────────────────────────────

let _jszipPromise = null;

/**
 * Load JSZip reliably across environments (window.JSZip, local /vendor/jszip.min.js, CDN, or ESM).
 * @returns {Promise<any>}
 */
export async function getJSZip() {
  if (typeof window !== 'undefined' && window.JSZip) {
    return window.JSZip;
  }

  if (_jszipPromise) return _jszipPromise;

  _jszipPromise = (async () => {
    if (typeof window !== 'undefined' && window.JSZip) {
      return window.JSZip;
    }

    if (typeof document !== 'undefined') {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = '/vendor/jszip.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
        if (typeof window !== 'undefined' && window.JSZip) {
          return window.JSZip;
        }
      } catch {
        // Try CDN fallback
        try {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
          if (typeof window !== 'undefined' && window.JSZip) {
            return window.JSZip;
          }
        } catch (e) {
          console.warn('Script element fallback failed, falling back to dynamic import:', e);
        }
      }
    }

    // Dynamic import fallback (e.g. Node/test environments)
    try {
      const mod = await import('jszip');
      return typeof mod.default === 'function' ? mod.default : (mod.default?.default || mod);
    } catch (err) {
      throw new Error('Não foi possível inicializar o compactador ZIP: ' + err.message);
    }
  })();

  return _jszipPromise;
}

let _heicDecoderPromise = null;

/**
 * Load modern HEIC decoder (heic-to with libheif 1.22.2).
 * Supports modern iPhone HEIC/HEIF containers, grid images, and burst photos.
 * @returns {Promise<((opts: { blob: Blob, type?: string, quality?: number }) => Promise<Blob>) | null>}
 */
export async function getHeicDecoder() {
  if (_heicDecoderPromise) return _heicDecoderPromise;

  _heicDecoderPromise = (async () => {
    // 1. Try ESM dynamic import
    try {
      const mod = await import('heic-to');
      if (typeof mod.heicTo === 'function') {
        return mod.heicTo;
      }
    } catch (e) {
      console.warn('Dynamic import of heic-to failed, attempting CDN fallback:', e);
    }

    // 2. Fallback to CDN IIFE injection
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (typeof window.HeicTo === 'function') {
        return window.HeicTo;
      }
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/iife/heic-to.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
        if (typeof window.HeicTo === 'function') {
          return window.HeicTo;
        }
      } catch (cdnErr) {
        console.error('All heic-to loaders failed:', cdnErr);
      }
    }

    return null;
  })();

  return _heicDecoderPromise;
}

let _utifPromise = null;

/**
 * Load UTIF library reliably (ESM dynamic import with fallback).
 * @returns {Promise<any>}
 */
export async function getUtif() {
  if (_utifPromise) return _utifPromise;

  _utifPromise = (async () => {
    try {
      const mod = await import('utif');
      return mod.default || mod;
    } catch (e) {
      console.warn('Dynamic import of utif failed, attempting CDN fallback:', e);
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (typeof window.UTIF !== 'undefined') return window.UTIF;
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
        if (typeof window.UTIF !== 'undefined') return window.UTIF;
      } catch (cdnErr) {
        console.error('All UTIF loaders failed:', cdnErr);
      }
    }

    return null;
  })();

  return _utifPromise;
}

/**
 * Bundle multiple processed Blobs into a ZIP for download.
 * @param {Array<{ blob: Blob; filename: string }>} files
 * @returns {Promise<Blob>}
 */
export async function bundleAsZip(files) {
  const JSZip = await getJSZip();
  const zip = new JSZip();
  const usedNames = new Set();

  for (const { blob, filename } of files) {
    let finalName = filename;
    let counter = 1;
    const dotIdx = filename.lastIndexOf('.');
    const base = dotIdx !== -1 ? filename.slice(0, dotIdx) : filename;
    const ext = dotIdx !== -1 ? filename.slice(dotIdx) : '';

    while (usedNames.has(finalName)) {
      finalName = `${base} (${counter})${ext}`;
      counter++;
    }
    usedNames.add(finalName);
    zip.file(finalName, blob);
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Trigger a file download in the browser.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
