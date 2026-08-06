import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, WHITE, YELLOW } from "./fonts";

/**
 * Caption block for the depth edit.
 *
 * Two tiers, after the reference: a small white lead-in over a big accent line.
 * The accent is yellow at the user's request, and it carries a real bloom
 * rather than a flat fill — the glow is what sells the text as light in the
 * room rather than a graphic pasted on the front of the frame.
 *
 * This block is rendered BETWEEN the world and the cut-out speaker, so it is
 * deliberately positioned around shoulder height and never centred on the face:
 * once he occludes it, anything behind his head is simply lost.
 */
export const CaptionDeep: React.FC<{
  lead?: string;
  main: string;
  accent?: boolean;
  durationInFrames: number;
  /** Vertical placement as a share of frame height. */
  top?: number;
  size?: number;
}> = ({ lead, main, accent = false, durationInFrames, top = 0.52, size = 108 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.6 },
  });
  const exit = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // A slow drift keeps the text moving with the world's camera instead of
  // sitting frozen while everything behind it dollies.
  const drift = interpolate(frame, [0, durationInFrames], [10, -10]);
  const colour = accent ? YELLOW : WHITE;

  return (
    <div
      style={{
        position: "absolute",
        top: `${top * 100}%`,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        opacity: exit,
        transform: `translateY(${drift}px) scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
        padding: "0 60px",
      }}
    >
      {lead ? (
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: size * 0.42,
            letterSpacing: 3,
            color: WHITE,
            textTransform: "uppercase",
            opacity: interpolate(enter, [0, 1], [0, 0.92]),
            textShadow: "0 4px 18px rgba(0,0,0,0.8)",
          }}
        >
          {lead}
        </div>
      ) : null}

      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.98,
          letterSpacing: -2,
          color: colour,
          textTransform: "uppercase",
          textAlign: "center",
          whiteSpace: "pre-line",
          // Layered bloom: tight core, wide halo. Reads as emitted light.
          textShadow: accent
            ? `0 0 18px ${YELLOW}CC, 0 0 46px ${YELLOW}88, 0 0 90px ${YELLOW}44, 0 8px 30px rgba(0,0,0,0.7)`
            : "0 0 24px rgba(255,255,255,0.35), 0 8px 30px rgba(0,0,0,0.85)",
        }}
      >
        {main}
      </div>
    </div>
  );
};
