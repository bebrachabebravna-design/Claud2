import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";
import { FPS } from "./theme";

/**
 * Captions: white SF Pro with yellow accents, lit word by word as it is said.
 *
 * These are the base layer of the whole reel and they never leave the screen
 * while anyone is speaking. The previous cut treated text as an occasional
 * design element, which is what made half the reel read as a plain talking head
 * with the odd caption — the words have to be continuous, and the accent has to
 * be yellow, not the interface blue.
 *
 * Three things do the work:
 *   * every word gets its own arrival, so the line assembles at the speed of
 *     speech rather than blinking in as a block;
 *   * the word currently being spoken sits slightly larger and brighter, which
 *     is what makes the eye track the line instead of re-reading it;
 *   * accent words are yellow and stay yellow after they land.
 */

export const CAP_YELLOW = "#FFD60A";

export type CapWord = {
  text: string;
  /** Yellow, and held a little larger. The word the sentence is about. */
  hot?: boolean;
};

export type Cap = {
  from: number;
  to: number;
  words: CapWord[];
  /** Canvas y of the caption block. */
  top?: number;
  size?: number;
};

/**
 * One caption line. Word timings are divided across the cue by character count,
 * which tracks natural speech far better than an equal split — long words take
 * longer to say.
 */
export const Caption: React.FC<{
  words: CapWord[];
  durationInFrames: number;
  size?: number;
  onVideo?: boolean;
}> = ({ words, durationInFrames, size = 68, onVideo = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lens = words.map((w) => Math.max(2, w.text.length));
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const starts = lens.map((l) => {
    const s = (acc / total) * durationInFrames;
    acc += l;
    return s;
  });

  // The line fades on the last few frames rather than cutting, so consecutive
  // captions cross-dissolve instead of flickering.
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "0 18px",
        maxWidth: 940,
        opacity: out,
      }}
    >
      {words.map((w, i) => {
        const start = starts[i];
        const next = i + 1 < starts.length ? starts[i + 1] : durationInFrames;
        const e = spring({
          frame: frame - start,
          fps,
          config: { damping: 14, stiffness: 240, mass: 0.5 },
        });
        // "Live" while this word is the one being spoken.
        const live = frame >= start && frame < next + 4;
        const lift = live ? interpolate(Math.min(1, (frame - start) / 5), [0, 1], [0, 1]) : 0;
        return (
          <span
            key={`${w.text}-${i}`}
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.18,
              letterSpacing: -0.5,
              color: w.hot ? CAP_YELLOW : "#FFFFFF",
              display: "inline-block",
              opacity: e,
              transform: `translateY(${(1 - e) * 22}px) scale(${1 + lift * 0.06})`,
              // A tight dark halo rather than a plate: the reference never puts
              // a box behind text, but white on a lit wall needs some help.
              textShadow: onVideo
                ? "0 2px 10px rgba(0,0,0,0.55), 0 6px 30px rgba(0,0,0,0.45)"
                : "0 2px 14px rgba(0,0,0,0.25)",
              filter: `blur(${(1 - e) * 6}px)`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Parses "обычный текст с *акцентом*" into words, marking the accents yellow.
 *
 * Spans may cover several words ("*238 000*") and may be followed immediately by
 * punctuation ("*время*,"), so the string is split on the spans themselves
 * rather than on whitespace. Punctuation left stranded by a span is glued back
 * onto the word before it, otherwise a lone comma renders as its own word with
 * a gap on both sides.
 */
export const cap = (s: string): CapWord[] => {
  const words: CapWord[] = [];
  for (const part of s.split(/(\*[^*]+\*)/g)) {
    if (!part) continue;
    const hot = part.startsWith("*") && part.endsWith("*");
    const text = hot ? part.slice(1, -1) : part;
    for (const w of text.split(" ")) {
      if (!w) continue;
      if (/^[.,!?…:;»)]+$/.test(w) && words.length) {
        words[words.length - 1] = {
          ...words[words.length - 1],
          text: words[words.length - 1].text + w,
        };
      } else {
        words.push({ text: w, hot });
      }
    }
  }
  return words;
};

export const capFrames = (from: number, to: number) =>
  Math.max(1, Math.round((to - from) * FPS));
