/**
 * Caption chunks, positioned against the real speech in the take.
 *
 * `silencedetect` gave the pause boundaries in the source audio; the script was
 * then split across the speaking intervals in proportion to word count, so the
 * chunks land on speech rather than on the gaps between sentences. The two long
 * pauses (19.9-21.1s and 26.5-27.6s) fall exactly on the question boundaries,
 * which is what anchors the mapping.
 *
 * `accent` marks the words that render in the handwritten face — they alternate
 * with the bold ones the way the reference edit does, rather than every line
 * looking the same.
 */
export type Chunk = {
  /** Seconds into the composition. */
  from: number;
  to: number;
  text: string;
  /** Words rendered in the yellow handwritten accent face. */
  accent?: boolean;
};

export const FPS = 30;
export const DURATION_SECONDS = 39.79;

/** Speaking intervals, from silencedetect at -30dB / 0.3s. */
export const SPEECH: [number, number][] = [
  [1.92, 5.14],
  [5.63, 6.05],
  [6.44, 8.09],
  [8.75, 12.32],
  [12.86, 13.22],
  [13.89, 16.27],
  [16.62, 18.01],
  [18.45, 19.9],
  [21.11, 21.57],
  [21.94, 23.41],
  [24.15, 24.74],
  [25.25, 26.53],
  [27.65, 29.38],
  [29.78, 32.83],
  [33.19, 33.6],
  [34.1, 34.63],
  [34.93, 36.37],
  [36.7, 38.01],
];

export const CAPTIONS: Chunk[] = [
  // Hook — 1.92 to 6.05
  { from: 1.92, to: 3.0, text: "ЗА 30 СЕКУНД" },
  { from: 3.0, to: 4.1, text: "поймёте", accent: true },
  { from: 4.1, to: 5.14, text: "НУЖЕН ЛИ ВАМ ИИ" },
  { from: 5.63, to: 6.05, text: "или сольёте бюджет", accent: true },

  // Question 1 — 6.44 to 12.32
  { from: 6.44, to: 7.3, text: "ПЕРВЫЙ ВОПРОС" },
  { from: 7.3, to: 8.09, text: "ищут по кругу?", accent: true },
  { from: 8.75, to: 9.7, text: "ДОГОВОР" },
  { from: 9.7, to: 10.5, text: "РЕГЛАМЕНТ" },
  { from: 10.5, to: 11.3, text: "ПРАЙС" },
  { from: 11.3, to: 12.32, text: "то в папках, то в чате", accent: true },

  // Question 2 — 12.86 to 19.9
  { from: 12.86, to: 13.22, text: "ВТОРОЙ ВОПРОС" },
  { from: 13.89, to: 15.0, text: "МЕНЕДЖЕР ИЩЕТ" },
  { from: 15.0, to: 16.27, text: "а клиент ждёт", accent: true },
  { from: 16.62, to: 17.4, text: "«СЕКУНДОЧКУ»" },
  { from: 17.4, to: 18.01, text: "и полез в файлы", accent: true },
  { from: 18.45, to: 19.9, text: "КЛИЕНТ ОСТЫВАЕТ" },

  // Question 3 — 21.11 to 26.53
  { from: 21.11, to: 21.57, text: "ТРЕТИЙ ВОПРОС" },
  { from: 21.94, to: 22.7, text: "ЕСТЬ ЧЕЛОВЕК" },
  { from: 22.7, to: 23.41, text: "без которого всё встанет?", accent: true },
  { from: 24.15, to: 24.74, text: "УШЁЛ В ОТПУСК" },
  { from: 25.25, to: 26.53, text: "И ВСЁ ВСТАЛО" },

  // Close — 27.65 to 38.01
  { from: 27.65, to: 28.5, text: "ДВА «ДА»" },
  { from: 28.5, to: 29.38, text: "из трёх", accent: true },
  { from: 29.78, to: 30.9, text: "ВЫ УЖЕ ТЕРЯЕТЕ" },
  { from: 30.9, to: 31.9, text: "ЧАСЫ И ПРИБЫЛЬ" },
  { from: 31.9, to: 32.83, text: "каждый день", accent: true },
  { from: 33.19, to: 33.6, text: "НЕ КОГДА-НИБУДЬ" },
  { from: 34.1, to: 34.63, text: "А СЕГОДНЯ" },
  // Deliberately not accented: the yellow handwritten CTA card sits on screen
  // over these last beats, and two script lines at once turns to mush.
  { from: 34.93, to: 36.37, text: "НАПИШИТЕ В КОММЕНТАХ" },
  { from: 36.7, to: 38.01, text: "СКОЛЬКО У ВАС «ДА»" },
];
