import {
  caveatCyrillicFont,
  caveatLatinFont,
  cyrillicFont,
  latinExtFont,
  latinFont,
} from "./font-data";

/**
 * Fonts are injected as plain CSS @font-face rules carrying inlined data URIs,
 * rather than through the FontFace JavaScript API.
 *
 * Remotion recycles render tabs every few hundred frames, and in this
 * container's headless shell `FontFace.load()` intermittently never settles
 * after a reload — the render died on a delayRender timeout at frame 153, then
 * 670, then 647, with the font served over HTTP and again as a data URI. A CSS
 * rule has no promise to hang on, and because the payload is inlined there is
 * no request to lose. `font-display: block` keeps text from painting in a
 * fallback face.
 *
 * Google ships one subsetted file per script, so each is declared with its own
 * unicode-range. Montserrat carries the headline weight; Caveat is the
 * handwritten accent that alternates with it, matching the reference edit.
 */
const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const faces = `
@font-face {
  font-family: 'Montserrat';
  src: url(${cyrillicFont}) format('woff2');
  font-weight: 600 900;
  font-style: normal;
  font-display: block;
  unicode-range: ${CYRILLIC};
}
@font-face {
  font-family: 'Montserrat';
  src: url(${latinFont}) format('woff2');
  font-weight: 600 900;
  font-style: normal;
  font-display: block;
  unicode-range: ${LATIN};
}
@font-face {
  font-family: 'Montserrat';
  src: url(${latinExtFont}) format('woff2');
  font-weight: 600 900;
  font-style: normal;
  font-display: block;
  unicode-range: ${LATIN_EXT};
}
@font-face {
  font-family: 'Caveat';
  src: url(${caveatCyrillicFont}) format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: block;
  unicode-range: ${CYRILLIC};
}
@font-face {
  font-family: 'Caveat';
  src: url(${caveatLatinFont}) format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: block;
  unicode-range: ${LATIN};
}
`;

if (typeof document !== "undefined" && !document.getElementById("reel-faces")) {
  const style = document.createElement("style");
  style.id = "reel-faces";
  style.textContent = faces;
  document.head.appendChild(style);
}

export const displayFont = "Montserrat, sans-serif";
export const scriptFont = "Caveat, cursive";
