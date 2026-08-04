import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, displayFont, scriptFont, WHITE } from "./fonts";

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
        // SF Pro Display Heavy (800) reads as native iOS; the Black+thick-stroke
        // combo before looked like a generic impact face, not the iPhone font.
        fontWeight: accent ? 400 : 800,
        fontSize: accent ? 132 : 92,
        lineHeight: accent ? 0.95 : 1.05,
        letterSpacing: accent ? 0 : -1,
        color: accent ? CYAN : WHITE,
        textTransform: accent ? "none" : "uppercase",
        // Legibility over video comes from a soft shadow plus a thin crisp
        // outline, not a heavy stroke that distorts the letterforms.
        textShadow:
          "0 6px 26px rgba(0,0,0,0.85), 0 2px 5px rgba(0,0,0,0.95)",
        paintOrder: "stroke fill",
        WebkitTextStroke: accent ? "0" : "3px rgba(5,11,22,0.5)",
      }}
    >
      {text}
    </div>
  );
};
