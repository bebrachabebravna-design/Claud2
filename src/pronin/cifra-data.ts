import { Cap, cap } from "./Caps";

/**
 * Timing map for «Самая дорогая статья расходов» (public/speaker-cifra.mp4).
 *
 * Times come from the supplied SRT, shifted by TRIM, so any beat can be checked
 * against the transcript by adding TRIM back.
 *
 * The head is trimmed by 1.5s: the take opens on that much silence before the
 * first word. No speech is lost — the cut lands half a second before "Самая".
 */
export const TRIM = 1.5;
/** Source runs 52.0s; the tail is kept whole. */
export const REEL_END = 50.5;

/** Convert a raw SRT second into reel time. */
export const t = (s: number) => s - TRIM;

/* ------------------------------------------------------------------ */
/* Speaker framing                                                      */

/**
 * Where the speaker sits at any moment, as a rectangle on the 1080x1920 canvas.
 *
 * This is the answer to the previous cut's biggest problem. That version put
 * him in his own chapters and the graphics in theirs, so the reel kept leaving
 * one world for another — half of it was a plain talking head with captions,
 * which is exactly the edit we were moving away from.
 *
 * Here he never leaves. He is a card in the same system as every other card,
 * and the card travels: full bleed when he has to be believed, a wide panel at
 * the top while graphics build under him, a small corner tile when a number has
 * to own the frame. The world underneath is continuous, so shrinking him
 * reveals the canvas instead of cutting to it.
 */
export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  /** objectPosition Y, in percent — the crop has to keep his eyes in frame. */
  oy: number;
};

export const FRAMES: Record<string, Rect> = {
  full: { x: 0, y: 0, w: 1080, h: 1920, radius: 0, oy: 44 },
  /** Wide panel across the top; graphics own 800–1240 beneath it. */
  cardTop: { x: 110, y: 150, w: 860, h: 560, radius: 46, oy: 30 },
  /** Corner tile, for beats where a single number has to be the whole frame. */
  cardSmall: { x: 648, y: 150, w: 372, h: 440, radius: 36, oy: 28 },
};

/** Keyframes for the travelling card. Movement between them is sprung. */
export const SHOTS: { at: number; frame: keyof typeof FRAMES }[] = [
  { at: 0, frame: "full" },
  { at: t(10.16), frame: "cardTop" },
  { at: t(16.16), frame: "cardSmall" },
  { at: t(20.98), frame: "full" },
  { at: t(24.38), frame: "cardTop" },
  { at: t(32.06), frame: "cardSmall" },
  { at: t(36.22), frame: "cardTop" },
  { at: t(44.22), frame: "full" },
];

/* ------------------------------------------------------------------ */
/* Ground                                                               */

/** Which world the canvas is in. Grounds cross-fade; they never cut. */
export const GROUNDS: { at: number; mode: "light" | "dark" }[] = [
  { at: 0, mode: "dark" },
  { at: t(10.16), mode: "light" },
  { at: t(16.16), mode: "dark" },
  { at: t(24.38), mode: "light" },
  { at: t(32.06), mode: "dark" },
  { at: t(36.22), mode: "light" },
  { at: t(44.22), mode: "dark" },
];

/* ------------------------------------------------------------------ */
/* Captions                                                             */

/**
 * Every spoken line, white with yellow accents, on screen the whole time
 * anybody is talking. Accents are marked with asterisks.
 */
export const CAPS: Cap[] = [
  { from: t(2.0), to: t(4.6), words: cap("самая *дорогая* статья расходов") },
  { from: t(4.68), to: t(6.0), words: cap("её нет ни в одном отчёте") },
  { from: t(6.12), to: t(7.24), words: cap("поэтому ты её *не видишь*") },
  { from: t(7.32), to: t(8.48), words: cap("а *конкурент* уже увидел") },
  { from: t(8.6), to: t(10.0), words: cap("сейчас покажу, как её найти") },

  { from: t(10.16), to: t(12.72), words: cap("это *время*, которое сотрудники тратят каждый день") },
  { from: t(12.92), to: t(14.2), words: cap("чтобы найти *нужный документ*") },
  { from: t(14.32), to: t(15.92), words: cap("не работают — просто *ищут*") },

  { from: t(16.16), to: t(18.68), words: cap("в среднем *полтора часа* в день на человека") },
  { from: t(18.8), to: t(19.68), words: cap("звучит как мелочь") },
  { from: t(19.76), to: t(20.76), words: cap("*считаем* на кейсе") },

  { from: t(20.98), to: t(24.26), words: cap("дистрибьютор, в штате *24 менеджера*") },

  { from: t(24.38), to: t(28.34), words: cap("засекли, за сколько менеджер отвечает клиенту") },
  { from: t(28.46), to: t(32.02), words: cap("вышло *11 минут* — в деньгах *238 000*") },
  { from: t(32.06), to: t(33.78), words: cap("за то, что люди открывают *седьмую папку*") },
  { from: t(33.98), to: t(36.14), words: cap("собственник был в шоке — думал, у него порядок") },

  { from: t(36.22), to: t(41.5), words: cap("конкурент нашёл эту цифру *заранее* и убрал её через ИИ") },
  { from: t(41.86), to: t(43.62), words: cap("и *обгоняет* на эти же деньги") },

  { from: t(44.22), to: t(45.34), words: cap("хочешь узнать *свою цифру*?") },
  { from: t(45.42), to: t(47.82), words: cap("напиши в комментариях *цифру*") },
  { from: t(47.9), to: t(50.4), words: cap("посчитаем, сколько теряешь *именно ты*") },
];

/** Captions sit in the same place all the way through, as they do on Instagram. */
export const CAP_TOP = 1300;

/* ------------------------------------------------------------------ */

/**
 * Ranges where the speaker is matted out of the plate, so graphics can pass
 * behind him rather than always in front.
 *
 * Only a couple of seconds are cut out: alpha matting runs about four seconds a
 * frame here, and depth has to be sold two or three times for a whole edit to
 * read as dimensional. This one sits in the hook, where the ground is dark and
 * matches the lighting on him.
 */
export const CUTOUTS: { from: number; dur: number; src: string }[] = [
  { from: t(7.0), dur: 1.95, src: "cut-hook.webm" },
];

/** Graphic beats, each hung on the sentence that earns it. */
export const BEATS = {
  hookSearch: t(4.68),
  hookRival: t(7.15),
  folders: t(10.4),
  hours: t(16.4),
  caseChips: t(21.3),
  stopwatch: t(24.6),
  minutes: t(28.46),
  money: t(30.1),
  seventh: t(32.2),
  rival: t(36.4),
  rocket: t(38.6),
  cta: t(45.42),
  ctaTail: t(47.9),
};
