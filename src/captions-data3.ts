/**
 * Timing map for the full Neirodocs edit on the new take (public/src3.mp4).
 *
 * Everything is in source seconds, taken from the supplied SRT. The picture
 * alternates the talking head (gently pushed, never graded) with full-screen
 * animated scenes; captions only show over the head, since each scene carries
 * its own type. Accent lines are the handwritten yellow ones and are never
 * upper-cased.
 */
export type Chunk = { from: number; to: number; text: string; accent?: boolean };

export const FPS = 30;
export const CONTENT_END = 55.4;

/** Head-window captions. Scene windows below carry their own text. */
export const CAPTIONS: Chunk[] = [
  { from: 3.26, to: 4.1, text: "НЕ ПЛАТИТЕ" },
  { from: 4.1, to: 4.8, text: "СОТРУДНИКАМ" },
  { from: 4.8, to: 5.18, text: "за рутину", accent: true },
  { from: 5.18, to: 5.9, text: "КОТОРУЮ МОЖНО" },
  { from: 5.9, to: 6.62, text: "отдать нейросети", accent: true },
  { from: 6.7, to: 7.7, text: "В КОНЦЕ ПОКАЖУ" },
  { from: 7.7, to: 8.62, text: "ЧТО СЭКОНОМИЛО" },
  { from: 8.62, to: 9.5, text: "кучу прибыли", accent: true },
  { from: 10.3, to: 11.15, text: "ДЛИННЫЙ ДОГОВОР" },
  { from: 11.15, to: 11.94, text: "НА 20 СТРАНИЦ" },
  { from: 12.06, to: 13.06, text: "НЕ ЧИТАЙТЕ\nЦЕЛИКОМ" },
  { from: 22.37, to: 23.29, text: "ПРОТОКОЛ ВСТРЕЧИ" },
  { from: 35.13, to: 36.33, text: "САМОЕ ПОЛЕЗНОЕ" },
  { from: 44.78, to: 45.7, text: "ЭТИ СОВЕТЫ" },
  { from: 45.7, to: 47.0, text: "СЭКОНОМЯТ ТЫСЯЧИ" },
  { from: 47.0, to: 48.5, text: "уберут рутину", accent: true },
];

/** Full-screen animated cutaways, in source seconds. */
export const SCENES: { from: number; to: number; kind: string }[] = [
  { from: 0, to: 3.26, kind: "intro" },
  { from: 13.14, to: 21.22, kind: "contract" },
  { from: 23.41, to: 33.21, kind: "meeting" },
  { from: 36.5, to: 42.0, kind: "template" },
  { from: 42.17, to: 44.01, kind: "trio" },
  { from: 48.9, to: CONTENT_END, kind: "outro" },
];

/** Big keyword title over the head. */
export const HEADLINES = [{ from: 3.26, to: 9.5, lead: "не плати за", word: "рутину" }];

/** Numbered tip pills over the head. */
export const BADGES = [
  { from: 9.66, to: 12.06, n: 1 },
  { from: 21.45, to: 23.41, n: 2 },
  { from: 33.65, to: 36.5, n: 3 },
];

/** Talking-head windows (gentle push, no grade). */
export const SHOTS = [
  { from: 3.26, to: 13.14, oy: 32 },
  { from: 21.22, to: 23.41, oy: 34 },
  { from: 33.21, to: 36.5, oy: 33 },
  { from: 44.01, to: 48.9, oy: 35 },
];
