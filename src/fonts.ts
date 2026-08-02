import { scriptCyrillic, scriptLatin, uiCyrillic, uiLatin } from "./font-data";

/**
 * Fonts are injected as plain CSS @font-face rules carrying inlined data URIs,
 * rather than through the FontFace JavaScript API.
 *
 * Remotion recycles render tabs every few hundred frames, and in this
 * container's headless shell `FontFace.load()` intermittently never settles
 * after a reload — an earlier render died on a delayRender timeout at frame
 * 153, then 670, then 647, with the font served over HTTP and again as a data
 * URI. A CSS rule has no promise to hang on, and because the payload is inlined
 * there is no request to lose. `font-display: block` keeps text from painting
 * in a fallback face.
 *
 * The reference edit uses SF Pro with a calligraphic script accent. Apple's
 * font CDN and the script-font hosts are both blocked by this environment's
 * proxy, so this uses the closest pair that is reachable: Inter, which was
 * drawn as an SF-style UI face and carries a full Cyrillic set, and Marck
 * Script for the handwritten accent.
 */
const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

const faces = `
@font-face {
  font-family: 'ReelUI';
  src: url(${uiCyrillic}) format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
  unicode-range: ${CYRILLIC};
}
@font-face {
  font-family: 'ReelUI';
  src: url(${uiLatin}) format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
  unicode-range: ${LATIN};
}
@font-face {
  font-family: 'ReelScript';
  src: url(${scriptCyrillic}) format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: block;
  unicode-range: ${CYRILLIC};
}
@font-face {
  font-family: 'ReelScript';
  src: url(${scriptLatin}) format('woff2');
  font-weight: 400;
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

export const displayFont = "ReelUI, -apple-system, sans-serif";
export const scriptFont = "ReelScript, cursive";

export const YELLOW = "#FFE24A";
export const INK = "#0A0A0F";
