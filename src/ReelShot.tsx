import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";

/**
 * One virtual camera angle onto the single locked-off take.
 *
 * The source never moves, so every "cut" is a different crop of the same
 * footage. Scaling always happens from a point inside the frame, which
 * mathematically guarantees full coverage — no black edges are possible at any
 * zoom level.
 *
 * `trimBefore` always equals the shot's own start on the timeline, so the
 * picture stays locked to the voice across every cut.
 */
export const ReelShot: React.FC<{
  trimBefore: number;
  /** Zoom anchor in percent — what the virtual camera points at. */
  originX: number;
  originY: number;
  /** Slow drift across the shot so the frame is never frozen. */
  scaleFrom: number;
  scaleTo: number;
  /** Extra scale on the cut that settles in 7 frames — the zoom-punch. */
  punch?: number;
  /** Crossfade length in frames. 1 gives a hard cut. */
  fadeIn?: number;
  /** Horizontal slide-in distance in percent. */
  slideFrom?: number;
  /** Small rotation, used sparingly on the punchiest cuts. */
  tilt?: number;
}> = ({
  trimBefore,
  originX,
  originY,
  scaleFrom,
  scaleTo,
  punch = 1,
  fadeIn = 1,
  slideFrom = 0,
  tilt = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const settle = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.33, 0, 0.67, 1),
        }),
        translate: interpolate(
          frame,
          [0, Math.max(fadeIn * 2, 8)],
          [`${slideFrom}% 0%`, "0% 0%"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: `${originX}% ${originY}%`,
          rotate: `${tilt * (1 - settle)}deg`,
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
          src={staticFile("reel-source.mp4")}
          trimBefore={trimBefore}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.14) contrast(1.08) brightness(1.03)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
