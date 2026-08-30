/**
 * Timing map for «Куда НЕ надо внедрять ИИ» (public/src5.mp4).
 *
 * There is no SRT for this take, so the structure was recovered from the audio
 * itself: the track was decoded to PCM and segmented by RMS, and every pause
 * over 0.3s became a candidate edit point. The long pauses (0.7s+) are where
 * the speaker changes topic — those carry the full-screen scenes. The shorter
 * ones carry re-frames, so the picture keeps changing even while he talks.
 *
 * Head and tail silence are trimmed: 1.42s of dead air at the top is fatal for
 * a format where 60% of viewers leave in the first three seconds.
 */
export const FPS = 30;

/** Speech starts here; everything below is expressed in SOURCE seconds. */
export const TRIM_START = 1.42;
export const CONTENT_END = 54.4;
export const DURATION = CONTENT_END - TRIM_START;

/** Long pauses — topic boundaries, where full-screen scenes land. */
export const SCENES: { from: number; to: number; kind: string }[] = [
  { from: 10.26, to: 12.9, kind: "n1" },
  { from: 26.1, to: 29.0, kind: "leak" },
  { from: 41.28, to: 43.7, kind: "n3" },
  { from: 48.58, to: 51.44, kind: "summary" },
  { from: 51.44, to: CONTENT_END, kind: "cta" },
];

/**
 * Re-frames of the talking head, cut on the shorter pauses. `crop` is the
 * zoom and `oy` the vertical anchor — alternating between a wide and a tighter
 * frame is what stops a locked-off take feeling static.
 */
export const SHOTS: { from: number; to: number; scale: number; ox: number; oy: number }[] = [
  { from: TRIM_START, to: 6.42, scale: 1.0, ox: 50, oy: 34 },
  { from: 6.42, to: 9.46, scale: 1.1, ox: 50, oy: 30 },

  { from: 12.9, to: 17.68, scale: 1.0, ox: 50, oy: 34 },
  { from: 17.68, to: 20.24, scale: 1.12, ox: 46, oy: 28 },
  { from: 20.24, to: 24.68, scale: 1.02, ox: 54, oy: 36 },
  { from: 24.68, to: 26.1, scale: 1.14, ox: 50, oy: 26 },

  { from: 29.0, to: 31.5, scale: 1.0, ox: 50, oy: 34 },
  { from: 31.5, to: 33.76, scale: 1.12, ox: 52, oy: 28 },
  { from: 33.76, to: 38.36, scale: 1.02, ox: 48, oy: 35 },
  { from: 38.36, to: 41.28, scale: 1.15, ox: 50, oy: 26 },

  { from: 43.7, to: 47.68, scale: 1.0, ox: 50, oy: 33 },
  { from: 47.68, to: 48.58, scale: 1.12, ox: 50, oy: 28 },
];

/**
 * Depth type — sits BEHIND the matted speaker during the hook. Kept to two
 * words: anything longer is unreadable once he occludes the middle of it.
 */
export const BEHIND: { from: number; to: number; text: string; color: string; top: number }[] = [
  // Sat centred at first and vanished — the speaker fills the middle of this
  // frame completely. Riding it just above the head lets the cap clip the
  // bottom of the letters: the occlusion still reads as depth, but the word
  // survives.
  { from: 2.2, to: 4.3, text: "НЕ НАДО", color: "#FFD60A", top: 0.035 },
  { from: 4.3, to: 6.42, text: "3 ВЕЩИ", color: "#45D0FF", top: 0.045 },
];
