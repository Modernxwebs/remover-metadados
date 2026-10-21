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
    a: "No. Metadata removal operates strictly on the header and metadata blocks of the file. The image pixel matrix, visual resolution, color depth, and audio streams remain 100% untouched. You get identical visual quality with zero personal tracking data attached.",
  },
  {
    q: "Can I remove metadata from multiple files in bulk?",
    a: "Yes. You can select and process dozens of files simultaneously. Our tool processes each file in parallel directly within your browser's memory. Once processed, you can download files individually or click 'Download all (.zip)' to save a single cleaned archive.",
  },
  {
    q: "Does this tool remove AI metadata and C2PA Content Credentials?",
    a: "Yes. When you generate images using AI tools like Midjourney, DALL-E, Stable Diffusion, or ChatGPT, generator parameters, prompt text, and C2PA Content Credentials manifests are embedded in the file headers. Our metadata cleaner re-encodes images through a clean HTML5 canvas to strip all non-visual metadata packets, including AI provenance tags.",
  },
  {
    q: "Is it safe to remove metadata from confidential legal, financial, or medical PDFs here?",
    a: "Yes, it is 100% safe. Because all processing executes locally on your device with zero cloud transmission, your sensitive legal contracts, proprietary blueprints, financial records, and medical PDFs never touch a server or third-party database.",
  },
  {
    q: "Can I drop files anywhere on the screen and choose my download format?",
    a: "Yes! You can drop photos, PDFs, or documents anywhere on the screen (no need to aim inside a tiny box). In addition, you can choose whether to download your clean file in its original format or convert it to JPG, PNG, WebP, AVIF, or download all formats packaged in a single ZIP. All processing and conversion happens 100% on your device with zero server uploads.",
  },
  {
    q: "Is Metadata Remover completely free, or is registration required?",
    a: "Metadata Remover is 100% free with no registration, no subscriptions, no file size paywalls, and no batch limits. Our mission is to make digital privacy fast, simple, and accessible to everyone worldwide.",
  },
];
