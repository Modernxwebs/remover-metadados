# Third-party software notices

The application MIT license covers original project code. It does not relicense
dependencies, embedded native codecs, external fonts or third-party artwork.
Upstream notices are preserved in [license files](./).

## Browser processing dependencies

| Component | Pinned version | Upstream license/source |
| --- | --- | --- |
| exifr | 7.1.3 | MIT; https://github.com/MikeKovarik/exifr |
| JSZip | 3.10.2 | MIT option of upstream MIT OR GPL license; https://github.com/Stuk/jszip |
| pdf-lib | 1.17.1 | MIT; https://github.com/Hopding/pdf-lib |
| UTIF.js | 3.1.0 | MIT; https://github.com/photopea/UTIF.js |
| @jsquash/avif | 2.1.1 | Apache-2.0 wrapper; https://github.com/jamsinclair/jSquash |
| libavif in the AVIF codec | 1.0.1, as identified by the package codec README | BSD license and bundled notices in `libavif-LICENSE.txt` |
| libaom in the AVIF encoder | 3.7.0, identified by the encoder binary's version string | BSD license and AOM patent notice in `aom-LICENSE.txt` and `aom-PATENTS.txt` |
| Modified heic-to wrapper | 1.6.6 with project modifications | LGPL-3.0-or-later; https://github.com/hoppergee/heic-to/tree/v1.6.6 |
| Rebuilt libheif | 1.23.7, also verified at runtime by browser checks | LGPL; see `libheif-LICENSE.txt` and corresponding source |
| Rebuilt libde265 | 1.1.3, also verified at runtime by browser checks | LGPL; see `libde265-LICENSE.txt` and corresponding source |
| Emscripten runtime used by the rebuilt decoder | 4.0.14 | MIT and University of Illinois/NCSA terms in `emscripten-LICENSE.txt` |

Additional toolchain runtime notices, including LLVM C++/compiler runtime
Apache-2.0 with LLVM exceptions and musl notices, are preserved in the adjacent
`llvm-*-LICENSE.txt`, `musl-COPYRIGHT.txt` and `mimalloc-LICENSE.txt` files.
This collection is conservative; not every SDK runtime component is necessarily
linked into the browser module.

The AVIF native notice collection also includes upstream libyuv notices. The
package inventory and full available notices for installed non-development
packages are in `dependencies.json` and `dependencies.txt`. This inventory
includes build dependencies; not every installed package is shipped to browsers.
Optional binaries for other operating systems are not copied into this project.
Packages installed through npm retain the notices included in their packages.

## Replaceable LGPL decoder and source

`public/vendor/heic-to.js` is a project build of a modified heic-to 1.6.6 wrapper
and patched libheif 1.23.7 / libde265 1.1.3. It is served as a separate ES module
with a single-file WebAssembly worker. It does not require `unsafe-eval`.
Modifications add asynchronous module initialization, bounded worker execution,
resource limits, cleanup and native-version reporting. Its license and the
incorporated GPLv3 text are available next to the source downloads.

Corresponding upstream source archives for heic-to, libheif and libde265 are
included under `public/licenses/source/`, with SHA-256 checksums and rebuild and
replacement instructions. The application imposes no additional restriction on
modifying these libraries or reverse engineering them for debugging such
modifications. Build and replace the decoder module at the same public path to
use a modified version. See the upstream licenses for the applicable conditions.

This is a project rebuild, not the unmodified decoder distributed on npm. The
wrapper source archive omits the upstream generated native JavaScript, which
predates these fixes. The preferred wrapper source, current native sources and
project build drivers are provided. Build tools and output checksums are recorded
in `public/licenses/source/build.json`; bit-identical output across different
toolchains or environments is not promised.

## Updating notices

Use the committed lockfile for installations. `npm run check:vendor` compares
upstream vendor assets with installed package bytes and verifies the rebuilt
HEIC decoder, build-driver hashes and source archives against the reviewed build
record. When a dependency or native version changes, review source, advisories
and license obligations before replacing it. `npm run audit:native` checks the
latest upstream HEIC native releases, separately from npm advisories.

After a reviewed dependency update, run:

```sh
node scripts/generate-license-notices.mjs
```

The generator preserves available upstream license/notice files verbatim. It is
an inventory tool, not a substitute for reviewing native or copyleft obligations.

## External website resources

Google Fonts, optional Google Analytics, optional map providers, directory badges
and Product Hunt images are delivered by their providers and remain subject to
their terms. They are not granted an MIT license by this repository. See the
website privacy policy for the connections they create.
