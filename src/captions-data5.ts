/**
 * Timing map for «Куда НЕ надо внедрять ИИ» (public/src5.mp4), built from the
 * supplied SRT.
 *
 * Every SRT line is split into 2–4 word chunks with its window divided by
 * character count, so the type changes roughly every 0.8s. That cadence — not
 * cutting the picture faster — is what carries a flat delivery.
 *
 * The numbered beats («Первое», «Второе», «Третье») are short words with pauses
 * either side, which makes them the natural place for hard full-screen hits.
 * Everything else stays on the speaker with graphics popping over him, so he is
 * on screen for most of the run and the frame still never rests.
 */
export const FPS = 30;
export const TRIM_START = 1.2;
export const CONTENT_END = 55.0;

export type Chunk = { from: number; to: number; text: string; accent?: boolean };

export const CAPTIONS: Chunk[] = [
  { from: 1.37, to: 2.2, text: "Я ВНЕДРЯЮ ИИ" },
  { from: 2.2, to: 2.75, text: "В БИЗНЕСЫ" },
  { from: 2.75, to: 3.49, text: "И СЕЙЧАС ПОКАЖУ" },
  { from: 3.53, to: 4.1, text: "КУДА ВНЕДРЯТЬ" },
  { from: 4.1, to: 4.73, text: "НЕ НАДО", accent: true },
  { from: 4.85, to: 5.55, text: "ЕСЛИ НЕ ХОЧЕШЬ" },
  { from: 5.55, to: 6.69, text: "СЛИТЬ БЮДЖЕТ", accent: true },

  { from: 7.57, to: 8.69, text: "НЕ НАЧИНАЙ С ИИ" },
  { from: 8.77, to: 9.81, text: "НАЧНИ С ЦИФРЫ", accent: true },
  { from: 10.13, to: 11.09, text: "САМАЯ ЧАСТАЯ ИСТОРИЯ" },
  { from: 11.17, to: 12.6, text: "СОБСТВЕННИК\nНАСМОТРЕЛСЯ" },
  { from: 12.6, to: 14.65, text: "«НАМ НУЖЕН ИИ»", accent: true },
  { from: 14.77, to: 15.9, text: "ВНЕДРИЛ КУДА ПОПАЛО" },
  { from: 15.9, to: 16.8, text: "ПОТРАТИЛ ДЕНЬГИ" },
  { from: 16.8, to: 17.97, text: "НИЧЕГО НЕ ИЗМЕНИЛОСЬ" },
  { from: 18.27, to: 20.51, text: "А ИНОГДА СТАЛО ХУЖЕ" },
  { from: 20.67, to: 21.5, text: "НЕ ПОНИМАЕШЬ" },
  { from: 21.5, to: 22.47, text: "ГДЕ ТЕРЯЕШЬ", accent: true },
  { from: 22.51, to: 23.7, text: "СНАЧАЛА УЗКОЕ МЕСТО" },
  { from: 23.7, to: 24.91, text: "ПОТОМ ВНЕДРЯЕШЬ" },

  { from: 26.07, to: 26.71, text: "ВНИМАТЕЛЬНО", accent: true },
  { from: 26.79, to: 27.8, text: "НЕ ГРУЗИ ДОКУМЕНТЫ" },
  { from: 27.8, to: 28.87, text: "В CHATGPT", accent: true },
  { from: 28.95, to: 30.2, text: "ВСЁ ЧТО ЗАКИДЫВАЕШЬ" },
  { from: 30.2, to: 31.91, text: "УХОДИТ ЗА РУБЕЖ", accent: true },
  { from: 31.95, to: 33.99, text: "С ДАННЫМИ\nТВОИХ КЛИЕНТОВ" },
  { from: 34.15, to: 35.3, text: "ПО 152-ФЗ" },
  { from: 35.3, to: 36.2, text: "ОТВЕЧАТЬ ТЕБЕ", accent: true },
  { from: 36.2, to: 37.59, text: "ОН НЕ ЗНАЕТ\nТВОЙ ДОГОВОР" },
  { from: 37.63, to: 38.7, text: "СПРОСИШЬ ПРО ПУНКТ" },
  { from: 38.7, to: 39.6, text: "ВЫДУМАЕТ", accent: true },
  { from: 39.6, to: 40.79, text: "А ТЫ ПО ЭТОМУ\nРАБОТАЕШЬ" },

  { from: 41.85, to: 43.53, text: "НЕ ЖДИ ЧТО\nЗАМЕНИТ ЛЮДЕЙ" },
  { from: 43.69, to: 44.49, text: "НЕ ЗАМЕНИТ", accent: true },
  { from: 44.61, to: 45.7, text: "ОН ЗАБИРАЕТ РУТИНУ" },
  { from: 45.7, to: 46.85, text: "ПОИСК, РАЗБОР" },
  { from: 46.85, to: 47.97, text: "ОДНОТИПНЫЕ ОТВЕТЫ" },
  { from: 48.37, to: 49.5, text: "ХОЧЕШЬ ЧЕК-ЛИСТ?" },
  { from: 49.5, to: 50.77, text: "КУДА ВНЕДРЯТЬ СТОИТ" },
  { from: 51.29, to: 52.33, text: "А КУДА ТОЧНО НЕТ", accent: true },
];

