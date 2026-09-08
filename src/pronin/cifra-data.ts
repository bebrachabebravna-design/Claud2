import { Word } from "./Type";

/**
 * Timing map for «Самая дорогая статья расходов» (public/speaker-cifra.mp4).
 *
 * Every time below is taken from the supplied SRT and shifted by TRIM, so a
 * beat can be checked against the transcript by adding TRIM back.
 *
 * The head is trimmed by 1.5s because the take opens on a second and a half of
 * silence before the first word. Nothing of the speech is lost — the cut lands
 * half a second before "Самая" — but two silent seconds at the top of a reel is
 * the single most expensive thing you can leave in.
 */
export const TRIM = 1.5;
/** Source runs 52.0s; the tail is kept whole. */
export const REEL_END = 50.5;

/** Convert a raw SRT second into reel time. */
export const t = (s: number) => s - TRIM;

/**
 * Chapter plan. `speaker` chapters run the take full frame with graphics over
 * it; the rest are pure canvas in the reference's two worlds.
 *
 * The alternation is deliberate: the face carries the claims a person has to be
 * trusted for (the hook, the competitor threat, the ask), and the canvas carries
 * everything that is really a number.
 */
export type Chap = {
  from: number;
  to: number;
  kind: "speaker" | "light" | "dark";
  /** Push-in for speaker chapters, so a static camera never sits still. */
  zoom?: [number, number];
  ox?: number;
  oy?: number;
};

export const CHAPTERS: Chap[] = [
  { from: 0, to: t(10.16), kind: "speaker", zoom: [1.0, 1.06], oy: 44 },
  { from: t(10.16), to: t(16.16), kind: "light" },
  { from: t(16.16), to: t(20.98), kind: "dark" },
  { from: t(20.98), to: t(24.38), kind: "speaker", zoom: [1.08, 1.02], oy: 42 },
  { from: t(24.38), to: t(32.06), kind: "light" },
  { from: t(32.06), to: t(36.22), kind: "dark" },
  { from: t(36.22), to: t(44.22), kind: "light" },
  { from: t(44.22), to: REEL_END, kind: "speaker", zoom: [1.0, 1.07], oy: 44 },
];

/**
 * Spoken lines, set as designed type rather than as a caption bar.
 *
 * The references carry no subtitles at all — their words are layout. These keep
 * that treatment while still tracking the speech, so the reel stays readable
 * with the sound off without a plate under every line.
 */
export type Phrase = {
  from: number;
  to: number;
  words: Word[];
  /** Vertical anchor in canvas px. Speaker chapters sit low, over the chest. */
  top: number;
  size?: number;
};

const W = (s: string, hit?: number[]): Word[] =>
  s.split(" ").map((text, i) => ({ text, hit: hit?.includes(i) }));

export const PHRASES: Phrase[] = [
  // 1. Hook, over the speaker.
  { from: t(2.0), to: t(4.6), top: 1120, words: W("самая дорогая статья расходов", [1]) },
  { from: t(4.68), to: t(7.24), top: 1120, words: W("её нет ни в одном отчёте", [2, 3, 4]) },
  { from: t(7.32), to: t(8.48), top: 1120, words: W("а конкурент уже увидел", [1]), size: 74 },
  { from: t(8.6), to: t(10.0), top: 1120, words: W("сейчас покажу, как её найти") },

  // 2. What the cost actually is.
  { from: t(12.92), to: t(14.2), top: 1180, words: W("найти нужный документ") },
  { from: t(14.32), to: t(15.92), top: 1300, words: W("не работают — ищут", [2]), size: 82 },

  // 3. The research figure.
  { from: t(18.8), to: t(19.68), top: 1290, words: W("звучит как мелочь") },

  // 4. The case, over the speaker.
  { from: t(20.98), to: t(24.26), top: 1120, words: W("дистрибьютор, 24 менеджера", [1]) },

  // 6. The seventh folder.
  { from: t(32.06), to: t(33.78), top: 1250, words: W("седьмую папку", [0]), size: 80 },
  { from: t(33.98), to: t(36.14), top: 1400, words: W("а думал — у него порядок") },

  // 7. The competitor.
  { from: t(36.22), to: t(40.0), top: 1150, words: W("конкурент нашёл её раньше", [2, 3]) },
  { from: t(41.86), to: t(43.62), top: 1300, words: W("и обгоняет на эти деньги", [1]), size: 76 },

  // 8. The ask, over the speaker.
  { from: t(44.22), to: t(45.34), top: 1120, words: W("хочешь свою цифру?") },
];

/** Full-screen numbers and objects, keyed to the sentence that earns them. */
export const BEATS = {
  research: t(16.16),
  researchBig: t(16.7),
  caseStart: t(24.38),
  minutes: t(28.46),
  money: t(29.2),
  folders: t(32.06),
  shock: t(33.98),
  competitor: t(36.22),
  rocket: t(38.4),
  cta: t(45.42),
  ctaTail: t(47.9),
};
