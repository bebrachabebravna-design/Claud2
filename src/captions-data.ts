/**
 * Caption chunks, timed against the real speech in the take.
 *
 * `silencedetect` gave the speaking intervals; the script was then walked
 * across them allocating each word time in proportion to its length, so the
 * chunks track the voice instead of being placed by eye. The take runs at
 * ~3.9 words/second, which is why an eyeballed pass drifted more than a second
 * by the end.
 *
 * `accent` marks the chunks that render in the handwritten face — they
 * alternate with the bold ones the way the reference edit does.
 */
export type Chunk = {
  /** Seconds into the composition. */
  from: number;
  to: number;
  text: string;
  /** Rendered in the yellow handwritten face. */
  accent?: boolean;
};

export const FPS = 30;
export const DURATION_SECONDS = 39.79;

export const CAPTIONS: Chunk[] = [
  { from: 1.92, to: 2.49, text: "За 30 секунд" },
  { from: 2.49, to: 2.9, text: "поймёте", accent: true },
  { from: 2.9, to: 3.59, text: "нужен ли вам ИИ" },
  { from: 3.59, to: 4.05, text: "в бизнесе" },
  { from: 4.05, to: 4.62, text: "или сольёте", accent: true },
  { from: 4.62, to: 4.96, text: "бюджет" },
  { from: 4.96, to: 6.53, text: "Первый вопрос" },
  { from: 6.53, to: 7.22, text: "Ваши люди ищут" },
  { from: 7.22, to: 8.8, text: "документы по кругу", accent: true },
  { from: 8.8, to: 9.2, text: "Договор" },
  { from: 9.2, to: 9.72, text: "регламент" },
  { from: 9.72, to: 10.01, text: "прайс" },
  { from: 10.01, to: 10.53, text: "то в папках", accent: true },
  { from: 10.53, to: 10.93, text: "то в чате", accent: true },
  { from: 10.93, to: 11.39, text: "то в почте", accent: true },
  { from: 11.39, to: 12.08, text: "Второй вопрос" },
  { from: 12.08, to: 14.21, text: "Пока менеджер ищет" },
  { from: 14.21, to: 14.78, text: "клиент ждёт", accent: true },
  { from: 14.78, to: 15.7, text: "Вот прям на созвоне" },
  { from: 15.7, to: 16.62, text: "секундочку", accent: true },
  { from: 16.62, to: 17.31, text: "и полез в файлы" },
  { from: 17.31, to: 17.71, text: "А клиент" },
  { from: 17.71, to: 19.25, text: "тем временем остывает", accent: true },
  { from: 19.25, to: 21.15, text: "Третий вопрос" },
  { from: 21.15, to: 22.15, text: "Есть человек" },
  { from: 22.15, to: 23.35, text: "без которого всё встанет", accent: true },
  { from: 23.35, to: 25.29, text: "Уйдёт в отпуск" },
  { from: 25.29, to: 25.87, text: "или по делам" },
  { from: 25.87, to: 26.44, text: "и все встает", accent: true },
  { from: 26.44, to: 28.14, text: "Если хотя бы" },
  { from: 28.14, to: 28.83, text: "на два вопроса" },
  { from: 28.83, to: 29.8, text: "ответили да", accent: true },
  { from: 29.8, to: 30.49, text: "вы уже теряете" },
  { from: 30.49, to: 31.18, text: "часы и прибыль" },
  { from: 31.18, to: 31.75, text: "каждый день", accent: true },
  { from: 31.75, to: 32.56, text: "Не когда-нибудь" },
  { from: 32.56, to: 33.38, text: "а сегодня", accent: true },
  { from: 33.38, to: 35.21, text: "Напишите в комментах" },
  { from: 35.21, to: 35.96, text: "сколько у вас да" },
  { from: 35.96, to: 36.3, text: "из трёх", accent: true },
  { from: 36.3, to: 37.32, text: "разберу самые" },
  { from: 37.32, to: 38.01, text: "частые случаи", accent: true },
];
