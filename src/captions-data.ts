/**
 * Caption chunks built from the supplied SRT.
 *
 * The SRT gives sentence-level in/out points; each sentence is then split into
 * display chunks with time allocated in proportion to character count, so the
 * lines track the delivery instead of being placed by eye.
 *
 * A few obvious speech-to-text slips are corrected against the brand facts —
 * "Нокументы"/"страф"/"и агент"/"тираешь" and the mangled site name — since a
 * typo burned into a caption is worse than a missing one.
 *
 * `accent` marks the chunks that render in the handwritten face; they alternate
 * with the bold ones so the frame never shows two of the same treatment in a row.
 */
export type Chunk = {
  /** Seconds into the composition. */
  from: number;
  to: number;
  text: string;
  /** Rendered in the handwritten accent face. */
  accent?: boolean;
};

export const FPS = 30;

/**
 * The take opens with the founder settling in front of the camera and ends with
 * him reaching to stop it; neither belongs in the cut. Speech runs 3.02–52.48s,
 * so the head is trimmed just before the first word and the tail just after the
 * last. Caption/scene/shot times below stay in SOURCE seconds — the edit
 * subtracts TRIM_START to place them on the trimmed timeline.
 */
export const TRIM_START = 2.9;
export const CONTENT_END = 52.6;
export const DURATION_SECONDS = CONTENT_END - TRIM_START;

export const CAPTIONS: Chunk[] = [
  { from: 3.02, to: 4.18, text: "КОМПАНИЯ ИЗ 30 ЧЕЛОВЕК" },
  { from: 4.18, to: 5.13, text: "теряет 5 миллионов", accent: true },
  { from: 5.13, to: 5.76, text: "РУБЛЕЙ В ГОД" },
  { from: 5.76, to: 6.64, text: "и почти никто", accent: true },
  { from: 6.64, to: 7.38, text: "НЕ ЗАМЕЧАЕТ" },
  { from: 7.38, to: 8.06, text: "НЕ РЕКЛАМА" },
  { from: 8.06, to: 8.67, text: "НЕ НАЛОГИ" },
  { from: 8.67, to: 9.55, text: "а на том, что", accent: true },
  { from: 9.55, to: 10.4, text: "СОТРУДНИКИ ПРОСТО" },
  { from: 10.4, to: 11.11, text: "ИЩУТ ДОКУМЕНТЫ" },
  { from: 11.84, to: 12.43, text: "42% ЛЮДЕЙ" },
  { from: 12.43, to: 13.81, text: "тратят на поиск файла", accent: true },
  { from: 13.81, to: 14.73, text: "БОЛЬШЕ ВРЕМЕНИ" },
  { from: 14.73, to: 15.98, text: "ЧЕМ НА РАБОТУ С НИМ" },
  { from: 15.98, to: 17.03, text: "1,5–2 ЧАСА В ДЕНЬ" },
  { from: 17.03, to: 17.58, text: "у каждого", accent: true },
  { from: 17.58, to: 19.12, text: "ЭТО ПОЧТИ 3 МЕСЯЦА В ГОДУ" },
  { from: 19.35, to: 20.15, text: "ПРИЧИНА ОДНА" },
  { from: 20.15, to: 21.42, text: "ДОКУМЕНТЫ РАСКИДАНЫ" },
  { from: 21.42, to: 23.03, text: "по папкам, чатам и почте", accent: true },
  { from: 23.03, to: 23.73, text: "А ПОИСК ИЩЕТ" },
  { from: 23.73, to: 24.72, text: "ПО НАЗВАНИЮ ФАЙЛА" },
  { from: 24.72, to: 25.53, text: "а не по смыслу", accent: true },
  { from: 25.68, to: 26.34, text: "ПОЭТОМУ ДАЖЕ" },
  { from: 26.34, to: 27.5, text: "САМЫЙ НУЖНЫЙ ДОКУМЕНТ" },
  { from: 27.5, to: 28.6, text: "не находится вовремя", accent: true },
  { from: 28.77, to: 30.14, text: "ЭТО СОРВАННАЯ СДЕЛКА" },
  { from: 30.14, to: 31.57, text: "ИЛИ ШТРАФ ОТ 50 ТЫСЯЧ" },
  { from: 32.0, to: 33.01, text: "РЕШАЕТ ЭТО ИИ-АГЕНТ" },
  { from: 33.01, to: 33.86, text: "который прочитал", accent: true },
  { from: 33.86, to: 34.82, text: "ВСЕ ВАШИ ДОКУМЕНТЫ" },
  { from: 34.82, to: 36.26, text: "И ОТВЕЧАЕТ ОБЫЧНЫМИ СЛОВАМИ" },
  { from: 36.26, to: 37.19, text: "ЗА 5 СЕКУНД" },
  { from: 37.19, to: 38.8, text: "со ссылкой на пункт", accent: true },
  { from: 39.04, to: 40.65, text: "ОТВЕТ КЛИЕНТУ УПАЛ" },
  { from: 40.65, to: 41.54, text: "С 11 МИНУТ" },
  { from: 41.54, to: 42.52, text: "ДО 9 СЕКУНД" },
  { from: 42.52, to: 43.85, text: "ЭКОНОМИЯ 2,8 МЛН В ГОД" },
  { from: 43.85, to: 44.94, text: "хочешь свою цифру?", accent: true },
  { from: 45.24, to: 46.91, text: "ЗАЙДИ НА NEIRODOCS.RU" },
  { from: 46.91, to: 48.19, text: "подвинь ползунки", accent: true },
  { from: 48.19, to: 49.54, text: "ПОД СВОЮ КОМПАНИЮ" },
  { from: 49.54, to: 51.04, text: "ПОЛУЧИ РАСЧЁТ ЗА 10 СЕКУНД" },
  { from: 51.04, to: 52.48, text: "посмотри, сколько теряешь", accent: true },
];
