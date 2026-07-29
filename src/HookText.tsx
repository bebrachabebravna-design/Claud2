import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "./fonts";

/**
 * A single on-screen hook: small kicker, oversized headline, supporting line.
 *
 * Enter and exit live on separate elements so each keeps its own curve — the
 * headline arrives with a slight overshoot and leaves with gravity, which is
 * what stops the text from feeling like a slideshow.
 */
export const HookText: React.FC<{
  kicker?: string;
  main: string;
  mainSize: number;
  mainColor: string;
  sub?: string;
}> = ({ kicker, main, mainSize, mainColor, sub }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0) 46%)",
          opacity: interpolate(frame, [0, 8, durationInFrames - 7, durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.67, 1),
          }),
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 190,
          paddingLeft: 80,
          paddingRight: 80,
          opacity: interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.5, 0, 0.75, 0),
          }),
          translate: interpolate(
            frame,
            [durationInFrames - 7, durationInFrames],
            ["0px 0px", "0px -28px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.5, 0, 0.75, 0),
            },
          ),
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: displayFont,
            opacity: interpolate(frame, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [0, 14], [0.88, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
              output: "perceptual-scale",
            }),
            translate: interpolate(frame, [0, 14], ["0px 46px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {kicker ? (
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                marginBottom: 16,
                textShadow: "0 4px 18px rgba(0,0,0,0.6)",
              }}
            >
              {kicker}
            </div>
          ) : null}

          <div
            style={{
              fontSize: mainSize,
              fontWeight: 900,
              lineHeight: 1.03,
              letterSpacing: -1.5,
              color: mainColor,
              whiteSpace: "pre-line",
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 8px 34px rgba(0,0,0,0.62)",
            }}
          >
            {main}
          </div>

          {sub ? (
            <div
              style={{
                fontSize: 44,
                fontWeight: 600,
                lineHeight: 1.25,
                color: "rgba(255,255,255,0.92)",
                marginTop: 20,
                maxWidth: 840,
                textShadow: "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
