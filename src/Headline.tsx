import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, displayFont, WHITE } from "./fonts";

/**
 * The title-card treatment from the reference edit: a small white lead-in line
 * over a huge highlighted keyword, sitting high in the frame across the top of
 * the talking head. The reference uses red; this uses the brand cyan.
 *
 * The keyword scales in with a slight overshoot while the lead-in fades above
 * it, so the big word lands like a stamp rather than just appearing.
 */
export const Headline: React.FC<{
  lead: string;
  word: string;
  durationInFrames: number;
}> = ({ lead, word, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const leadIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: 1,
          textTransform: "lowercase",
          color: WHITE,
          opacity: leadIn,
          transform: `translateY(${interpolate(leadIn, [0, 1], [12, 0])}px)`,
          textShadow: "0 4px 18px rgba(0,0,0,0.7)",
        }}
      >
        {lead}
      </div>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: 150,
          lineHeight: 0.92,
          letterSpacing: -4,
          textTransform: "uppercase",
          color: CYAN,
          transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
          textShadow:
            "0 0 45px rgba(69,208,255,0.55), 0 8px 30px rgba(0,0,0,0.6)",
          WebkitTextStroke: "2px rgba(5,11,22,0.35)",
          paintOrder: "stroke fill",
        }}
      >
        {word}
      </div>
    </div>
  );
};

/**
 * Small numbered pill ("ПРИЁМ 1") for the top corner during each tip, so the
 * viewer always knows which of the three they are on — the running position is
 * what keeps someone through a list to the end.
 */
export const TipBadge: React.FC<{ n: number; durationInFrames: number }> = ({
  n,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 210 } });
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 24px 10px 12px",
        background: CYAN,
        borderRadius: 100,
        transform: `scale(${pop})`,
        opacity: out,
        boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#050B16",
          color: CYAN,
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#050B16",
        }}
      >
        приём
      </span>
    </div>
  );
};
