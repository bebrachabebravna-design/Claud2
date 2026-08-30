/**
 * Timing map for «Куда НЕ надо внедрять ИИ» (public/src5.mp4).
 *
 * Every window below comes straight from the supplied SRT. Where an SRT line is
 * too long to hold as one block, it is split at a sense boundary and the time
 * divided by character count, so a chunk never lands ahead of or behind the
 * words — an earlier pass eyeballed these splits and drifted off the speech.
 *
 * Nothing is trimmed: the edit runs the full 56.24s of source, head and tail
 * included.
 */
export const FPS = 30;
export const TRIM_START = 0;
export const CONTENT_END = 56.24;

export type Chunk = { from: number; to: number; text: string; accent?: boolean };

export const CAPTIONS: Chunk[] = [
  { from: 1.37, to: 2.04, text: "Я ВНЕДРЯЮ ИИ" },
  { from: 2.04, to: 2.58, text: "В БИЗНЕСЫ" },
  { from: 2.58, to: 3.49, text: "И СЕЙЧАС ПОКАЖУ" },
  { from: 3.53, to: 4.33, text: "КУДА ВНЕДРЯТЬ" },
  { from: 4.33, to: 4.73, text: "НЕ НАДО", accent: true },
  { from: 4.85, to: 5.67, text: "ЕСЛИ НЕ ХОЧЕШЬ" },
  { from: 5.67, to: 6.69, text: "СЛИТЬ БЮДЖЕТ", accent: true },

  { from: 7.57, to: 8.69, text: "НЕ НАЧИНАЙ С ИИ" },
  { from: 8.77, to: 9.81, text: "НАЧНИ С ЦИФРЫ", accent: true },
  { from: 10.13, to: 11.09, text: "САМАЯ ЧАСТАЯ\nИСТОРИЯ" },
  { from: 11.17, to: 12.5, text: "СОБСТВЕННИК\nБИЗНЕСА" },
  { from: 12.5, to: 13.83, text: "НАСМОТРЕЛСЯ\nИ РЕШИЛ" },
  { from: 13.83, to: 14.65, text: "«НАМ НУЖЕН ИИ»", accent: true },
  { from: 14.77, to: 15.88, text: "ВНЕДРИЛ КУДА\nПОПАЛО" },
  { from: 15.88, to: 16.79, text: "ПОТРАТИЛ ДЕНЬГИ" },
  { from: 16.79, to: 17.97, text: "НИЧЕГО НЕ\nИЗМЕНИЛОСЬ" },
  { from: 18.27, to: 20.51, text: "А ИНОГДА СТАЛО\nДАЖЕ ХУЖЕ" },
  { from: 20.67, to: 21.7, text: "ПОТОМУ ЧТО\nНЕ ПОНИМАЕШЬ" },
  { from: 21.7, to: 22.47, text: "ГДЕ ИМЕННО ТЕРЯЮТ", accent: true },
  { from: 22.51, to: 24.01, text: "СНАЧАЛА НАХОДИШЬ\nУЗКОЕ МЕСТО" },
  { from: 24.01, to: 24.91, text: "А ПОТОМ ВНЕДРЯЕШЬ" },

  { from: 26.07, to: 26.71, text: "ВНИМАТЕЛЬНО", accent: true },
  { from: 26.79, to: 27.83, text: "НЕ ГРУЗИ ДОКУМЕНТЫ" },
  { from: 27.83, to: 28.87, text: "КОМПАНИИ В CHATGPT", accent: true },
  { from: 28.95, to: 30.31, text: "ВСЁ ЧТО ТЫ ТУДА\nЗАКИДЫВАЕШЬ" },
  { from: 30.31, to: 31.91, text: "УХОДИТ НА\nЗАРУБЕЖНЫЕ СЕРВИСЫ", accent: true },
  { from: 31.95, to: 33.01, text: "ВМЕСТЕ С ДАННЫМИ" },
  { from: 33.01, to: 33.99, text: "ТВОИХ КЛИЕНТОВ" },
  { from: 34.15, to: 34.82, text: "ПО 152-ФЗ" },
  { from: 34.82, to: 35.83, text: "ОТВЕЧАТЬ ТЕБЕ", accent: true },
  { from: 35.83, to: 37.59, text: "ОН ТВОЙ ДОГОВОР\nНЕ ЗНАЕТ" },
  { from: 37.63, to: 38.78, text: "СПРОСИШЬ ПРО ПУНКТ" },
  { from: 38.78, to: 39.36, text: "ВЫДУМАЕТ", accent: true },
  { from: 39.36, to: 40.79, text: "А ТЫ ПО ЭТОМУ\nРАБОТАЕШЬ" },

  { from: 41.85, to: 43.53, text: "НЕ ЖДИ ЧТО\nЗАМЕНИТ ЛЮДЕЙ" },
  { from: 43.69, to: 44.49, text: "ОН НЕ ЗАМЕНИТ", accent: true },
  { from: 44.61, to: 45.59, text: "ОН ЗАБИРАЕТ РУТИНУ" },
  { from: 45.59, to: 47.0, text: "ПОИСК, РАЗБОР\nДОКУМЕНТОВ" },
  { from: 47.0, to: 47.97, text: "ОДНОТИПНЫЕ ОТВЕТЫ" },
  { from: 48.37, to: 49.45, text: "ХОЧЕШЬ ЧЕК-ЛИСТ" },
  { from: 49.45, to: 50.77, text: "КУДА ВНЕДРЯТЬ СТОИТ" },
  { from: 51.29, to: 52.33, text: "А КУДА ТОЧНО НЕТ", accent: true },
];

