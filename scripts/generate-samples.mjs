import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { exiftoolPath } from 'exiftool-vendored';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Synthetic, MIT-licensed demo fixtures. Never use a personal file as a sample.
await sharp({ create: { width: 96, height: 64, channels: 3, background: { r: 245, g: 205, b: 78 } } })
  .jpeg({ quality: 90 }).toFile('public/sample-exif.jpg');
execFileSync(await exiftoolPath(), [
  '-overwrite_original', '-Artist=Synthetic Example Author',
  '-Make=Example Camera', '-Model=Synthetic Demo', '-Software=Remover Metadados synthetic fixture',
  '-DateTimeOriginal=2026:01:01 12:00:00',
  '-GPSLatitude=0', '-GPSLatitudeRef=N', '-GPSLongitude=0', '-GPSLongitudeRef=E',
  '-Comment=Generated demonstration. Coordinates at 0,0 are not a user location.',
  'public/sample-exif.jpg',
]);

const pdf = await PDFDocument.create();
pdf.setTitle('Synthetic metadata demonstration');
pdf.setAuthor('Synthetic Example Author');
pdf.setSubject('Generated test data, not a confidential or user document');
pdf.setCreator('Remover Metadados sample generator');
pdf.setProducer('pdf-lib');
pdf.setKeywords(['synthetic', 'example', 'metadata']);
pdf.setCreationDate(new Date('2026-01-01T12:00:00Z'));
pdf.setModificationDate(new Date('2026-01-01T12:00:00Z'));
const page = pdf.addPage([480, 240]);
const font = await pdf.embedFont(StandardFonts.Helvetica);
page.drawText('Synthetic metadata example', { x: 28, y: 180, size: 20, font, color: rgb(0.1, 0.1, 0.1) });
page.drawText('Generated demonstration data. No personal information.', { x: 28, y: 140, size: 12, font });
await writeFile('public/sample-doc.pdf', await pdf.save());
console.log('Generated synthetic JPEG and PDF demo fixtures.');
