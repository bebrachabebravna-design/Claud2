import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { YELLOW } from "./Caption";
import { displayFont, scriptFont } from "./fonts";

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
          background: YELLOW,
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
            background: "#0B0B0F",
            color: YELLOW,
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
            color: "#0B0B0F",
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
 * Three stacked chips that arrive one after another — the visual answer to
 * "то в папках, то в чате, то в почте". Staggering them turns a list into a
 * pile-up, which is the feeling the line is describing.
 */
export const ChipStack: React.FC<{
  items: string[];
  durationInFrames: number;
}> = ({ items, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    // Stacked against the right edge, high in the frame: anywhere centred puts
    // them straight over the eyes and mouth of a face this size.
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingTop: 250,
        paddingRight: 60,
        opacity: exit,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((item, i) => {
          const s = spring({
            frame: frame - i * 7,
            fps,
            config: { damping: 12, stiffness: 200, mass: 0.5 },
          });
          return (
            <div
              key={item}
              style={{
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-70, 0])}px) rotate(${interpolate(
                  s,
                  [0, 1],
                  [-8, i % 2 === 0 ? -2 : 2],
                )}deg)`,
                background: "rgba(12,12,18,0.88)",
                border: `3px solid ${YELLOW}`,
                borderRadius: 22,
                padding: "16px 34px",
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 46,
                color: "#FFFFFF",
                boxShadow: "0 12px 36px rgba(0,0,0,0.55)",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * A clock that visibly runs while the caption talks about a client waiting.
 * Showing the seconds tick is more persuasive than saying "долго" — the viewer
 * feels the wait in real time.
 */
export const WaitTimer: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const { enter, exit, frame } = useEnterExit(durationInFrames);
  const { fps } = useVideoConfig();
  const seconds = Math.floor((frame / fps) * 3);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AbsoluteFill
      style={{ alignItems: "center", paddingTop: 380, opacity: exit }}
    >
      <div
        style={{
          transform: `scale(${enter})`,
          background: "rgba(12,12,18,0.9)",
          border: "4px solid #FF4D4D",
          borderRadius: 28,
          padding: "18px 46px",
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: 96,
          color: "#FF6B6B",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 2,
          boxShadow: "0 16px 50px rgba(0,0,0,0.6)",
        }}
      >
        {mm}:{ss}
      </div>
    </AbsoluteFill>
  );
};

/**
 * The scoreboard for the payoff: two of three questions lit. It restates the
 * whole video in one glance for anyone who joined late, right at the moment the
 * call to action lands.
 */
export const ScoreCard: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ alignItems: "center", paddingTop: 240, opacity: exit }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {[0, 1, 2].map((i) => {
          const s = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 11, stiffness: 210, mass: 0.5 },
          });
          const lit = i < 2;
          return (
            <div
              key={i}
              style={{
                width: 108,
                height: 108,
                borderRadius: 26,
                transform: `scale(${s})`,
                background: lit ? YELLOW : "rgba(12,12,18,0.85)",
                border: lit ? "none" : "4px solid rgba(255,255,255,0.35)",
                color: lit ? "#0B0B0F" : "rgba(255,255,255,0.5)",
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: lit ? "0 14px 40px rgba(255,214,10,0.4)" : "none",
              }}
            >
              {lit ? "ДА" : "?"}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Closing call to action: an arrow pointing at the comment field, in the
 * handwritten face so it reads as the creator speaking rather than a banner.
 */
export const CommentCta: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const { enter, exit, frame } = useEnterExit(durationInFrames, 8);
  const bob = Math.sin(frame / 7) * 8;

  return (
    // Sits high in the frame: the captions own the lower third at this point,
    // and two yellow handwritten lines fighting in the same band read as a mess.
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 300,
        opacity: exit,
      }}
    >
      <div
        style={{
          transform: `scale(${enter}) translateY(${bob}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: "rgba(10,10,16,0.72)",
          borderRadius: 34,
          padding: "22px 44px 30px",
        }}
      >
        <div
          style={{
            fontFamily: scriptFont,
            fontWeight: 700,
            fontSize: 128,
            lineHeight: 0.95,
            color: YELLOW,
            textShadow: "0 6px 24px rgba(0,0,0,0.8)",
          }}
        >
          сколько «да»?
        </div>
        <div style={{ fontSize: 84, lineHeight: 1 }}>👇</div>
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
