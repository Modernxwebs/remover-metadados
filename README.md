# Remover Metadados / Metadata Remover

A browser-based metadata viewer and remover with Portuguese and English
interfaces. Selected file contents are processed locally; the application does
not upload them for processing. Supported metadata fields, output quality and
file-format behavior vary. This is not a complete anonymization or redaction tool.

Maintained by **Modern X Webs**. Contact: **dev@modernxwebs.com**.

- [Official tool](https://remover-metadados.com/en/)
- [Coverage, test evidence and limitations](https://remover-metadados.com/en/verification/)
- [Website privacy details](https://remover-metadados.com/en/privacy/)

The application code is MIT licensed. Brand assets, editorial content and
third-party dependencies have separate terms; see [License scope](LICENSE-SCOPE.md).
The project publishes source for transparency and permitted reuse. External code
contributions are not currently accepted; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Processing scope

| Files | Current behavior and important limits |
| --- | --- |
| JPEG, WebP, AVIF | Pixel decoding and re-encoding. Lossy changes and color/profile changes are possible. |
| PNG | Normally strips selected metadata chunks while preserving compressed image data. Some rendering information remains; fallback processing can re-encode. |
| HEIC/HEIF | Converts to JPEG using a patched local worker with libheif 1.23.7 and libde265 1.1.3. Worker limits: 100 MiB input, 64 megapixels, 30 seconds, 512 MiB native memory. Browser-native fallback has browser-specific limits. |
| GIF, BMP, TIFF | Exports a single-frame/page PNG. Animation and additional pages can be lost. |
| SVG | Removes selected elements and editor attributes. Not a complete SVG sanitizer. |
| PDF | Clears standard properties and detaches selected metadata references. Custom fields, detached bytes, annotations, attachments and visible content can remain. |
| Office/OpenDocument | Clears selected package properties and thumbnails. Comments, tracked changes and embedded files can remain. |
| MP3, MP4/MOV/M4V | Targets selected tag envelopes or container boxes. Full metadata coverage and real-media playback are not established. |

Keep original files and inspect the downloaded copy before sharing. Maintainer-run
fixtures are evidence of specific checks, not an independent security audit or a
guarantee for every file. See `public/verification-results.json` for the recorded
environment, engine hash, checked fields and unverified cases.

## Run locally

Use Node.js **22.12 or newer**; Node 24 LTS is recommended. No account, API key,
database or hosting credentials are required to build the application.

```sh
npm ci
npm run dev -- --background
```

Use the URL reported by Astro. Manage the background server with:

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

To generate the static website:

```sh
npm run build
npm run preview -- --background
```

Deploy only `dist/`. Stop preview with `npm run astro -- preview stop`.
Cloudflare Pages applies `public/_headers`; another host requires equivalent
header configuration. Astro preview does not automatically apply those rules.

## Configuration and external connections

A fresh source copy has analytics disabled. Optional settings are
documented in `.env.example`; copy it to an ignored `.env.local` if needed.
`PUBLIC_` variables are browser-visible and must never contain secrets.

Processing libraries are served locally. The website still loads Google Fonts
and external directory/Product Hunt badge images. Optional Google Analytics is
restricted to an explicitly configured production hostname. Maps share selected
GPS coordinates only after the user chooses a map action. File events sent by
the application use allowlisted format labels, counts, sizes and fixed error
codes, not filenames, extracted metadata or raw error messages.

Dropping files on an informational page temporarily uses browser IndexedDB to
transfer them to the tool. A tool visit consumes or clears the entry. Interrupted
handoffs can remain until the next tool visit or until browser site data is
cleared. Local file processing does not make website browsing anonymous.

Before hosting a fork, replace the reserved branding/editorial material and
update all domain-specific URLs, contacts and hosting rules. The source contains
official-site canonical URLs in multiple files; changing the Astro site setting
alone is insufficient. See [Publishing and deployment](docs/publishing.md).

## Verify changes

```sh
npm run check:vendor
npm run audit:native
npm run build
npm run test:schema
npm run check:links
npm run audit:seo
npm audit
```

Browser tests require Chrome/Chromium. On macOS they use Google Chrome at its
standard installation path unless `CHROME_PATH` is set. On Linux, install the
Puppeteer browser and required OS libraries:

```sh
npx puppeteer browsers install chrome --install-deps
```

Run production-browser security regressions with hosting headers:

```sh
npm run test:security
```

With the background Astro development server running, run format and metadata
checks using generated fixtures and independent readers:

```sh
npm run test:metadata
```

Set `TEST_ORIGIN` if Astro uses a different origin. Set `HEIC_FIXTURE` to a
non-sensitive HEIC test container to include that case in either browser suite.
Without it, the suite explicitly omits the real HEIC case. Test requests to
external services are intercepted. CI extracts a public upstream example from
the included native source archive. `npm run test:metadata -- --publish` replaces
the published evidence; review the result before committing. Run the build again
after publishing new evidence. `npm run samples:generate` regenerates the MIT
synthetic demonstration JPEG and PDF.

The GitHub workflow uses the runner's installed Google Chrome and runs dependency, secret, native-release freshness, build,
schema, link, SEO and browser checks on pushes and weekly. It has read-only
repository permissions, uses pinned action commits, and does not deploy or submit
URLs to search engines. npm audit does not inspect the native code embedded in
vendor files; review upstream advisories as well as the freshness check.

## Security and public releases

Report security concerns privately to **dev@modernxwebs.com**; see
[SECURITY.md](SECURITY.md). Do not attach personal files or publish exploit data.

Use `npm run release:public -- --output /absolute/path/to/new-directory` to create
a reviewed-source snapshot without private Git history, local settings or audit
artifacts. Read [docs/publishing.md](docs/publishing.md) before creating a public
repository. A clean scan is not a guarantee of zero vulnerabilities or exposure.

## Licenses

- Original application code, UI styles, tests and technical documentation:
  [MIT](LICENSE), copyright Modern X Webs.
- Original brand artwork and editorial prose: excluded from MIT; see
  [LICENSE-SCOPE.md](LICENSE-SCOPE.md).
- Dependencies and native codecs: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
  and `public/licenses/`. The separately served HEIC decoder is LGPL licensed;
  its source archives, license texts and replacement instructions are included.

Open source licensing permits commercial hosting, including advertising. It
does not promise ad-network approval, contribution review or ongoing support.
