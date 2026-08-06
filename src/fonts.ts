import { goodVibes, sfProBlack, sfProBold, sfProHeavy } from "./font-data";

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
 * SF Pro Display is the primary face and carries everything — headlines,
 * labels and the big numeric displays alike (at weight 800/900 the numbers read
 * as impact without a second display font). Good Vibes Pro is the one secondary
 * face, used only for the handwritten accent lines.
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
`;

if (typeof document !== "undefined" && !document.getElementById("reel-faces")) {
  const style = document.createElement("style");
  style.id = "reel-faces";
  style.textContent = faces;
  document.head.appendChild(style);
}

export const displayFont = "SFProDisplay, -apple-system, sans-serif";
export const scriptFont = "GoodVibes, cursive";

/**
 * Neirodocs palette. Cyan is the highlight that used to be yellow, blue carries
 * structure, and the two dark tones are the ground everything sits on.
 *
 * There is deliberately no alert red: the loss and penalty beats get their
 * urgency from motion, scale and a darker ground rather than from a hue outside
 * the brand.
 */
export const CYAN = "#45D0FF";
export const BLUE = "#1E5FFF";
export const NAVY = "#0A1428";
export const INK = "#050B16";
export const WHITE = "#FFFFFF";

/**
 * Caption accent, set to yellow at the user's request. It is deliberately the
 * iOS system yellow rather than a saturated print yellow: against the cyan the
 * brand already owns, a warmer amber is the one hue that stays legible over
 * both the dark room and the bright studio scenes without competing with the
 * blues for "this is the product" duty.
 */
export const YELLOW = "#FFD60A";
/** Near-black ground for the dark world — reads deeper than NAVY on phones. */
export const GRAPHITE = "#0D1117";
