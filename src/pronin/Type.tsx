import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, uiFont } from "../fonts";
import { MODE, Mode, POP, SELECT_FILL, SELECT_LINE, T } from "./theme";

/**
 * Typography, and the two devices the references use to make plain text carry a
 * whole shot: words arriving one at a time, and a selection box thrown around
 * the word that matters.
 */

const useSpring = (delay: number, config = POP) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

export type Word = {
  text: string;
  /** Held in the ink colour and heavier — the word the line is actually about. */
  hit?: boolean;
  /** Draws the Figma-style selection box with corner handles around the word. */
  select?: boolean;
};

/**
 * A spoken line assembled word by word.
 *
 * Each word rises a little, unblurs and lands on its own spring, spaced about
 * four frames apart. Words that are not the point of the line stay in the muted
 * grey; the hit word is full-contrast and heavier, which is how the references
 * put emphasis without ever changing size mid-line.
 */
export const WordLine: React.FC<{
  words: Word[];
  mode: Mode;
  size?: number;
  gap?: number;
  stagger?: number;
  /** Frame at which the first word starts arriving. */
  from?: number;
  /** Colour for the un-hit words. Lines over footage need a brighter one than
   *  the canvas grey, which disappears against a lit wall. */
  muted?: string;
  /** Shadow behind the type, for the same reason. */
  shadow?: string;
}> = ({ words, mode, size = T.line, gap = 18, stagger = 4, from = 0, muted, shadow }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap,
        maxWidth: 900,
      }}
    >
      {words.map((w, i) => (
        <WordCell
          key={`${w.text}-${i}`}
          w={w}
          mode={mode}
          size={size}
          delay={from + i * stagger}
          muted={muted}
          shadow={shadow}
        />
      ))}
    </div>
  );
};

const WordCell: React.FC<{
  w: Word;
  mode: Mode;
  size: number;
  delay: number;
  muted?: string;
  shadow?: string;
}> = ({ w, mode, size, delay, muted, shadow }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  const body = (
    <span
      style={{
        fontFamily: displayFont,
        fontWeight: w.hit || w.select ? 800 : 700,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: -0.5,
        color: w.hit || w.select ? m.ink : muted ?? m.mute,
        textShadow: shadow,
        whiteSpace: "pre",
      }}
    >
      {w.text}
    </span>
  );
  return (
    <span
      style={{
        display: "inline-block",
        opacity: e,
        // Words come in from slightly below and out of focus, which is what
        // gives the build its weight — a plain fade reads as a subtitle.
        transform: `translateY(${(1 - e) * 26}px)`,
        filter: `blur(${(1 - e) * 9}px)`,
      }}
    >
      {w.select ? <Selected mode={mode} delay={delay + 3}>{body}</Selected> : body}
    </span>
  );
};

/**
 * Figma/macOS selection chrome: a filled highlight, a bright hairline and two
 * round handles on opposite corners.
 *
 * The handles are what make it read as "selected in a design tool" rather than
 * as a coloured marker pen, so they are worth the extra elements.
 */
export const Selected: React.FC<{
  children: React.ReactNode;
  mode: Mode;
  delay?: number;
  padX?: number;
  padY?: number;
}> = ({ children, mode, delay = 0, padX = 16, padY = 6 }) => {
  const e = useSpring(delay, { damping: 13, stiffness: 220, mass: 0.6 });
  const handle = 18;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: `${padY}px ${padX}px`,
        margin: `-${padY}px -${padX}px`,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: SELECT_FILL,
          border: `3px solid ${SELECT_LINE}`,
          borderRadius: 4,
          transform: `scaleX(${e})`,
          transformOrigin: "left center",
        }}
      />
      {[
        { left: -handle / 2, top: -handle / 2 },
        { right: -handle / 2, bottom: -handle / 2 },
      ].map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: handle,
            height: handle,
            borderRadius: handle,
            background: SELECT_LINE,
            border: "3px solid #fff",
            opacity: e,
            transform: `scale(${e})`,
          }}
        />
      ))}
      <span style={{ position: "relative", color: "#fff" }}>{children}</span>
    </span>
  );
};

