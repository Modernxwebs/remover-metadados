/**
 * Shared English FAQ data for both visual UI rendering and Schema.org JSON-LD generation.
 * Keeping a single source of truth ensures 100% compliance with Google's FAQ guidelines.
 */
export const faqsEn = [
  {
    q: "What is a metadata remover and how does it work?",
    a: "A metadata remover is a privacy tool that inspects the binary structure of your files and strips hidden informational headers (such as EXIF, XMP, IPTC, and document author properties). Our metadata remover runs 100% inside your browser using client-side JavaScript and binary parsing, meaning no photo, PDF, or document is ever uploaded to a remote server.",
  },
  {
    q: "How do I remove metadata from photos on iPhone, Android, or PC?",
    a: "To remove metadata from photos, open this website in any modern browser (Chrome, Safari, Edge, Firefox) on your phone or computer, drag and drop or select your photos, and click 'Remove metadata'. In seconds, GPS coordinates, camera serial numbers, and timestamps are permanently erased, and you can download a clean copy.",
  },
  {
    q: "Does removing EXIF metadata reduce photo or video quality?",
    a: "It depends on the format. PNG normally keeps compressed pixel data while removing metadata chunks. JPEG and WebP are re-encoded at quality 0.95; AVIF uses 0.85 and may fall back to WebP. Pixels and colors can change. HEIC becomes JPEG; GIF, BMP and TIFF become PNG with one frame or page. Format conversions also re-encode the image. Video streams are not re-compressed, but metadata coverage is limited. See the verification page and review downloaded copies.",
  },
  {
    q: "Can I remove metadata from multiple files in bulk?",
    a: "Yes. You can select and process dozens of files simultaneously. Our tool processes each file in parallel directly within your browser's memory. Once processed, you can download files individually or click 'Download all (.zip)' to save a single cleaned archive.",
  },
  {
    q: "Does this tool remove AI metadata and C2PA Content Credentials?",
    a: "Re-encoding images and removing PNG text or metadata chunks can remove embedded prompts and provenance data in those containers. We have not verified every generator or C2PA variant. Visible or invisible watermarks, steganography and external provenance records are outside this tool’s scope. No universal AI metadata removal guarantee is made.",
  },
  {
    q: "Is it safe to remove metadata from confidential legal, financial, or medical PDFs here?",
    a: "Files are processed locally without uploads. This does not guarantee complete anonymization: comments, tracked changes, attachments and visible personal information can remain in documents. The website uses Google Analytics and Google Fonts; external maps receive coordinates only after your choice. Review the privacy policy and format-specific tests before sharing confidential documents.",
  },
  {
    q: "Can I drop files anywhere on the screen and choose my download format?",
    a: "Yes! You can drop photos, PDFs, or documents anywhere on the screen (no need to aim inside a tiny box). In addition, you can choose whether to download your clean file with the default output for its file type or convert it to JPG, PNG, WebP, AVIF, or download all formats packaged in a single ZIP. All processing and conversion happens 100% on your device with zero server uploads.",
  },
  {
    q: "Is Metadata Remover completely free, or is registration required?",
    a: "Metadata Remover is 100% free with no registration, no subscriptions, no file size paywalls, and no batch limits. Our mission is to make digital privacy fast, simple, and accessible to everyone worldwide.",
  },
];
