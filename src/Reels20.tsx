import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { BEATS, CAPS, Chunk, END, FPS, SPEECH_IN } from "./captions3";
import { bebasFont, displayFont, montsFont, scriptFont, YELLOW } from "./fonts";
import { Grain } from "./fx";

/**
 * Three 21-second edits of the new take, for choosing a look.
 *
 * Nothing is matted here — the speaker asked to stay in frame whole, so every
 * variant works with the raw picture and earns its depth from grading,
 * re-framing and the graphics layer instead.
 *
 * Two things the previous pass got wrong are fixed structurally rather than by
 * tweaking numbers:
 *
 * 1. Type used to sit crooked because the glass panel and the text were two
 *    independently positioned boxes that only happened to overlap. Here the
 *    panel IS the text's container — it hugs the text with padding, so they
 *    cannot drift apart at any size or line count.
 * 2. Everything now respects the Reels safe area (roughly 110px top, 420px
 *    bottom, 60/120 at the sides on a 1080×1920 frame): captions sit in the
 *    lower-middle band, never under the UI furniture.
 */
const SRC = "src3.mp4";
const sec = (s: number) => Math.round(s * FPS);
export const DUR_FRAMES = sec(END);

// Safe-area constants, in px on the 1080×1920 canvas.
const SIDE_PAD = 90;
/** Captions live here: clear of the face above and of Instagram's UI below. */
const CAP_TOP = 0.63;
const HEAD_TOP = 0.115;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

const Voice: React.FC = () => <Audio name="Голос" src={staticFile(SRC)} />;

/**
 * The take, re-framed per beat. Scale stays inside 1.0–1.08: the source is
 * 720p on a 1080p canvas, so anything more turns soft.
 */
const Shot: React.FC<{
  beat: number;
  durationInFrames: number;
  grade?: string;
}> = ({ beat, durationInFrames, grade = "" }) => {
  const frame = useCurrentFrame();
  const moves = [
    { from: 1.0, to: 1.05, ox: 50, oy: 40 },
    { from: 1.06, to: 1.0, ox: 46, oy: 34 },
    { from: 1.0, to: 1.06, ox: 54, oy: 42 },
    { from: 1.05, to: 1.0, ox: 50, oy: 30 },
    { from: 1.0, to: 1.07, ox: 48, oy: 38 },
    { from: 1.06, to: 1.01, ox: 52, oy: 36 },
    { from: 1.0, to: 1.05, ox: 50, oy: 40 },
  ][beat % 7];

  const s = interpolate(frame, [0, durationInFrames], [moves.from, moves.to]);
  // A short settle on entry stops every cut landing on a dead-still frame.
  const settle = interpolate(frame, [0, 8], [1.015, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(SRC)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s * settle})`,
          transformOrigin: `${moves.ox}% ${moves.oy}%`,
          filter: grade,
        }}
      />
    </AbsoluteFill>
  );
};

/** Thin progress bar — a cheap, proven retention cue at the top of the frame. */
const Progress: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const p = frame / DUR_FRAMES;
  return (
    <div
      style={{
        position: "absolute",
        top: 46,
        left: SIDE_PAD,
        right: SIDE_PAD,
        height: 5,
        borderRadius: 3,
        background: "rgba(255,255,255,0.18)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${p * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
};

/** Drifting colour pools, used as ambience at the edges of the frame. */
const Pools: React.FC<{
  pools: { color: string; x: number; y: number; r: number }[];
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ pools, blend }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: blend, pointerEvents: "none" }}>
      {pools.map((p, i) => {
        const t = frame * 0.014 + i * 1.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.r,
              height: p.r,
              transform: `translate(${Math.sin(t) * 70 - p.r / 2}px, ${Math.cos(t * 0.8) * 70 - p.r / 2}px)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
              filter: "blur(26px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** One-frame light kick, so each beat change registers. */
const Kick: React.FC<{ color?: string; strength?: number }> = ({
  color = "#FFFFFF",
  strength = 0.18,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 6], [strength, strength * 0.5, 0], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: "none" }} />;
};

// ---------------------------------------------------------------------------
// Caption cards — the panel is the text's container, never a separate box
// ---------------------------------------------------------------------------

type CardStyle = {
  font: string;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  panel: React.CSSProperties;
  accentSize: number;
};

