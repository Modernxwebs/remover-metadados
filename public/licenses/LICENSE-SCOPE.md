# License scope

Copyright (c) 2026 Modern X Webs. Contact: dev@modernxwebs.com.

The [MIT license](PROJECT-LICENSE.txt) applies to the original application code, UI code,
styles, scripts, automated tests, generated demonstration fixtures, and technical
documentation in this repository, except for the materials identified below.
Commercial use, modified forks, self-hosting, and advertising are permitted by
the code license. Acceptance of outside contributions is a separate policy.

## Brand assets and editorial content

The following materials are excluded from the MIT grant. Rights in these
materials are reserved by their respective rights holders; no additional reuse
permission is granted by this repository:

- Logos, favicons, touch icons, social preview artwork and other brand artwork in
  `public/logo*`, `public/favicon*`, `public/apple-touch-icon.png`, and
  `public/og-image.png`.
- Illustrations and photographs in `public/images/`.
- Original article prose in `src/content/blog/` and the original guide prose
  inside `src/pages/guias/`. The surrounding application and rendering code
  remains MIT licensed.

For a publicly hosted fork, replace the reserved artwork and editorial prose
with material you have permission to use. Permission to use the code does not
authorize presenting a fork as the official Remover Metadados service or as
endorsed by Modern X Webs. This notice does not assert ownership of generic
words, third-party materials, or rights the maintainer does not hold.

The files `public/sample-exif.jpg` and `public/sample-doc.pdf` are generated
demonstration data and are MIT licensed. Their camera fields, coordinates,
author fields and document content are synthetic examples, not user data.

## Third-party software

Third-party code keeps its upstream license. The project MIT license does not
replace those terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and
`public/licenses/` for the applicable notices, license texts and decoder source.
In particular, the HEIC decoder is LGPL licensed and is shipped separately so
that it can be inspected, rebuilt and replaced.

`scripts/build-heic-wrapper.mjs` contains code derived from heic-to and is also
LGPL-3.0-or-later, as identified by its SPDX header. The original native build
driver `scripts/build-heic-native.py` remains MIT licensed.

The hosted website's terms of use do not add restrictions to the rights granted
by the MIT license over application code.
