/**
 * Timing map for the case-study edit on public/src4.mp4.
 * Source seconds, from the supplied SRT. No opening cover — it starts straight
 * on the hook, per the brief.
 */
export type Chunk = { from: number; to: number; text: string; accent?: boolean };

export const FPS = 30;
export const CONTENT_END = 62.8;

export const CAPTIONS: Chunk[] = [
  { from: 0.37, to: 1.2, text: "КЛИЕНТ ПОЧТИ" },
  { from: 1.2, to: 2.05, text: "ВЫГНАЛ МЕНЯ" },
  { from: 2.05, to: 2.9, text: "а через месяц", accent: true },
  { from: 2.9, to: 3.61, text: "ПОЗВОНИЛ САМ" },

  { from: 7.49, to: 9.37, text: "ВЫ ТЕРЯЕТЕ\nДЕНЬГИ" },
  { from: 9.37, to: 10.61, text: "на поиске документов", accent: true },
  { from: 10.89, to: 12.0, text: "ОН СМЕЁТСЯ" },
  { from: 12.0, to: 13.09, text: "«У НАС ПОРЯДОК»" },
  { from: 13.09, to: 14.4, text: "папки разложены", accent: true },
  { from: 15.81, to: 17.01, text: "ДАВАЙТЕ ЗАСЕЧЁМ" },

  { from: 24.9, to: 26.0, text: "А ОН ДУМАЛ" },
  { from: 26.0, to: 27.43, text: "пара секунд", accent: true },

  { from: 40.07, to: 41.35, text: "И ТУТ ОН ЗАМОЛЧАЛ" },

  { from: 50.49, to: 51.6, text: "ПОЧТИ НИКТО" },
  { from: 51.6, to: 52.6, text: "НЕ СЧИТАЕТ ЭТО" },
  { from: 52.6, to: 54.69, text: "её нет в отчётах", accent: true },
  { from: 54.77, to: 55.69, text: "ОНА НЕВИДИМАЯ" },
];

export const SCENES: { from: number; to: number; kind: string }[] = [
  { from: 4.61, to: 7.41, kind: "company" },
  { from: 17.21, to: 23.2, kind: "stopwatch" },
  { from: 23.2, to: 24.9, kind: "reveal" },
  { from: 27.59, to: 35.3, kind: "chaos" },
  { from: 35.55, to: 40.05, kind: "money" },
  { from: 41.61, to: 49.3, kind: "contrast" },
  { from: 55.9, to: CONTENT_END, kind: "cta" },
];

/** Talking-head windows (gentle push, no grade). */
export const SHOTS = [
  { from: 0, to: 4.61, oy: 32 },
  { from: 7.49, to: 17.21, oy: 32 },
  { from: 24.9, to: 27.59, oy: 33 },
  { from: 40.05, to: 41.61, oy: 33 },
  { from: 49.3, to: 55.9, oy: 34 },
];