const Card: React.FC<{
  chunk: Chunk;
  durationInFrames: number;
  style: CardStyle;
  top: number;
  edge: string;
}> = ({ chunk, durationInFrames, style, top, edge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 17, stiffness: 220, mass: 0.5 } });
  const out = interpolate(frame, [durationInFrames - 3, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        top: `${top * 100}%`,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: SIDE_PAD,
        paddingRight: SIDE_PAD,
        opacity: out,
      }}
    >
      <div
        style={{
          // The card hugs its text: same box, so they can never misalign.
          display: "inline-block",
          padding: chunk.accent ? "14px 40px 26px" : "22px 44px",
          borderRadius: 30,
          transform: `translateY(${(1 - e) * 26}px) scale(${interpolate(e, [0, 1], [0.93, 1])})`,
          ...style.panel,
          borderTop: `3px solid ${chunk.accent ? YELLOW : edge}`,
        }}
      >
        <div
          style={{
            fontFamily: chunk.accent ? scriptFont : style.font,
            fontWeight: chunk.accent ? 400 : style.weight,
            fontSize: chunk.accent ? style.accentSize : style.size,
            lineHeight: chunk.accent ? 0.9 : style.lineHeight,
            letterSpacing: chunk.accent ? 0 : style.letterSpacing,
            color: chunk.accent ? YELLOW : style.color,
            textTransform: chunk.accent ? "none" : "uppercase",
            textAlign: "center",
            whiteSpace: "pre-line",
            margin: 0,
          }}
        >
          {chunk.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ style: CardStyle; top?: number; edge?: string }> = ({
  style,
  top = CAP_TOP,
  edge = "#FFFFFF",
}) => (
  <AbsoluteFill>
    {CAPS.map((c) => {
      const d = sec(c.to - c.from);
      if (d < 4) return null;
      return (
        <Sequence key={c.from} from={sec(c.from)} durationInFrames={d} layout="none">
          <Card chunk={c} durationInFrames={d} style={style} top={top} edge={edge} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

/** Opening title, held over the silent head of the take. */
const Hook: React.FC<{
  font: string;
  weight: number;
  size: number;
  color: string;
  sub: string;
  main: string;
}> = ({ font, weight, size, color, sub, main }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 18, stiffness: 160 } });
  const d = sec(SPEECH_IN);
  const out = interpolate(frame, [d - 8, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: out,
        paddingLeft: SIDE_PAD,
        paddingRight: SIDE_PAD,
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${interpolate(e, [0, 1], [0.88, 1])})` }}>
        <div
          style={{
            fontFamily: scriptFont,
            fontSize: size * 0.55,
            color: YELLOW,
            marginBottom: -6,
            opacity: e,
          }}
        >
          {sub}
        </div>
        <div
          style={{
            fontFamily: font,
            fontWeight: weight,
            fontSize: size,
            lineHeight: 0.98,
            color,
            textTransform: "uppercase",
            whiteSpace: "pre-line",
            letterSpacing: -1,
            textShadow: "0 8px 40px rgba(0,0,0,0.55)",
          }}
        >
          {main}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Beats: React.FC<{ render: (i: number, d: number) => React.ReactNode }> = ({ render }) => (
  <>
    {BEATS.slice(0, -1).map((b, i) => {
      const d = sec(BEATS[i + 1] - b);
      return (
        <Sequence key={b} from={sec(b)} durationInFrames={d} name={`Beat ${i}`}>
          {render(i, d)}
        </Sequence>
      );
    })}
  </>
);

// ===========================================================================
// V1 — СТЕКЛО, шрифт BEBAS NEUE
// ===========================================================================
/**
 * Smoked rather than clear glass. A white-tinted panel disappeared against the
 * white t-shirt the take is full of, taking the white type with it; tinting the
 * fill dark keeps the card readable wherever it lands in the frame.
 */
const GLASS: React.CSSProperties = {
  background: "rgba(8,16,34,0.42)",
  backdropFilter: "blur(20px) saturate(1.2)",
  WebkitBackdropFilter: "blur(20px) saturate(1.2)",
  border: "1px solid rgba(255,255,255,0.24)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.28)",
};

export const Reel1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050A18" }}>
    <Voice />
    <Beats
      render={(i, d) => (
        <>
          <Shot beat={i} durationInFrames={d} grade="saturate(0.82) contrast(1.12) brightness(0.94)" />
          <Kick color="#45D0FF" strength={0.14} />
        </>
      )}
    />
    {/* Brand ambience pushed to the edges by the vignette below */}
    <Pools
      blend="screen"
      pools={[
        { color: "#1E5FFF", x: 8, y: 18, r: 760 },
        { color: "#45D0FF", x: 84, y: 62, r: 700 },
        { color: "#0B2C7A", x: 46, y: 96, r: 820 },
      ]}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(5,10,24,0.72) 0%, rgba(5,10,24,0) 26%, rgba(5,10,24,0) 46%, rgba(5,10,24,0.85) 92%)",
      }}
    />
    <Progress color="#45D0FF" />
    <Sequence durationInFrames={sec(SPEECH_IN)} layout="none">
      <Hook font={bebasFont} weight={400} size={132} color="#FFFFFF" sub="не плати за" main={"РУТИНУ"} />
    </Sequence>
    <Captions
      edge="#45D0FF"
      style={{
        font: bebasFont,
        weight: 400,
        size: 104,
        lineHeight: 0.92,
        letterSpacing: 1,
        color: "#FFFFFF",
        accentSize: 92,
        panel: GLASS,
      }}
    />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

// ===========================================================================
// V2 — СВЕТЛЫЙ ПРЕМИУМ, шрифт MONTSERRAT, видео в карточке
// ===========================================================================
export const Reel2: React.FC = () => {
  const frame = useCurrentFrame();
  // The card breathes very slightly so the light layout is never static.
  const breathe = 1 + Math.sin(frame / 90) * 0.006;
  return (
    <AbsoluteFill style={{ backgroundColor: "#EDF2F8" }}>
      <Voice />
      <Pools
        pools={[
          { color: "#C8DEFF", x: 12, y: 16, r: 880 },
          { color: "#FFE9AE", x: 82, y: 70, r: 640 },
          { color: "#D9E9FF", x: 44, y: 96, r: 820 },
        ]}
      />

      {/* Video card: equal margins on both sides, so nothing reads as crooked */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: "20%" }}>
        <div
          style={{
            width: 1080 - SIDE_PAD * 2,
            height: 1220,
            borderRadius: 46,
            overflow: "hidden",
            transform: `scale(${breathe})`,
            boxShadow: "0 40px 90px rgba(20,45,95,0.28)",
            border: "8px solid #FFFFFF",
            background: "#0A0E16",
          }}
        >
          <Beats
            render={(i, d) => (
              <>
                <Shot beat={i} durationInFrames={d} grade="saturate(0.92) contrast(1.04)" />
                <Kick color="#FFFFFF" strength={0.12} />
              </>
            )}
          />
        </div>
      </AbsoluteFill>

      <Progress color="#1E5FFF" />
      <Sequence durationInFrames={sec(SPEECH_IN)} layout="none">
        <Hook font={montsFont} weight={800} size={118} color="#0E2547" sub="не плати за" main={"РУТИНУ"} />
      </Sequence>

      {/* Caption pill overlaps the lower edge of the card — deliberate, and
          still inside the safe area. */}
      <Captions
        top={0.665}
        edge="#1E5FFF"
        style={{
          font: montsFont,
          weight: 800,
          size: 78,
          lineHeight: 1.05,
          letterSpacing: -1,
          color: "#0E2547",
          accentSize: 86,
          panel: {
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 22px 60px rgba(20,45,95,0.26)",
          },
        }}
      />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// V3 — ТЁМНЫЙ ДИНАМИЧНЫЙ, шрифт SF PRO, без плашки
// ===========================================================================
export const Reel3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07070C" }}>
    <Voice />
    <Beats
      render={(i, d) => (
        <>
          <Shot beat={i} durationInFrames={d} grade="saturate(0.7) contrast(1.2) brightness(0.88)" />
          {/* Palette cycles per beat — the strongest retention device here */}
          <Pools
            blend="screen"
            pools={
              [
                [
                  { color: "#2E7BFF", x: 10, y: 20, r: 720 },
                  { color: "#00E0C6", x: 86, y: 66, r: 660 },
                ],
                [
                  { color: "#7A2EFF", x: 14, y: 24, r: 700 },
                  { color: "#2E7BFF", x: 84, y: 62, r: 700 },
                ],
                [
                  { color: "#FF3D7F", x: 12, y: 18, r: 680 },
                  { color: "#FFB03D", x: 88, y: 70, r: 640 },
                ],
              ][i % 3]
            }
          />
          <Kick color="#FFFFFF" strength={0.22} />
        </>
      )}
    />
    <AbsoluteFill
      style={{
        background:
          // The lower scrim is heavy on purpose: unboxed white type has to sit
          // on the take's white t-shirt, and only a real gradient saves it.
          "radial-gradient(ellipse 82% 62% at 50% 34%, rgba(0,0,0,0) 40%, rgba(7,7,12,0.8) 100%), linear-gradient(to bottom, rgba(7,7,12,0.6) 0%, transparent 22%, transparent 38%, rgba(7,7,12,0.55) 60%, rgba(7,7,12,0.92) 96%)",
      }}
    />
    <Progress color={YELLOW} />
    <Sequence durationInFrames={sec(SPEECH_IN)} layout="none">
      <Hook font={displayFont} weight={800} size={140} color="#FFFFFF" sub="не плати за" main={"РУТИНУ"} />
    </Sequence>
    {/* No panel: a soft shadow does the legibility work, which keeps the type
        feeling native rather than boxed. */}
    <Captions
      edge="transparent"
      style={{
        font: displayFont,
        weight: 800,
        size: 92,
        lineHeight: 1.0,
        letterSpacing: -2,
        color: "#FFFFFF",
        accentSize: 100,
        panel: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
          filter: "drop-shadow(0 6px 26px rgba(0,0,0,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
        },
      }}
    />
    <Grain opacity={0.07} />
  </AbsoluteFill>
);
