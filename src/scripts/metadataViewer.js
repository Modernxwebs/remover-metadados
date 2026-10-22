/**
 * metadataViewer.js
 * 100% client-side metadata extraction & inspection engine.
 * Inspects EXIF, GPS, IPTC, XMP, PDF, Office, Video, and Audio metadata locally in the browser.
 * Supports both pt-BR and en locales.
 */

import { getJSZip } from './metadataRemover.js';

// Cache exifr promise
let _exifrPromise = null;
export async function getExifr() {
  if (typeof window !== 'undefined' && window.exifr) {
    return window.exifr;
  }
  if (_exifrPromise) return _exifrPromise;

  _exifrPromise = (async () => {
    // 1. Try ESM dynamic import
    try {
      const mod = await import('exifr');
      return mod.default || mod;
    } catch (err) {
      console.warn('Dynamic import of exifr failed, trying vendor script fallback:', err);
    }

    // 2. Try window or vendor script
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (window.exifr) return window.exifr;
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = '/vendor/exifr.full.umd.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
        if (window.exifr) return window.exifr;
      } catch (scriptErr) {
        console.error('Vendor exifr failed:', scriptErr);
      }
    }
    throw new Error('Could not load EXIF parser library.');
  })();

  return _exifrPromise;
}

/**
 * Format bytes to human readable string
 * @param {number} bytes
 * @param {string} [lang]
 * @returns {string}
 */
export function formatBytes(bytes, lang = 'pt-BR') {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return lang === 'en' ? 'Unknown' : 'Desconhecido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

/**
 * Format date to localized string
 * @param {Date | string | number} d
 * @param {string} [lang]
 * @returns {string}
 */
export function formatDate(d, lang = 'pt-BR') {
  if (!d) return lang === 'en' ? 'Not specified' : 'Não informado';
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return String(d);
    const locale = lang === 'en' ? 'en-US' : 'pt-BR';
    return date.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(d);
  }
}

/**
 * Convert decimal degrees to DMS format
 * @param {number} deg
 * @param {boolean} isLat
 * @param {string} [lang]
 * @returns {string}
 */
export function toDms(deg, isLat, lang = 'pt-BR') {
  if (typeof deg !== 'number' || isNaN(deg)) return '';
  const isEn = lang === 'en';
  const dir = isLat
    ? (deg >= 0 ? 'N' : 'S')
    : (deg >= 0 ? (isEn ? 'E' : 'L') : (isEn ? 'W' : 'O'));
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(2);
  return `${d}° ${m}' ${s}" ${dir}`;
}

/**
 * Format exposure time (e.g. 0.004 -> 1/250s)
 * @param {number} t
 * @returns {string}
 */
export function formatExposureTime(t) {
  if (!t || isNaN(t)) return '';
  if (t >= 1) return `${t.toFixed(1)}s`;
  const denom = Math.round(1 / t);
  return `1/${denom}s (${t.toFixed(4)}s)`;
}

/**
 * Read File as ArrayBuffer
 * @param {File} file
 * @returns {Promise<ArrayBuffer>}
 */
