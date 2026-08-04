/**
 * Captions for the "3 приёма для документов" take, built from the supplied SRT.
 *
 * Speech runs 3.45–54.43s; the head (settling before the first word) and tail
 * are trimmed. Sentence in/out points come from the SRT, then each sentence is
 * split into display chunks proportionally to character count so the lines
 * track delivery. Times below are in SOURCE seconds; the edit subtracts
 * TRIM_START to place them on the trimmed timeline.
 */
export type Chunk = {
  from: number;
  to: number;
  text: string;
  accent?: boolean;
};

export const FPS = 30;
// No trim: the head stays in (the user asked for it) and, more importantly,
// starting audio and picture both at frame 0 with no offset guarantees the
// voice stays locked to the lips — the earlier lag came from a trim offset that
// applied to the picture but not the audio element.
export const TRIM_START = 0;
export const CONTENT_END = 57.13;
export const DURATION_SECONDS = CONTENT_END - TRIM_START;

export const CAPTIONS: Chunk[] = [
  { from: 3.45, to: 5.4, text: "НЕ ПЛАТИТЕ СОТРУДНИКАМ" },
  { from: 5.4, to: 5.95, text: "за рутину", accent: true },
  { from: 5.95, to: 6.51, text: "ЕЁ СДЕЛАЕТ НЕЙРОСЕТЬ" },
  { from: 6.69, to: 7.85, text: "в конце покажу то,", accent: true },
  { from: 7.85, to: 9.45, text: "ЧТО СЭКОНОМИЛО ПРИБЫЛЬ" },
  { from: 9.75, to: 10.5, text: "ПЕРВОЕ", accent: true },
  { from: 10.5, to: 11.91, text: "ДОГОВОР НА 20 СТРАНИЦ" },
  { from: 12.09, to: 13.6, text: "НЕ ЧИТАЙТЕ ЦЕЛИКОМ" },
  { from: 13.6, to: 15.0, text: "закиньте в нейросеть", accent: true },
  { from: 15.0, to: 17.07, text: "СРОКИ, ШТРАФЫ, УСЛОВИЯ" },
  { from: 17.43, to: 18.5, text: "одним списком", accent: true },
  { from: 18.5, to: 19.7, text: "ПОЛЧАСА ЧТЕНИЯ" },
  { from: 19.7, to: 21.03, text: "= ОДНА МИНУТА" },
  { from: 21.45, to: 22.3, text: "ВТОРОЕ", accent: true },
  { from: 22.3, to: 23.6, text: "ПРОТОКОЛ ВСТРЕЧИ" },
  { from: 23.6, to: 26.31, text: "включите запись", accent: true },
  { from: 26.73, to: 28.2, text: "отдайте нейросети", accent: true },
  { from: 28.2, to: 29.49, text: "СПИСОК ЗАДАЧ" },
  { from: 29.55, to: 31.3, text: "КТО ЧТО ДЕЛАЕТ" },
  { from: 31.3, to: 33.09, text: "и до какого числа", accent: true },
  { from: 33.69, to: 34.6, text: "ТРЕТЬЕ", accent: true },
  { from: 34.6, to: 36.33, text: "САМОЕ ПОЛЕЗНОЕ" },
  { from: 36.93, to: 39.57, text: "закиньте свой шаблон", accent: true },
  { from: 39.69, to: 40.7, text: "готовый документ", accent: true },
  { from: 40.7, to: 41.67, text: "ЗА СЕКУНДЫ" },
  { from: 42.15, to: 43.0, text: "ЭКОНОМИЯ И ПРИБЫЛЬ" },
  { from: 43.0, to: 43.77, text: "и время", accent: true },
  { from: 44.79, to: 46.8, text: "ЭТО УБЕРЁТ РУТИНУ" },
  { from: 46.8, to: 48.57, text: "из вашей компании", accent: true },
  { from: 48.99, to: 51.2, text: "СОХРАНИТЕ, ЧТОБ НЕ ПОТЕРЯТЬ" },
  { from: 51.2, to: 52.71, text: "а в комментах:", accent: true },
  { from: 52.71, to: 54.43, text: "КАКАЯ РУТИНА БЕСИТ БОЛЬШЕ?" },
];