/**
 * Chapter title: a short phrase with a 3D object dropped into the middle of it.
 *
 * Both references open every chapter this way — "второй 🧠 мозг", "база 🧠
 * знаний" — and the object is always inline with the words rather than above
 * them, which is what keeps the layout from looking like a slide.
 */
export const ChapterTitle: React.FC<{
  left: string;
  right: string;
  mode: Mode;
  object?: React.ReactNode;
  size?: number;
  delay?: number;
}> = ({ left, right, mode, object, size = T.title, delay = 0 }) => {
  const m = MODE[mode];
  const a = useSpring(delay);
  const b = useSpring(delay + 4);
  const o = useSpring(delay + 2, { damping: 12, stiffness: 170, mass: 0.9 });
  const frame = useCurrentFrame();
  const style = (e: number): React.CSSProperties => ({
    fontFamily: displayFont,
    fontWeight: 800,
    fontSize: size,
    letterSpacing: -1,
    color: m.ink,
    opacity: e,
    transform: `translateY(${(1 - e) * 20}px)`,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span style={style(a)}>{left}</span>
      {object ? (
        <span
          style={{
            opacity: o,
            // A slow float keeps the object alive through a long chapter without
            // pulling the eye off the words.
            transform: `scale(${interpolate(o, [0, 1], [0.4, 1])}) translateY(${
              Math.sin(frame / 26) * 5
            }px)`,
          }}
        >
          {object}
        </span>
      ) : null}
      <span style={style(b)}>{right}</span>
    </div>
  );
};

/**
 * Typewriter line used inside prompt fields, with the incoming character
 * arriving blurred. The blur is the detail that sells it: a plain character
 * append looks like a terminal, this looks like someone typing on a phone.
 */
export const TypeLine: React.FC<{
  text: string;
  mode: Mode;
  cps?: number;
  size?: number;
  weight?: number;
  color?: string;
  caret?: boolean;
}> = ({ text, mode, cps = 22, size = T.cardSub, weight = 400, color, caret = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MODE[mode];
  const shown = Math.min(text.length, Math.floor((frame / fps) * cps));
  const partial = ((frame / fps) * cps) % 1;
  return (
    <span
      style={{
        fontFamily: uiFont,
        fontWeight: weight,
        fontSize: size,
        color: color ?? m.ink,
        whiteSpace: "pre-wrap",
      }}
    >
      {text.slice(0, Math.max(0, shown - 1))}
      {shown > 0 ? (
        <span style={{ filter: `blur(${(1 - partial) * 5}px)`, opacity: 0.4 + partial * 0.6 }}>
          {text[shown - 1]}
        </span>
      ) : null}
      {caret && shown < text.length && Math.floor(frame / 8) % 2 === 0 ? (
        <span style={{ opacity: 0.7 }}>|</span>
      ) : null}
    </span>
  );
};

/** Small grey label: step markers, card sub-lines, list rows. */
export const Label: React.FC<{
  children: React.ReactNode;
  mode: Mode;
  size?: number;
  weight?: number;
  color?: string;
  delay?: number;
}> = ({ children, mode, size = T.small, weight = 400, color, delay = 0 }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        fontFamily: uiFont,
        fontWeight: weight,
        fontSize: size,
        color: color ?? m.mute,
        opacity: e,
        transform: `translateY(${(1 - e) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A number that counts up on arrival. The references use this for percentages
 * and follower counts; here it also carries the money figures.
 */
export const CountUp: React.FC<{
  to: number;
  mode: Mode;
  durationInFrames?: number;
  size?: number;
  suffix?: string;
  color?: string;
  group?: boolean;
}> = ({ to, mode, durationInFrames = 26, size = T.stat, suffix = "", color, group = true }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const v = Math.round(
    interpolate(frame, [0, durationInFrames], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  return (
    <span
      style={{
        fontFamily: displayFont,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -1.5,
        color: color ?? m.ink,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {group ? v.toLocaleString("ru-RU").replace(/ /g, " ") : v}
      {suffix}
    </span>
  );
};

/** Deterministic jitter helper shared by the scatter layouts. */
export const rnd = (seed: string) => random(seed);