/**
 * Full-screen hits, sat on «Первое / Второе / Третье» — short words with a
 * pause either side, which is exactly where a hard cut belongs. The CTA card
 * runs to the end of the source so the tail is never clipped.
 */
export const SCENES: { from: number; to: number; kind: string }[] = [
  { from: 6.8, to: 7.5, kind: "n1" },
  { from: 25.0, to: 25.92, kind: "n2" },
  { from: 41.1, to: 41.8, kind: "n3" },
  { from: 52.41, to: CONTENT_END, kind: "cta" },
];

/** Graphics that pop over the speaker on the word they illustrate. */
export const POPS: { at: number; dur: number; kind: string }[] = [
  { at: 5.67, dur: 1.0, kind: "money" },
  { at: 8.77, dur: 1.0, kind: "digits" },
  { at: 13.83, dur: 0.82, kind: "hype" },
  { at: 21.7, dur: 0.77, kind: "search" },
  { at: 27.83, dur: 1.04, kind: "gptban" },
  { at: 30.31, dur: 1.6, kind: "flyout" },
  { at: 34.15, dur: 1.5, kind: "law" },
  { at: 38.78, dur: 0.58, kind: "invent" },
  { at: 44.61, dur: 3.3, kind: "routine" },
];

/**
 * Re-frames, cut on pauses found in the audio. The first one starts where the
 * matted hook ends — overlapping them meant three video layers decoding at
 * once over the opening seconds, which is what made the start stutter.
 */
export const SHOTS: { from: number; to: number; scale: number; ox: number; oy: number }[] = [
  // Plain picture over the settling-in moment: he is still lowering his hands
  // here, and matting that motion produced a smeared, ghosted cut-out.
  { from: 0, to: 1.37, scale: 1.0, ox: 50, oy: 32 },
  { from: 4.73, to: 6.8, scale: 1.06, ox: 50, oy: 28 },
  { from: 7.5, to: 10.13, scale: 1.0, ox: 50, oy: 32 },
  { from: 10.13, to: 14.77, scale: 1.07, ox: 46, oy: 28 },
  { from: 14.77, to: 18.27, scale: 1.0, ox: 54, oy: 33 },
  { from: 18.27, to: 22.51, scale: 1.09, ox: 50, oy: 27 },
  { from: 22.51, to: 25.0, scale: 1.01, ox: 48, oy: 33 },
  { from: 25.92, to: 28.95, scale: 1.07, ox: 50, oy: 28 },
  { from: 28.95, to: 34.15, scale: 1.0, ox: 52, oy: 33 },
  { from: 34.15, to: 37.63, scale: 1.08, ox: 48, oy: 27 },
  { from: 37.63, to: 41.1, scale: 1.01, ox: 50, oy: 32 },
  { from: 41.8, to: 44.61, scale: 1.07, ox: 50, oy: 28 },
  { from: 44.61, to: 48.37, scale: 1.0, ox: 50, oy: 33 },
  { from: 48.37, to: 52.41, scale: 1.08, ox: 50, oy: 28 },
];

/** Depth word behind the matted speaker, over the hook. */
export const BEHIND: { from: number; to: number; text: string; color: string; top: number }[] = [
  { from: 1.37, to: 3.49, text: "ВНЕДРЯЮ ИИ", color: "#45D0FF", top: 0.035 },
  { from: 3.53, to: 4.73, text: "НЕ НАДО", color: "#FFD60A", top: 0.035 },
];

/** Corner badge marking which of the three points is running. */
export const BADGES: { from: number; to: number; n: number }[] = [
  { from: 7.5, to: 25.0, n: 1 },
  { from: 25.92, to: 41.1, n: 2 },
  { from: 41.8, to: 48.37, n: 3 },
];

/** The matted hook runs from the first spoken word to here. */
export const HOOK_START = 1.37;
export const HOOK_END = 4.73;
