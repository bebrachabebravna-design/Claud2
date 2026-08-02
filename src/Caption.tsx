import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, scriptFont, YELLOW } from "./fonts";

/**
 * One caption chunk, styled after the reference edit: a tight centred block
 * that alternates a heavy sans with a calligraphic accent, rather than a
 * subtitle strip.
 *
 * The whole chunk arrives as one unit on a spring. Staggering individual words
 * looked ragged at this size — lines were visibly stepping in and the block
 * shifted as each word landed, which is what made the earlier pass read as
 * crooked. Popping the line as a block keeps the baseline still.
 */
export const Caption: React.FC<{
  text: string;
  accent?: boolean;
  durationInFrames: number;
}> = ({ text, accent = false, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.55 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 3, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        opacity: exit,
        transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
        textAlign: "center",
        maxWidth: 940,
        fontFamily: accent ? scriptFont : displayFont,
        fontWeight: accent ? 400 : 900,
        // Good Vibes Pro has a far smaller x-height than SF Pro, so it needs a
        // larger point size to carry the same visual weight on screen.
        fontSize: accent ? 132 : 96,
        lineHeight: accent ? 0.95 : 1.02,
        letterSpacing: accent ? 0 : -3,
        color: accent ? YELLOW : "#FFFFFF",
        textTransform: accent ? "none" : "uppercase",
        textShadow:
          "0 8px 30px rgba(0,0,0,0.8), 0 3px 8px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)",
        paintOrder: "stroke fill",
        WebkitTextStroke: accent ? "0" : "8px rgba(6,6,12,0.55)",
      }}
    >
      {text}
    </div>
  );
};