/** Hard full-screen hits. Short by design — a stinger, not a cutaway. */
export const SCENES: { from: number; to: number; kind: string }[] = [
  { from: 6.85, to: 7.55, kind: "n1" },
  { from: 25.07, to: 26.05, kind: "n2" },
  { from: 41.17, to: 41.83, kind: "n3" },
  { from: 52.41, to: CONTENT_END, kind: "cta" },
];

/** Graphics that pop over the speaker on the word they illustrate. */
export const POPS: { at: number; dur: number; kind: string }[] = [
  { at: 5.55, dur: 1.1, kind: "money" },
  { at: 8.77, dur: 1.0, kind: "digits" },
  { at: 12.6, dur: 1.6, kind: "hype" },
  { at: 21.5, dur: 0.95, kind: "search" },
  { at: 27.8, dur: 1.05, kind: "gptban" },
  { at: 30.2, dur: 1.7, kind: "flyout" },
  { at: 34.15, dur: 1.15, kind: "law" },
  { at: 38.7, dur: 0.9, kind: "invent" },
  { at: 44.61, dur: 3.3, kind: "routine" },
];

/** Re-frames of the take, cut on pauses found in the audio. */
export const SHOTS: { from: number; to: number; scale: number; ox: number; oy: number }[] = [
  { from: TRIM_START, to: 4.85, scale: 1.0, ox: 50, oy: 32 },
  { from: 4.85, to: 6.85, scale: 1.12, ox: 50, oy: 26 },
  { from: 7.55, to: 10.13, scale: 1.0, ox: 50, oy: 32 },
  { from: 10.13, to: 14.77, scale: 1.08, ox: 46, oy: 28 },
  { from: 14.77, to: 18.27, scale: 1.0, ox: 54, oy: 33 },
  { from: 18.27, to: 22.51, scale: 1.13, ox: 50, oy: 26 },
  { from: 22.51, to: 25.07, scale: 1.02, ox: 48, oy: 33 },
  { from: 26.05, to: 28.95, scale: 1.1, ox: 50, oy: 27 },
  { from: 28.95, to: 34.15, scale: 1.0, ox: 52, oy: 33 },
  { from: 34.15, to: 37.63, scale: 1.12, ox: 48, oy: 26 },
  { from: 37.63, to: 41.17, scale: 1.02, ox: 50, oy: 32 },
  { from: 41.83, to: 44.61, scale: 1.1, ox: 50, oy: 27 },
  { from: 44.61, to: 48.37, scale: 1.0, ox: 50, oy: 33 },
  { from: 48.37, to: 52.41, scale: 1.11, ox: 50, oy: 27 },
];

/** Depth word behind the matted speaker, during the hook only. */
export const BEHIND: { from: number; to: number; text: string; color: string; top: number }[] = [
  { from: 1.37, to: 3.53, text: "ВНЕДРЯЮ ИИ", color: "#45D0FF", top: 0.035 },
  { from: 3.53, to: 4.85, text: "НЕ НАДО", color: "#FFD60A", top: 0.035 },
];

/** Small corner badge marking which of the three points is running. */
export const BADGES: { from: number; to: number; n: number }[] = [
  { from: 7.55, to: 25.07, n: 1 },
  { from: 26.05, to: 41.17, n: 2 },
  { from: 41.83, to: 48.37, n: 3 },
];
