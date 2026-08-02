import { Easing, interpolate, useCurrentFrame } from "remotion";
import { displayFont, scriptFont } from "./fonts";

export const YELLOW = "#FFD60A";

/**
 * One caption chunk. Words pop in one after another rather than the whole line
 * appearing at once — the stagger is what makes the line feel spoken instead of
 * pasted on, and it is the single thing that most separates a hand-cut reel from
 * a subtitle track.
 *
 * Two faces alternate between chunks: bold uppercase for the statements, the
 * handwritten accent for the asides. Both carry a heavy shadow because the
 * plate behind them is a lit face, not a flat colour.
 */
export const Caption: React.FC<{
  text: string;
  accent?: boolean;
  durationInFrames: number;
}> = ({ text, accent = false, durationInFrames }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  // The whole chunk leaves together, so the exit reads as one motion.
  const exit = interpolate(
    frame,
    [durationInFrames - 4, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: accent ? "0 18px" : "0 20px",
        maxWidth: 900,
        opacity: exit,
      }}
    >
      {words.map((word, i) => {
        const start = i * 2.5;
        const scale = interpolate(frame, [start, start + 7], [0.72, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        });
        const opacity = interpolate(frame, [start, start + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const lift = interpolate(frame, [start, start + 7], [14, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });

        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              transform: `scale(${scale}) translateY(${lift}px)`,
              fontFamily: accent ? scriptFont : displayFont,
              fontWeight: accent ? 700 : 900,
              // Caveat has a small x-height, so it needs a much larger point
              // size than Montserrat to read as the same visual weight.
              fontSize: accent ? 152 : 92,
              lineHeight: accent ? 0.9 : 1.05,
              letterSpacing: accent ? 0 : -1.5,
              color: accent ? "#FFD60A" : "#FFFFFF",
              textShadow:
                "0 6px 24px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.9)",
              WebkitTextStroke: accent ? "0" : "2px rgba(0,0,0,0.28)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