export async function readAsArrayBuffer(file) {
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
 * Parse ID3v2 and ID3v1 tags from MP3 ArrayBuffer
 * @param {ArrayBuffer} buffer
 * @param {string} [lang]
 * @returns {Record<string, string>}
 */
export function parseMp3Tags(buffer, lang = 'pt-BR') {
  const isEn = lang === 'en';
  const tags = {};
  const view = new DataView(buffer);

  // Check ID3v2
  if (
    buffer.byteLength >= 10 &&
    view.getUint8(0) === 0x49 && // 'I'
    view.getUint8(1) === 0x44 && // 'D'
    view.getUint8(2) === 0x33    // '3'
  ) {
    const majorVer = view.getUint8(3);
    const flags = view.getUint8(5);
    const tagSize = ((view.getUint8(6) & 0x7f) << 21) |
                    ((view.getUint8(7) & 0x7f) << 14) |
                    ((view.getUint8(8) & 0x7f) << 7) |
                    (view.getUint8(9) & 0x7f);

    let offset = 10;
    if (flags & 0x40 && offset + 4 <= buffer.byteLength) {
      const extSize = view.getUint32(offset);
      offset += extSize;
    }

    const tagEnd = Math.min(10 + tagSize, buffer.byteLength);

    while (offset + 10 < tagEnd) {
      const frameIdBytes = [
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
      ];
      if (frameIdBytes[0] === 0) break;
      const frameId = String.fromCharCode(...frameIdBytes);

      let frameSize = 0;
      if (majorVer === 4) {
        frameSize = ((view.getUint8(offset + 4) & 0x7f) << 21) |
                    ((view.getUint8(offset + 5) & 0x7f) << 14) |
                    ((view.getUint8(offset + 6) & 0x7f) << 7) |
                    (view.getUint8(offset + 7) & 0x7f);
      } else {
        frameSize = view.getUint32(offset + 4);
      }

      if (frameSize <= 0 || offset + 10 + frameSize > buffer.byteLength) break;

      const frameDataOffset = offset + 10;
      if (frameSize > 1) {
        try {
          const encoding = view.getUint8(frameDataOffset);
          const rawBytes = new Uint8Array(buffer, frameDataOffset + 1, frameSize - 1);
          let text = '';
          if (encoding === 0) {
            text = new TextDecoder('iso-8859-1').decode(rawBytes);
          } else if (encoding === 1 || encoding === 2) {
            text = new TextDecoder('utf-16').decode(rawBytes);
          } else {
            text = new TextDecoder('utf-8').decode(rawBytes);
          }
          text = text.replace(/\0+$/, '').trim();

          if (text) {
            if (frameId === 'TIT2') tags[isEn ? 'Title' : 'Título'] = text;
            else if (frameId === 'TPE1') tags[isEn ? 'Artist' : 'Artista'] = text;
            else if (frameId === 'TALB') tags[isEn ? 'Album' : 'Álbum'] = text;
            else if (frameId === 'TYER' || frameId === 'TDRC') tags[isEn ? 'Year' : 'Ano'] = text;
            else if (frameId === 'TCON') tags[isEn ? 'Genre' : 'Gênero'] = text;
            else if (frameId === 'TRCK') tags[isEn ? 'Track' : 'Faixa'] = text;
            else if (frameId === 'COMM') tags[isEn ? 'Comment' : 'Comentário'] = text;
            else if (frameId === 'TCOM') tags[isEn ? 'Composer' : 'Compositor'] = text;
            else if (frameId === 'TSSE') tags[isEn ? 'Encoder Software' : 'Software/Codificador'] = text;
          }
        } catch {}
      }
      offset += 10 + frameSize;
    }
  }

  // Check ID3v1 (last 128 bytes)
  if (buffer.byteLength >= 128 && Object.keys(tags).length === 0) {
    const end = buffer.byteLength;
    if (
      view.getUint8(end - 128) === 0x54 && // 'T'
      view.getUint8(end - 127) === 0x41 && // 'A'
      view.getUint8(end - 126) === 0x47    // 'G'
    ) {
      const dec = new TextDecoder('iso-8859-1');
      tags[isEn ? 'Title' : 'Título'] = dec.decode(new Uint8Array(buffer, end - 125, 30)).replace(/\0+$/, '').trim();
      tags[isEn ? 'Artist' : 'Artista'] = dec.decode(new Uint8Array(buffer, end - 95, 30)).replace(/\0+$/, '').trim();
      tags[isEn ? 'Album' : 'Álbum'] = dec.decode(new Uint8Array(buffer, end - 65, 30)).replace(/\0+$/, '').trim();
      tags[isEn ? 'Year' : 'Ano'] = dec.decode(new Uint8Array(buffer, end - 35, 4)).replace(/\0+$/, '').trim();
    }
  }

  return tags;
}

/**
 * Extract XML text helper
 * @param {string} xmlText
 * @param {string} tagName
 * @returns {string}
 */
function extractXmlTag(xmlText, tagName) {
  const match = xmlText.match(new RegExp(`<[^:]*:?${tagName}[^>]*>([\\s\\S]*?)<\\/[^:]*:?${tagName}>`, 'i'));
  return match ? match[1].trim() : '';
}

/**
 * Parse Office document metadata (DOCX, XLSX, PPTX, ODT, ODS, ODP)
 * @param {ArrayBuffer} buffer
 * @param {string} [lang]
 * @returns {Promise<Record<string, string>>}
 */
export async function parseOfficeMetadata(buffer, lang = 'pt-BR') {
  const isEn = lang === 'en';
  const JSZip = await getJSZip();
  const zip = await JSZip.loadAsync(buffer);
  const data = {};

  // Microsoft Office core.xml
  if (zip.files['docProps/core.xml']) {
    const core = await zip.file('docProps/core.xml').async('text');
    const title = extractXmlTag(core, 'title');
    const creator = extractXmlTag(core, 'creator');
    const lastModifiedBy = extractXmlTag(core, 'lastModifiedBy');
    const revision = extractXmlTag(core, 'revision');
    const created = extractXmlTag(core, 'created');
    const modified = extractXmlTag(core, 'modified');
    const description = extractXmlTag(core, 'description');
    const subject = extractXmlTag(core, 'subject');
    const keywords = extractXmlTag(core, 'keywords');

    if (title) data[isEn ? 'Title' : 'Título'] = title;
    if (creator) data[isEn ? 'Original Author' : 'Autor Original'] = creator;
    if (lastModifiedBy) data[isEn ? 'Last Modified By' : 'Última Modificação Por'] = lastModifiedBy;
    if (revision) data[isEn ? 'Revision Number' : 'Número de Revisão'] = revision;
    if (created) data[isEn ? 'Creation Date' : 'Data de Criação'] = formatDate(created, lang);
    if (modified) data[isEn ? 'Last Modification Date' : 'Data da Última Modificação'] = formatDate(modified, lang);
    if (subject) data[isEn ? 'Subject' : 'Assunto'] = subject;
    if (description) data[isEn ? 'Description' : 'Descrição'] = description;
    if (keywords) data[isEn ? 'Keywords' : 'Palavras-chave'] = keywords;
  }

  // Microsoft Office app.xml
  if (zip.files['docProps/app.xml']) {
    const app = await zip.file('docProps/app.xml').async('text');
    const appName = extractXmlTag(app, 'Application');
    const appVer = extractXmlTag(app, 'AppVersion');
    const company = extractXmlTag(app, 'Company');
    const totalTime = extractXmlTag(app, 'TotalTime');
    const pages = extractXmlTag(app, 'Pages');
    const words = extractXmlTag(app, 'Words');

    if (appName) data[isEn ? 'Application' : 'Aplicativo Gerador'] = appVer ? `${appName} (v${appVer})` : appName;
    if (company) data[isEn ? 'Company / Organization' : 'Empresa / Organização'] = company;
    if (totalTime) data[isEn ? 'Total Editing Time' : 'Tempo Total de Edição'] = isEn ? `${totalTime} minutes` : `${totalTime} minutos`;
    if (pages) data[isEn ? 'Total Pages' : 'Total de Páginas'] = pages;
    if (words) data[isEn ? 'Total Words' : 'Total de Palavras'] = words;
  }

  // OpenDocument meta.xml
  if (zip.files['meta.xml']) {
    const meta = await zip.file('meta.xml').async('text');
    const creator = extractXmlTag(meta, 'creator') || extractXmlTag(meta, 'initial-creator');
    const title = extractXmlTag(meta, 'title');
    const generator = extractXmlTag(meta, 'generator');
    const creationDate = extractXmlTag(meta, 'creation-date');
    const date = extractXmlTag(meta, 'date');
    const cycles = extractXmlTag(meta, 'editing-cycles');

    if (title) data[isEn ? 'Title' : 'Título'] = title;
    if (creator) data[isEn ? 'Author / Creator' : 'Autor / Criador'] = creator;
    if (generator) data[isEn ? 'Generating Software' : 'Software Gerador'] = generator;
    if (creationDate) data[isEn ? 'Creation Date' : 'Data de Criação'] = formatDate(creationDate, lang);
    if (date) data[isEn ? 'Last Modification Date' : 'Data da Última Modificação'] = formatDate(date, lang);
    if (cycles) data[isEn ? 'Editing Cycles' : 'Ciclos de Edição'] = cycles;
  }

  return data;
}

/**
 * Parse PDF document metadata using pdf-lib
 * @param {ArrayBuffer} buffer
 * @param {string} [lang]
 * @returns {Promise<Record<string, string>>}
 */
export async function parsePdfMetadata(buffer, lang = 'pt-BR') {
  const isEn = lang === 'en';
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
  const data = {};

  const title = pdfDoc.getTitle();
  const author = pdfDoc.getAuthor();
  const subject = pdfDoc.getSubject();
  const keywords = pdfDoc.getKeywords();
  const producer = pdfDoc.getProducer();
  const creator = pdfDoc.getCreator();
  const creationDate = pdfDoc.getCreationDate();
  const modDate = pdfDoc.getModificationDate();
  const pageCount = pdfDoc.getPageCount();

  if (title) data[isEn ? 'Title' : 'Título'] = title;
  if (author) data[isEn ? 'Author' : 'Autor'] = author;
  if (subject) data[isEn ? 'Subject' : 'Assunto'] = subject;
  if (keywords) {
    data[isEn ? 'Keywords' : 'Palavras-chave'] = Array.isArray(keywords) ? keywords.join(', ') : String(keywords);
  }
  if (producer) data[isEn ? 'PDF Producer' : 'Produtor PDF (Producer)'] = producer;
  if (creator) data[isEn ? 'PDF Creator / Software' : 'Criador / Software (Creator)'] = creator;
  if (creationDate) data[isEn ? 'Creation Date' : 'Data de Criação'] = formatDate(creationDate, lang);
  if (modDate) data[isEn ? 'Last Modification Date' : 'Data da Última Modificação'] = formatDate(modDate, lang);
  if (pageCount) data[isEn ? 'Number of Pages' : 'Número de Páginas'] = String(pageCount);

  return data;
}

/**
 * Main inspection function for any file.
 * Returns structured metadata sections, GPS info, privacy risk evaluation, and raw key-values.
 * @param {File} file
 * @param {string} [lang]
 * @returns {Promise<MetadataInspectionResult>}
 */
export async function inspectFileMetadata(file, lang = 'pt-BR') {
  const isEn = lang === 'en';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff', 'gif', 'bmp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isOffice = ['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext);
  const isAudio = ['mp3', 'm4a', 'wav'].includes(ext);
  const isVideo = ['mp4', 'mov', 'm4v', 'webm'].includes(ext);

  /** @type {Record<string, string>} */
  const general = {
    [isEn ? 'File Name' : 'Nome do Arquivo']: file.name,
    [isEn ? 'File Size' : 'Tamanho']: formatBytes(file.size, lang),
    [isEn ? 'Format / Extension' : 'Formato / Extensão']: ext.toUpperCase(),
    [isEn ? 'MIME Type' : 'Tipo MIME']: file.type || `application/${ext}`,
    [isEn ? 'Last Modified' : 'Última Modificação']: formatDate(file.lastModified, lang),
  };

  /** @type {Record<string, string>} */
  const camera = {};

  /** @type {Record<string, string>} */
  const documentInfo = {};

  /** @type {Record<string, string>} */
  const mediaInfo = {};

  /** @type {{ latitude: number, longitude: number, altitude?: number, dmsLat: string, dmsLon: string } | null} */
  let gps = null;

  /** @type {Record<string, any>} */
  let rawTags = {};

  // 1. Process Images
  if (isImage) {
    if (ext === 'svg') {
      try {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const root = doc.documentElement;

        const w = root.getAttribute('width');
        const h = root.getAttribute('height');
        const viewBox = root.getAttribute('viewBox');
        if (w && h) general[isEn ? 'Dimensions' : 'Dimensões'] = `${w} × ${h}`;
        if (viewBox) general['ViewBox'] = viewBox;

        const title = doc.querySelector('title')?.textContent?.trim();
        const desc = doc.querySelector('desc')?.textContent?.trim();
        const inkscape = root.getAttribute('inkscape:version');
        const docname = root.getAttribute('sodipodi:docname');

        if (title) documentInfo[isEn ? 'Title' : 'Título'] = title;
        if (desc) documentInfo[isEn ? 'Description' : 'Descrição'] = desc;
        if (inkscape) documentInfo[isEn ? 'Software (Inkscape)' : 'Software (Inkscape)'] = inkscape;
        if (docname) documentInfo[isEn ? 'Original File Name' : 'Nome Original do Arquivo'] = docname;

        rawTags = { title, desc, inkscape, docname, width: w, height: h, viewBox };
      } catch (err) {
        console.warn('SVG metadata parsing error:', err);
      }
    } else {
      try {
        const buffer = await readAsArrayBuffer(file);
        const exifr = await getExifr();
        const parsed = await exifr.parse(buffer, {
          tiff: true,
          xmp: true,
          icc: true,
          iptc: true,
          jfif: true,
          ihdr: true,
        });

        if (parsed) {
          rawTags = { ...parsed };

          // Camera & Device info
          if (parsed.Make) camera[isEn ? 'Make' : 'Fabricante'] = String(parsed.Make);
          if (parsed.Model) camera[isEn ? 'Camera Model' : 'Modelo da Câmera'] = String(parsed.Model);
          if (parsed.LensModel || parsed.Lens) camera[isEn ? 'Lens Model' : 'Lente / Objetiva'] = String(parsed.LensModel || parsed.Lens);
          if (parsed.Software) camera[isEn ? 'Software / Firmware' : 'Software / Firmware'] = String(parsed.Software);
          if (parsed.HostComputer) camera[isEn ? 'Host Device' : 'Dispositivo de Origem'] = String(parsed.HostComputer);

          // Shot parameters
          if (parsed.DateTimeOriginal) camera[isEn ? 'Date Taken' : 'Data e Hora da Captura'] = formatDate(parsed.DateTimeOriginal, lang);
          else if (parsed.CreateDate) camera[isEn ? 'Creation Date' : 'Data de Criação'] = formatDate(parsed.CreateDate, lang);
          else if (parsed.ModifyDate) camera[isEn ? 'Modification Date' : 'Data de Modificação'] = formatDate(parsed.ModifyDate, lang);

          if (parsed.ExposureTime) camera[isEn ? 'Exposure Time' : 'Tempo de Exposição'] = formatExposureTime(parsed.ExposureTime);
          if (parsed.FNumber) camera[isEn ? 'Aperture' : 'Abertura do Diafragma'] = `f/${parsed.FNumber}`;
          if (parsed.ISO) camera[isEn ? 'ISO Speed' : 'Sensibilidade ISO'] = `ISO ${parsed.ISO}`;
          if (parsed.FocalLength) {
            camera[isEn ? 'Focal Length' : 'Distância Focal'] = `${parsed.FocalLength} mm` +
              (parsed.FocalLengthIn35mmFormat ? (isEn ? ` (35mm equiv: ${parsed.FocalLengthIn35mmFormat} mm)` : ` (equiv. 35mm: ${parsed.FocalLengthIn35mmFormat} mm)`) : '');
          }
          if (parsed.ExposureProgram) camera[isEn ? 'Exposure Program' : 'Programa de Exposição'] = String(parsed.ExposureProgram);
          if (parsed.MeteringMode) camera[isEn ? 'Metering Mode' : 'Modo de Medição'] = String(parsed.MeteringMode);
          if (parsed.Flash !== undefined) camera[isEn ? 'Flash' : 'Flash'] = String(parsed.Flash);
          if (parsed.WhiteBalance) camera[isEn ? 'White Balance' : 'Balanço de Branco'] = String(parsed.WhiteBalance);
          if (parsed.Orientation) camera[isEn ? 'Orientation' : 'Orientação EXIF'] = String(parsed.Orientation);

          // Dimensions & Color
          const w = parsed.ImageWidth || parsed.ExifImageWidth;
          const h = parsed.ImageHeight || parsed.ExifImageHeight;
          if (w && h) {
            const mp = ((w * h) / 1000000).toFixed(1);
            general[isEn ? 'Dimensions' : 'Dimensões'] = `${w} × ${h} px (${mp} Megapixels)`;
          }
          if (parsed.ColorSpace) camera[isEn ? 'Color Space' : 'Espaço de Cor'] = String(parsed.ColorSpace);
          if (parsed.ProfileDescription) camera[isEn ? 'ICC Profile' : 'Perfil ICC'] = String(parsed.ProfileDescription);

          // Copyright & Author
          if (parsed.Artist || parsed.creator || parsed.byline) {
            documentInfo[isEn ? 'Author / Artist' : 'Autor / Artista'] = String(parsed.Artist || parsed.creator || parsed.byline);
          }
          if (parsed.Copyright || parsed.rights) {
            documentInfo[isEn ? 'Copyright' : 'Direitos Autorais (Copyright)'] = String(parsed.Copyright || parsed.rights);
          }
        }

        // GPS coordinates extraction
        const gpsCoords = await exifr.gps(buffer);
        if (gpsCoords && typeof gpsCoords.latitude === 'number' && typeof gpsCoords.longitude === 'number') {
          const lat = gpsCoords.latitude;
          const lon = gpsCoords.longitude;
          const alt = parsed?.GPSAltitude || gpsCoords.altitude;

          gps = {
            latitude: lat,
            longitude: lon,
            altitude: alt ? Number(alt) : undefined,
            dmsLat: toDms(lat, true, lang),
            dmsLon: toDms(lon, false, lang),
          };
        }
      } catch (err) {
        console.warn('exifr parse warning:', err);
      }
    }
  }

  // 2. Process PDFs
  if (isPdf) {
    try {
      const buffer = await readAsArrayBuffer(file);
      const pdfMeta = await parsePdfMetadata(buffer, lang);
      Object.assign(documentInfo, pdfMeta);
      rawTags = { ...pdfMeta };
    } catch (err) {
      console.warn('PDF inspection warning:', err);
    }
  }

  // 3. Process Office Documents
  if (isOffice) {
    try {
      const buffer = await readAsArrayBuffer(file);
      const officeMeta = await parseOfficeMetadata(buffer, lang);
      Object.assign(documentInfo, officeMeta);
      rawTags = { ...officeMeta };
    } catch (err) {
      console.warn('Office inspection warning:', err);
    }
  }

  // 4. Process MP3 Audio
  if (ext === 'mp3') {
    try {
      const buffer = await readAsArrayBuffer(file);
      const mp3Meta = parseMp3Tags(buffer, lang);
      Object.assign(mediaInfo, mp3Meta);
      rawTags = { ...mp3Meta };
    } catch (err) {
      console.warn('MP3 inspection warning:', err);
    }
  }

  // 5. Calculate Privacy Health Assessment
  const findings = [];
  let riskLevel = 'clean'; // 'clean' | 'warning' | 'danger'
  let riskTitle = isEn ? 'No Critical Privacy Risks Found' : 'Nenhum Risco Crítico Identificado';
  let riskDescription = isEn
    ? 'This file does not contain GPS location or critical user identifiers.'
    : 'Este arquivo não contém dados de localização GPS ou identificadores críticos de usuário.';

  if (gps) {
    riskLevel = 'danger';
    findings.push(isEn
      ? '📍 Exact GPS Coordinates (physical location where photo was captured)'
      : '📍 Coordenadas de GPS Exatas (localização física onde a foto foi tirada)'
    );
  }

  const cameraMake = camera[isEn ? 'Make' : 'Fabricante'];
  const cameraModel = camera[isEn ? 'Camera Model' : 'Modelo da Câmera'];
  if (cameraModel || cameraMake) {
    findings.push(isEn
      ? `📷 Device Identifier: ${cameraMake || ''} ${cameraModel || ''}`.trim()
      : `📷 Identificador de Dispositivo: ${cameraMake || ''} ${cameraModel || ''}`.trim()
    );
    if (riskLevel !== 'danger') riskLevel = 'warning';
  }

  const captureDate = camera[isEn ? 'Date Taken' : 'Data e Hora da Captura'];
  if (captureDate) {
    findings.push(isEn
      ? `🕒 Exact Capture Date & Time: ${captureDate}`
      : `🕒 Data e Horário Exatos da Captura: ${captureDate}`
    );
    if (riskLevel !== 'danger') riskLevel = 'warning';
  }

  const authorName = documentInfo[isEn ? 'Author' : 'Autor'] ||
                     documentInfo[isEn ? 'Original Author' : 'Autor Original'] ||
                     documentInfo[isEn ? 'Last Modified By' : 'Última Modificação Por'];
  if (authorName) {
    findings.push(isEn
      ? `👤 Author / Operating System Username: "${authorName}"`
      : `👤 Nome do Autor / Usuário do Sistema: "${authorName}"`
    );
    if (riskLevel !== 'danger') riskLevel = 'warning';
  }

  const sw = camera[isEn ? 'Software / Firmware' : 'Software / Firmware'] ||
             documentInfo[isEn ? 'Application' : 'Aplicativo Gerador'] ||
             documentInfo[isEn ? 'Generating Software' : 'Software Gerador'];
  if (sw) {
    findings.push(isEn
      ? `💻 Software / Tool History: ${sw}`
      : `💻 Histórico de Software Utilizado: ${sw}`
    );
    if (riskLevel !== 'danger') riskLevel = 'warning';
  }

  const artist = mediaInfo[isEn ? 'Artist' : 'Artista'];
  const mediaTitle = mediaInfo[isEn ? 'Title' : 'Título'];
  if (artist || mediaTitle) {
    findings.push(isEn
      ? `🎵 Media Metadata (Artist: ${artist || '—'}, Title: ${mediaTitle || '—'})`
      : `🎵 Metadados de Mídia (Artista: ${artist || '—'}, Título: ${mediaTitle || '—'})`
    );
    if (riskLevel !== 'danger') riskLevel = 'warning';
  }

  if (riskLevel === 'danger') {
    riskTitle = isEn ? '⚠️ High Privacy Risk Detected!' : '⚠️ Alto Risco de Privacidade Detectado!';
    riskDescription = isEn
      ? 'This file contains exact GPS coordinates. Anyone receiving this image can trace the exact location where it was taken.'
      : 'Este arquivo contém coordenadas de GPS exatas. Qualquer pessoa que receber esta imagem pode ver seu endereço ou o local exato onde você estava.';
  } else if (riskLevel === 'warning') {
    riskTitle = isEn ? '⚠️ Moderate Privacy Risk' : '⚠️ Risco Moderado de Privacidade';
    riskDescription = isEn
      ? 'This file contains device identification info, capture timestamp, or author personal names.'
      : 'Este arquivo contém dados de identificação do dispositivo, data de criação ou nomes pessoais de autoria.';
  } else {
    riskTitle = isEn ? '✅ Clean File / No Risks Identified' : '✅ Arquivo Limpo / Sem Riscos Identificados';
    riskDescription = isEn
      ? 'No GPS coordinates, author metadata, or device identifiers were found in this file.'
      : 'Nenhum metadado de GPS, autoria ou dispositivo foi encontrado neste arquivo.';
  }

  // Combine structured human-readable tags and raw parser tags into a comprehensive "All Data" dataset
  const combinedAllTags = {
    ...general,
    ...camera,
    ...documentInfo,
    ...mediaInfo,
  };

  if (gps) {
    combinedAllTags[isEn ? 'GPS Latitude' : 'Latitude GPS'] = `${gps.latitude.toFixed(6)} (${gps.dmsLat})`;
    combinedAllTags[isEn ? 'GPS Longitude' : 'Longitude GPS'] = `${gps.longitude.toFixed(6)} (${gps.dmsLon})`;
    if (gps.altitude !== undefined) {
      combinedAllTags[isEn ? 'GPS Altitude' : 'Altitude GPS'] = `${gps.altitude} m`;
    }
  }

  const allDataTags = {
    ...combinedAllTags,
    ...rawTags,
  };

  return {
    file,
    ext,
    isImage,
    isPdf,
    isOffice,
    isAudio,
    isVideo,
    general,
    camera,
    documentInfo,
    mediaInfo,
    gps,
    rawTags: allDataTags,
    assessment: {
      level: riskLevel,
      title: riskTitle,
      description: riskDescription,
      findings,
    },
  };
}
