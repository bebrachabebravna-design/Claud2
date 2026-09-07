/**
 * Design tokens reverse-engineered from the two reference reels.
 *
 * The references are motion-graphics explainers with no talking head: one
 * continuous canvas per chapter, elements springing in and out, and a bright
 * sweep between chapters. There are only eight hard cuts across 107 seconds of
 * reference footage, and every one of them is a light/dark theme swap — so the
 * "montage" here is carried by element choreography, not by cutting.
 *
 * Two worlds alternate: a near-white one and a near-black one, sharing the same
 * geometry, type scale and card language. Everything below is expressed for a
 * 1080x1920 canvas; the references are 720x1280, so measurements taken off them
 * are scaled by 1.5.
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export type Mode = "light" | "dark";

/** Ground, ink and line colours for each world. */
export const MODE = {
  light: {
    bg: "#FCFCFD",
    ink: "#0B0B0C",
    /** Words that have already been said, or labels under a card. */
    mute: "#9A9AA2",
    /** The faint square grid sitting under everything. */
    grid: "rgba(10,10,12,0.045)",
    /** Card fill and its hairline. */
    card: "#FFFFFF",
    cardLine: "rgba(10,10,12,0.10)",
    /** Insets: search fields, thumbnails, disabled chips. */
    inset: "#F1F2F4",
    shadow: "0 18px 60px rgba(15,17,24,0.10), 0 2px 8px rgba(15,17,24,0.06)",
    dot: "rgba(10,10,12,0.22)",
  },
  dark: {
    bg: "#0A0A0B",
    ink: "#FFFFFF",
    mute: "#8A8A92",
    grid: "rgba(255,255,255,0.045)",
    card: "#131315",
    cardLine: "rgba(255,255,255,0.16)",
    inset: "#1D1D20",
    shadow: "0 22px 70px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.06)",
    dot: "rgba(255,255,255,0.26)",
  },
} as const satisfies Record<Mode, Record<string, string>>;

/** The one saturated accent in the whole system: iOS system blue. */
export const ACCENT = "#0A84FF";
/** Selection chrome — the Figma-style highlight box drawn around a word. */
export const SELECT_FILL = "rgba(10,132,255,0.85)";
export const SELECT_LINE = "#2E9BFF";
/** Used once per reel at most, on the single "this costs you" beat. */
export const ALERT = "#FF453A";
export const OK = "#30D158";

/** Corner radii. Cards are pills at small heights and rounded rects at large. */
export const R = { chip: 14, icon: 22, card: 30, panel: 40, sheet: 46 } as const;

/** Type scale, in canvas pixels. */
export const T = {
  /** The chapter title sitting at the top: "второй мозг", "база знаний". */
  title: 92,
  /** Line of speech built word by word in the middle of frame. */
  line: 70,
  /** Card headline. */
  cardTitle: 46,
  /** Card sub-label under the headline. */
  cardSub: 30,
  /** Step markers along the connectors, list rows, chips. */
  small: 26,
  /** Big numerals in a stat. */
  stat: 92,
} as const;

/** Reel-safe insets: Instagram's UI covers this much of the frame. */
export const SAFE = { top: 108, bottom: 420, side: 90 } as const;

/** The house spring. Fast, slightly overshooting, never bouncy. */
export const POP = { damping: 15, stiffness: 190, mass: 0.75 };
/** Softer variant for anything large that would look flappy with overshoot. */
export const GLIDE = { damping: 22, stiffness: 120, mass: 1 };

export const sec = (s: number) => Math.round(s * FPS);
