# Security policy

## Private reporting

Email **dev@modernxwebs.com** with the subject `Security: Remover Metadados`.
Include the affected page or source version, browser, reproduction steps,
potential impact, and a minimal synthetic example. Do not send real personal
files, working credentials, or someone else's data. Ask for an appropriate
transfer method before sharing an attachment that could be malicious.

Do not report vulnerabilities through public issues or pull requests. There is
no guaranteed response time, paid support commitment, or bug bounty program.
Security fixes are maintained on the current main branch; old releases and forks
are not promised backports.

## Security boundaries

- File processing is browser-side. No server upload endpoint is part of this
  application. Website delivery and optional analytics are separate connections.
- Extracted metadata and filenames are untrusted text. They must not be inserted
  into HTML without escaping, executed as code, or sent to telemetry.
- Embedded maps are optional. Coordinates are shared with map providers only
  after the user chooses the relevant map action.
- Browser processing is not a security sandbox for arbitrary malicious files.
  Large, malformed, encrypted, or specially constructed files can fail, exhaust
  browser resources, or exercise bugs in browser and decoder libraries.
- Metadata removal is not malware removal, document redaction, or guaranteed
  anonymization. Unsupported fields, visible content, attachments, revision
  history and other identifying information can remain. See the verification
  pages and published results for exact tested coverage.
- Tests are maintainer-run checks, not independent security certification.

## Deployment

Keep provider credentials and local environment files out of Git. Variables
prefixed `PUBLIC_` are browser-visible and must never contain secrets. Analytics
is disabled unless explicitly configured for a production hostname.

Deploy only the generated `dist/` directory, never the source checkout or a dev
server. Configure HTTPS and the response headers in `public/_headers` on your
host. That file is recognized by Cloudflare Pages; other hosts need equivalent
configuration. Astro preview does not apply those hosting rules automatically.
The CSP currently permits inline scripts and styles used by the static app;
it is an additional restriction, not a substitute for safe DOM handling.

Re-run dependency and secret scans before each public release. Review metadata
inside new binary assets as well as text files. A clean automated scan is not
proof that no sensitive information or vulnerabilities exist.

The HEIC worker is rebuilt from libheif 1.23.7 and libde265 1.1.3, with a modified
heic-to wrapper. It limits native memory to 512 MiB, input to 100 MiB, decoded
images to 64 megapixels, and worker processing to 30 seconds. Browser-native
fallback and other formats have their own browser-dependent resource limits.
`npm run audit:native` checks upstream release freshness; npm audit alone cannot
establish that embedded native codecs are patched. Build inputs, tool versions,
checksums, corresponding source and replacement instructions are published in
`public/licenses/source/`. Neither the release check nor the fixture suites are
a comprehensive native-code audit or fuzzing campaign.
