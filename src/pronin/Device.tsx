import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MODE, Mode, POP, R } from "./theme";

/**
 * Real footage inside a drawn frame.
 *
 * The product recording is 1152x720 landscape and the reel is 1080x1920, so it
 * can never fill the frame — cropping to portrait would throw away two thirds
 * of the width and then upscale 2.7x. Instead it sits inside a browser-style
 * window occupying the middle of the canvas, which is what the references do
 * with every interface they show, and which keeps the pixels at roughly 1:1.
 *
 * `focus` punches into a region of the recording, in source-normalised
 * coordinates, so a detail can be read at reel size without a second export.
 */
export const DemoWindow: React.FC<{
  mode: Mode;
  src: string;
  /** Seconds into the recording at which this window starts playing. */
  startFrom: number;
  width?: number;
  /** [x, y, zoom] with x/y in 0..1 of the source. zoom 1 = whole frame. */
  focus?: [number, number, number];
  delay?: number;
  /** Frames over which to travel from `focus` to `focusTo`. */
  focusTo?: [number, number, number];
  moveOver?: [number, number];
  /** Below 1 stretches the recording over more screen time. */
  playbackRate?: number;
}> = ({
  mode,
  src,
  startFrom,
  width = 940,
  focus = [0.5, 0.5, 1],
  focusTo,
  moveOver = [0, 0],
  playbackRate = 1,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MODE[mode];
  const e = spring({ frame: frame - delay, fps, config: POP });

  const AR = 1152 / 720;
  const CHROME = 46;
  const height = width / AR + CHROME;

  const t = focusTo
    ? interpolate(frame, moveOver, [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const mix = (a: number, b: number) => a + (b - a) * t;
  const [fx, fy, fz] = focusTo
    ? ([mix(focus[0], focusTo[0]), mix(focus[1], focusTo[1]), mix(focus[2], focusTo[2])] as const)
    : focus;

  // CSS applies the listed transforms right to left, so the translate below runs
  // in the element's own unscaled space and is then multiplied by the scale.
  // The percentages must therefore NOT carry the zoom themselves — an earlier
  // version did, and pushed the region of interest clean out of the window.
  const tx = (0.5 - fx) * 100;
  const ty = (0.5 - fy) * 100;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: R.panel,
        overflow: "hidden",
        background: m.inset,
        border: `1px solid ${m.cardLine}`,
        boxShadow: m.shadow,
        position: "relative",
        opacity: e,
        transform: `translateY(${(1 - e) * 34}px) scale(${interpolate(e, [0, 1], [0.94, 1])})`,
      }}
    >
      {/* Window chrome: three dots, the way every app mock in the references
          announces itself as a screen without needing a real title bar. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 46,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 20px",
          background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(10,10,12,0.04)",
          zIndex: 2,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: 13, background: c }} />
        ))}
      </div>
      <AbsoluteFill style={{ top: 46, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${fz}) translate(${tx}%, ${ty}%)`,
            transformOrigin: "center center",
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            startFrom={Math.round(startFrom * fps)}
            playbackRate={playbackRate}
            // Muted at the source as well as stripped from the file: this is a
            // screen recording, and its room tone would fight the sound design.
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </AbsoluteFill>
    </div>
  );
};

/**
 * A callout pinned to a point on the window: a dot, a short leader and a label.
 * This is how a detail inside a busy interface gets named without a caption
 * bar stealing the bottom of the frame.
 */
export const Pin: React.FC<{
  mode: Mode;
  x: number;
  y: number;
  label: string;
  delay?: number;
  side?: "left" | "right";
}> = ({ mode, x, y, label, delay = 0, side = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MODE[mode];
  const e = spring({ frame: frame - delay, fps, config: POP });
  const pulse = 1 + Math.sin(frame / 8) * 0.12;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: e }}>
      <div
        style={{
          position: "absolute",
          left: -11,
          top: -11,
          width: 22,
          height: 22,
          borderRadius: 22,
          background: "#0A84FF",
          transform: `scale(${pulse})`,
          boxShadow: "0 0 0 6px rgba(10,132,255,0.22)",
        }}
      />
      <div
        style={{
          position: "absolute",
          ...(side === "right" ? { left: 18 } : { right: 18 }),
          top: -22,
          whiteSpace: "nowrap",
          background: m.card,
          border: `1px solid ${m.cardLine}`,
          borderRadius: 14,
          padding: "9px 18px",
          fontFamily: "SFProDisplay, sans-serif",
          fontWeight: 500,
          fontSize: 28,
          color: m.ink,
          boxShadow: m.shadow,
          transform: `translateX(${(1 - e) * (side === "right" ? -14 : 14)}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
};
