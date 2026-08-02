import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CYAN, displayFont, INK } from "./fonts";

/** Springs in, holds, then drops away — used by every overlay below. */
const useEnterExit = (durationInFrames: number, exitFrames = 6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 190, mass: 0.6 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return { enter, exit, frame };
};

/**
 * The numbered question badge. Sits high in the frame, away from the caption
 * band, so the viewer always knows which of the three questions is on screen —
 * that running position is what keeps someone watching to the end of a list.
 */
export const QuestionBadge: React.FC<{
  number: number;
  durationInFrames: number;
}> = ({ number, durationInFrames }) => {
  const { enter, exit } = useEnterExit(durationInFrames);

  return (
    <AbsoluteFill
      style={{ alignItems: "center", paddingTop: 300, opacity: exit }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `scale(${enter}) rotate(${interpolate(enter, [0, 1], [-6, -2])}deg)`,
          background: CYAN,
          borderRadius: 100,
          padding: "14px 40px 16px 24px",
          boxShadow: "0 14px 44px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            background: INK,
            color: CYAN,
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {number}
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 1,
            color: INK,
            textTransform: "uppercase",
          }}
        >
          Вопрос
        </div>
      </div>
    </AbsoluteFill>
  );
};





/**
 * A full-bleed colour flash on the hardest cuts. Two frames of it reads as an
 * impact rather than a mistake, and it hides the seam between two crops of the
 * same locked-off take.
 */
export const FlashCut: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 1, 4], [0.55, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
};
