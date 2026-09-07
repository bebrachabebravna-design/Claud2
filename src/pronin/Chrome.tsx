import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";
import { MODE, Mode } from "./theme";

/**
 * The furniture that is on screen for the whole reel: the ground, the grid, the
 * handle watermark, and the sweep that swaps one for the other.
 */

/**
 * Ground plus the faint square grid.
 *
 * In the references the grid is barely visible — roughly 4% contrast — but it
 * is what stops the empty half of the frame from reading as a dead white or
 * dead black area. It also drifts a few pixels over the length of a chapter,
 * which keeps a static layout from looking like a frozen frame.
 */
export const Ground: React.FC<{ mode: Mode; drift?: number }> = ({ mode, drift = 1 }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const off = (frame * 0.12 * drift) % 135;
  return (
    <AbsoluteFill style={{ background: m.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${m.grid} 1px, transparent 1px), linear-gradient(90deg, ${m.grid} 1px, transparent 1px)`,
          backgroundSize: "135px 135px",
          backgroundPosition: `${off}px ${off * 0.6}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Handle watermark. In both references it sits mid-left at about 55% height,
 * well inside the safe area, as a glyph with the handle set beneath it.
 */
export const Watermark: React.FC<{ mode: Mode; handle: string }> = ({ mode, handle }) => {
  const m = MODE[mode];
  return (
    <div
      style={{
        position: "absolute",
        left: 42,
        top: 1055,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        // Faint on purpose: in the references the handle is legible on a pause
        // and invisible in motion, which is what keeps it from competing with
        // the content for the two seconds that decide whether anyone stays.
        opacity: 0.3,
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" stroke={m.ink} strokeWidth="2" />
        <circle cx="12" cy="12" r="4.6" stroke={m.ink} strokeWidth="2" />
        <circle cx="17.4" cy="6.7" r="1.3" fill={m.ink} />
      </svg>
      <div
        style={{
          fontFamily: uiFont,
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: 0.5,
          color: m.ink,
        }}
      >
        {handle}
      </div>
    </div>
  );
};

/**
 * Chapter transition: a wide blurred band of light sweeping across while the
 * outgoing frame blurs out under it.
 *
 * This is the only "cut" the references make. It is not a flash — a hard white
 * frame would read as a glitch at this contrast — it is a soft diagonal wipe
 * lasting about half a second, which is why the two worlds can be opposite in
 * brightness without the swap hurting to watch.
 */
export const Sweep: React.FC<{ toward: Mode; durationInFrames: number }> = ({
  toward,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Bright on the way into a light chapter, dim on the way into a dark one, so
  // the sweep always resolves toward the world it is delivering.
  const glow = toward === "light" ? "255,255,255" : "22,22,26";
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(102deg, transparent ${p * 150 - 55}%, rgba(${glow},0.98) ${
          p * 150 - 18
        }%, rgba(${glow},0.98) ${p * 150 + 8}%, transparent ${p * 150 + 48}%)`,
        filter: "blur(28px)",
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * Wrapper that blurs and lifts its children while a sweep passes over them.
 * The references never hard-cut a layout away; the outgoing content defocuses
 * as the light crosses it.
 */
export const Defocus: React.FC<{
  children: React.ReactNode;
  at: number;
  durationInFrames: number;
  /** Off for the closing chapter: nothing follows it, so blurring it away just
   *  throws the call to action out of focus while the viewer is reading it. */
  active?: boolean;
}> = ({ children, at, durationInFrames, active = true }) => {
  const frame = useCurrentFrame();
  const p = active
    ? interpolate(frame, [at, at + durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <AbsoluteFill
      style={{
        filter: `blur(${p * 26}px)`,
        opacity: 1 - p,
        transform: `scale(${1 + p * 0.06})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
