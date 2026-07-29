import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

/**
 * One virtual camera angle onto the single static source take.
 *
 * The source is a locked-off talking head, so every "cut" is a different crop of
 * the same footage. Scaling always happens from a point inside the frame, which
 * mathematically guarantees full coverage — no black edges are possible.
 */
export const Shot: React.FC<{
  /** Source frame this shot starts on. Equals its own timeline start, keeping lip-sync exact. */
  trimBefore: number;
  /** Zoom anchor in percent — this is what the virtual camera points at. */
  originX: number;
  originY: number;
  /** Slow drift across the shot so the frame never feels frozen. */
  scaleFrom: number;
  scaleTo: number;
  /** Extra scale on the cut that settles instantly — the zoom-punch. */
  punch: number;
  /** Crossfade length in frames. Use 1 for a hard cut. */
  fadeIn: number;
  /** Horizontal slide-in distance in percent. Use 0 for no slide. */
  slideFrom: number;
}> = ({ trimBefore, originX, originY, scaleFrom, scaleTo, punch, fadeIn, slideFrom }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.33, 0, 0.67, 1),
        }),
        translate: interpolate(frame, [0, fadeIn * 2], [`${slideFrom}% 0%`, "0% 0%"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: `${originX}% ${originY}%`,
          scale: interpolate(
            frame,
            [0, 7, durationInFrames],
            [scaleFrom * punch, scaleFrom, scaleTo],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            },
          ),
        }}
      >
        <Video
          name="Source take"
          src={staticFile("source-video.mp4")}
          trimBefore={trimBefore}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.1) contrast(1.06)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
