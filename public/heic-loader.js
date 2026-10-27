// Original MIT-licensed loader; the imported decoder retains its LGPL license.
// This public ES module is served unchanged in development and production.
import { heicTo, getDecoderVersions } from './vendor/heic-to.js';

window.metadataRemoverHeicTo = heicTo;
window.metadataRemoverDecoderVersions = getDecoderVersions;
