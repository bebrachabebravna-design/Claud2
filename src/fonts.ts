import { bebasNeue, goodVibes, sfProBlack, sfProBold, sfProHeavy } from "./font-data";

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
 * Three faces, one role each: SF Pro Display carries every bold/black headline
 * and label, Good Vibes Pro is the handwritten accent, Bebas Neue is reserved
 * for the punchy numeric displays (timers, counters, the score card) — the
 * condensed all-caps cut is built for exactly that, not for running text.
 *
 * SF Pro ships as static per-weight files rather than a variable font, so each
 * weight actually used in the project gets its own @font-face entry rather
 * than a weight range.
 */
const faces = `
@font-face {
  font-family: 'SFProDisplay';
  src: url(${sfProBold}) format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'SFProDisplay';
  src: url(${sfProHeavy}) format('opentype');
  font-weight: 800;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'SFProDisplay';
  src: url(${sfProBlack}) format('opentype');
  font-weight: 900;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'GoodVibes';
  src: url(${goodVibes}) format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'BebasNeue';
  src: url(${bebasNeue}) format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
`;

if (typeof document !== "undefined" && !document.getElementById("reel-faces")) {
  const style = document.createElement("style");
  style.id = "reel-faces";
  style.textContent = faces;
  document.head.appendChild(style);
}

export const displayFont = "SFProDisplay, -apple-system, sans-serif";
export const scriptFont = "GoodVibes, cursive";
export const impactFont = "BebasNeue, sans-serif";

export const YELLOW = "#FFE24A";
export const INK = "#0A0A0F";
