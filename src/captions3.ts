/**
 * Captions for the new take, chunked from the supplied SRT.
 *
 * The SRT lines run 2–4 seconds each, which is far too long to hold as one
 * on-screen block, so every subtitle is split into 2–3 word chunks and its
 * window divided proportionally to character count. That keeps the type
 * changing every ~0.8s, which is what makes the cut feel fast without cutting
 * the picture more often.
 *
 * Times are source seconds. The slice ends at 21.3s so it closes on a finished
 * sentence rather than mid-phrase at a hard 20.0.
 */
export type Chunk = {
  from: number;
  to: number;
  text: string;
  /** Handwritten yellow line. Never upper-cased — a script face in caps breaks. */
  accent?: boolean;
};

export const FPS = 30;
export const END = 21.3;
export const SPEECH_IN = 3.26;

export const CAPS: Chunk[] = [
  { from: 3.26, to: 4.1, text: "НЕ ПЛАТИТЕ" },
  { from: 4.1, to: 4.8, text: "СОТРУДНИКАМ" },
  { from: 4.8, to: 5.16, text: "за рутину", accent: true },
  { from: 5.18, to: 5.9, text: "КОТОРУЮ МОЖНО" },
  { from: 5.9, to: 6.62, text: "отдать нейросети", accent: true },
  { from: 6.7, to: 7.6, text: "В КОНЦЕ ПОКАЖУ" },
  { from: 7.6, to: 8.6, text: "ЧТО СЭКОНОМИЛО" },
  { from: 8.6, to: 9.5, text: "кучу прибыли", accent: true },
  { from: 9.66, to: 10.3, text: "ПЕРВОЕ" },
  { from: 10.3, to: 11.15, text: "ДЛИННЫЙ ДОГОВОР" },
  { from: 11.15, to: 11.94, text: "НА 20 СТРАНИЦ" },
  { from: 12.06, to: 13.06, text: "НЕ ЧИТАЙТЕ\nЦЕЛИКОМ" },
  { from: 13.14, to: 14.2, text: "закиньте в нейросеть", accent: true },
  { from: 14.2, to: 15.06, text: "И ПОПРОСИТЕ" },
  { from: 15.22, to: 16.15, text: "ВЫПИШИТЕ СРОКИ" },
  { from: 16.15, to: 17.05, text: "ШТРАФЫ, УСЛОВИЯ" },
  { from: 17.05, to: 17.95, text: "РАСТОРЖЕНИЕ" },
  { from: 17.95, to: 18.86, text: "одним списком", accent: true },
  { from: 18.98, to: 19.95, text: "ЧИТАЛИ ПОЛЧАСА" },
  { from: 19.95, to: 21.22, text: "ПОЛУЧИТЕ\nЗА МИНУТУ" },
];

/**
 * Picture beats. The frame is re-composed on each one — roughly every 3
 * seconds, matching the brief's "смена кадра каждые 3–6 сек".
 */
export const BEATS = [0, 3.26, 6.7, 9.66, 12.06, 15.22, 18.98, END];
