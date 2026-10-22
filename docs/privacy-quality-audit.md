# Privacy, image quality and structured-data audit

Reviewed against the local source and browser behavior on October 22, 2026.

| Finding | Verdict | Benefit and implemented change |
| --- | --- | --- |
| Viewer automatically creates an OpenStreetMap URL with GPS | True. `renderActiveItem()` assigned an external iframe URL without map-specific consent. A generated URL alone is not a network disclosure, but loading the frame shares coordinates. | Maps now stay off until an explicit action, with a coordinate/IP sharing notice. Consent resets on file changes and clearing. External map actions use buttons so automatic outbound-link analytics does not collect coordinate-bearing hrefs. Map frames and tabs omit referrers. |
| Privacy statements overstate local processing | True. The layout loads GA4 and Google Fonts. ZIP, HEIC and TIFF loaders include jsDelivr fallbacks. Footer and policy previously claimed no tracking cookies/logs. | Updated both languages and related site copy to distinguish local file processing from website analytics, resources, hosting connections and optional maps. Removed unsupported blanket compliance claims. |
| Image-quality descriptions conflict | True. FAQs promised unchanged pixels; the engine uses canvas encoding for JPEG/WebP/AVIF and conversions. | Published format-specific output/quality notes at both tools, corrected FAQs/guides/blog/machine-readable descriptions, and renamed “Original” to “Default output” because some formats convert. |
| Shared application identity uses changing page URLs | True. The layout emitted the remover app on guides, articles, support pages and the viewer with each page's URL. | The remover and viewer each have a stable ID/URL across languages. Application definitions appear on tool pages. Shared page entities describe current pages, with article, collection, about and contact relationships/types. |
| Broad sanitization claims lack public evidence | True. No published executable checks were present. Office processing does not remove document comments or tracked changes. PDF processing can leave custom properties and detached XMP bytes. | Added maintainer-run browser tests with independent readers and public results, plus Portuguese/English coverage and limitations pages. Claims now reflect tested fields and known residual data. |

The map change addresses an actual external disclosure path. Privacy and quality corrections help users make informed decisions. Schema changes improve consistency and semantic accuracy; they do not promise ranking changes. Evidence improves verifiability; it does not certify complete anonymization.

## Verification

`scripts/test-metadata.mjs` runs real browser processing and checks outputs with ExifTool, sharp, ZIP inspection and byte comparisons. `public/verification-results.json` records environment versions, selected before/after fields, pixel changes, output hashes and the removal engine hash. The current run passed 43 checks, including both map UI languages, GIF/TIFF frame/page loss and JPEG transparency compositing.

Image fixtures cover JPEG, PNG, WebP, AVIF, TIFF, GIF, BMP, SVG and a real HEIC sample. Selected author/GPS/comment fields are absent after processing in those tagged fixtures. BMP checks conversion/pixels without personal tags. JPEG/WebP/AVIF and the JPEG-compressed TIFF fixture changed decoded channel values. PNG kept its IDAT bytes and decoded fixture pixels. HEIC checks output and author removal, not pixel fidelity. Office uses synthetic ZIP packages, not full application compatibility tests. MP3 checks synthetic ID3 envelopes, not playback. Video validity and complete sanitization are explicitly unverified.

The public pages are `/verificacao/` and `/en/verification/`. These are maintainer-run checks using independent software, not a third-party security audit.

Reproduce after installing dependencies and Chrome:

```sh
npm run dev -- --background
TEST_ORIGIN=http://localhost:4321 npm run test:metadata
npm run build
npm run test:schema
node scripts/check-links.cjs
```

Use the actual background server URL if the port differs. Set `CHROME_PATH` when Chrome is installed elsewhere. Set `HEIC_FIXTURE` to a local HEIC file to include that case; otherwise the report marks HEIC unverified. The reviewed HEIC source was the public [libheif example](https://github.com/strukturag/libheif/blob/master/examples/example.heic), downloaded to temporary storage. Other fixtures are generated locally. Use `-- --publish` to refresh public results after reviewing changes. Test requests to external services are intercepted, so test file information is not sent to analytics or map providers.

## Technical references

- [Canvas export](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob): creates an encoded image; lossy formats accept a quality argument.
- [Schema.org WebPage](https://schema.org/WebPage), [SoftwareApplication](https://schema.org/SoftwareApplication): distinguish page descriptions from application entities.
- [Google Analytics privacy information](https://support.google.com/analytics/answer/12017362): website measurement is separate from local file processing.

No comprehensive file sanitizer redesign, analytics-account configuration change or production deployment was performed.
