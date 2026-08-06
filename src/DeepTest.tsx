import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { CaptionDeep } from "./CaptionDeep";
import { World, WorldMode } from "./three/Worlds";
import { ContractPage, Ground, InfoCard, PaperStack, Phone } from "./three/Props3D";
import { CYAN, YELLOW } from "./fonts";

/**
 * Depth-edit test slice — 10 seconds cut from the take at 9.75s.
 *
 * Every beat is layered:
 *
 *   3D world  →  props  →  caption  →  cut-out speaker  →  bokeh
 *
 * so type and objects genuinely pass behind him rather than sitting on the
 * glass. The cut-out is a per-frame human matte muxed to VP9-with-alpha.
 *
 * Two framing decisions carry the look. The original room is dropped rather
 * than composited into: it is a flat purple wall that fights every prop, and a
 * built ground lets the cyan rim light match across cuts. And the speaker is
 * scaled to ~70% and anchored to the bottom edge — the take is framed chest-up
 * and fills the frame, which leaves the graphics nowhere to live. Shrinking him
 * buys the whole upper third for type and props.
 *
 * The bright world is the one beat he is absent from. He was shot dark against
 * a dark room, so that matte on near-white reads as a sticker; the reference
 * edit solves it the same way, going object-only whenever it goes light.
 */
const FPS = 30;
const SRC_IN = 9.75;
const sec = (s: number) => Math.round(s * FPS);

const SRC = "reel2-source.mp4";
const CUTOUT = "cutout-test.webm";

/**
 * Camera sits at z≈7 with a 46° field, so at the depth the props live the frame
 * only spans about ±1.7 on x and ±2.6 on y. Anything placed wider than that is
 * simply off-screen — every position below is inside that box, biased upward
 * into the space the shrunken speaker leaves free.
 */
type Beat = {
  from: number;
  to: number;
  mode: WorldMode;
  /** Bright beats drop the speaker and play as object-only cutaways. */
  solo?: boolean;
  props: () => React.ReactNode;
};

const BEATS: Beat[] = [
  {
    from: 0,
    to: 2.3,
    mode: "dark",
    props: () => (
      <>
        <Ground />
        <group scale={0.5} position={[-1.05, 1.15, -1.2]}>
          <PaperStack delay={4} />
        </group>
        <group scale={0.42} position={[1.15, 0.55, -1.4]}>
          <InfoCard delay={20} edge={CYAN} lines={2} />
        </group>
      </>
    ),
  },
  {
    from: 2.3,
    to: 3.85,
    mode: "dark",
    props: () => (
      <>
        <Ground />
        <group scale={0.46} position={[1.2, 1.0, -1.1]}>
          <ContractPage delay={4} accent={YELLOW} />
        </group>
        <group scale={0.4} position={[-1.25, 0.35, -1.5]}>
          <PaperStack count={18} delay={12} />
        </group>
      </>
    ),
  },
  {
    from: 3.85,
    to: 5.25,
    mode: "light",
    solo: true,
    props: () => (
      <>
        <Ground opacity={0.28} y={-2.4} />
        <group scale={0.58} position={[-0.68, -0.35, 0.5]}>
          <Phone delay={2} />
        </group>
        <group scale={0.42} position={[0.92, 0.85, -1.1]}>
          <ContractPage delay={14} accent={YELLOW} />
        </group>
      </>
    ),
  },
  {
    from: 5.25,
    to: 7.35,
    mode: "dark",
    props: () => (
      <>
        <Ground />
        <group scale={0.44} position={[-1.15, 1.75, -1]}>
          <InfoCard delay={2} edge={YELLOW} />
        </group>
        <group scale={0.44} position={[1.2, 1.1, -1.2]}>
          <InfoCard delay={16} edge={CYAN} />
        </group>
        <group scale={0.44} position={[-1.2, 0.35, -1.3]}>
          <InfoCard delay={30} edge={YELLOW} />
        </group>
      </>
    ),
  },
  {
    from: 7.35,
    to: 8.72,
    mode: "dark",
    props: () => (
      <>
        <Ground />
        {[0, 1, 2].map((i) => (
          <group key={i} scale={0.4} position={[1.15, 1.85 - i * 0.72, -1.1]}>
            <InfoCard delay={i * 8} edge={i === 1 ? CYAN : YELLOW} lines={2} />
          </group>
        ))}
      </>
    ),
  },
  {
    from: 8.72,
    to: 10,
    mode: "dark",
    props: () => (
      <>
        <Ground />
        <group scale={0.5} position={[-1.15, 1.15, -1.2]}>
          <ContractPage delay={2} accent={YELLOW} />
        </group>
      </>
    ),
  },
];

type Line = {
  from: number;
  to: number;
  lead?: string;
  main: string;
  accent?: boolean;
  top?: number;
  size?: number;
};

/**
 * Placed in the upper third, which the shrunken speaker leaves clear. His head
 * still clips the bottom of the taller blocks, which is exactly the effect —
 * the type has to be partly occluded to read as being behind him.
 */
const LINES: Line[] = [
  { from: 0, to: 0.75, lead: "приём", main: "ПЕРВЫЙ", accent: true, top: 0.14, size: 118 },
  { from: 0.75, to: 2.16, main: "ДОГОВОР\nНА 20 СТРАНИЦ", top: 0.11, size: 88 },
  { from: 2.34, to: 3.85, main: "НЕ ЧИТАЙТЕ\nЦЕЛИКОМ", accent: true, top: 0.1, size: 104 },
  { from: 3.85, to: 5.25, lead: "просто", main: "ЗАКИНЬТЕ\nВ НЕЙРОСЕТЬ", top: 0.68, size: 92 },
  { from: 5.25, to: 7.32, main: "СРОКИ\nШТРАФЫ\nУСЛОВИЯ", accent: true, top: 0.08, size: 96 },
  { from: 7.68, to: 8.72, main: "ОДНИМ\nСПИСКОМ", top: 0.12, size: 102 },
  { from: 8.75, to: 9.95, lead: "полчаса чтения", main: "= 1 МИНУТА", accent: true, top: 0.13, size: 110 },
];

/** Out-of-focus motes drifting in FRONT of everything, including the speaker. */
const Bokeh: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(7).fill(0).map((_, i) => {
        const seed = `b${i}`;
        const size = 26 + random(seed) * 70;
        const x = random(`${seed}x`) * 1080;
        const speed = 0.25 + random(`${seed}s`) * 0.5;
        const y = 1920 - ((frame * speed * 6 + random(`${seed}y`) * 1920) % 2300);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? YELLOW : CYAN,
              opacity: 0.1 + random(`${seed}o`) * 0.12,
              filter: `blur(${12 + random(`${seed}b`) * 18}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Short light kick on each world swap, so the cut lands. */
const Kick: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 5], [0.22, 0.14, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: o }} />;
};

/**
 * The speaker, matted out and set into the world. The pool underneath him is
 * what stops him floating: a cut-out with no contact shadow always reads as a
 * sticker, however clean the edge is.
 */
const Speaker: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 52% 26% at 50% 99%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)",
      }}
    />
    <AbsoluteFill
      style={{
        transform: "scale(0.72)",
        transformOrigin: "bottom center",
      }}
    >
      <OffthreadVideo
        src={staticFile(CUTOUT)}
        trimBefore={from}
        transparent
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // The take carries a magenta practical on the hair that fights the
          // cyan/yellow world; pulling saturation down and cooling it slightly
          // lets the matte sit in the built room instead of next to it.
          filter:
            "drop-shadow(0 18px 34px rgba(0,0,0,0.8)) saturate(0.82) contrast(1.06) hue-rotate(-8deg)",
        }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const DeepTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D1117" }}>
      <Audio name="Original voice" src={staticFile(SRC)} trimBefore={sec(SRC_IN)} />

      {BEATS.map((b) => {
        const dur = sec(b.to - b.from);
        const from = sec(b.from);
        return (
          <Sequence key={b.from} name={`Beat ${b.from} ${b.mode}`} from={from} durationInFrames={dur}>
            {/* 1–2. Built world and its props, behind everything. */}
            <AbsoluteFill>
              <World mode={b.mode} durationInFrames={dur}>
                {b.props()}
              </World>
            </AbsoluteFill>

            {/* 3. Captions — still behind him. */}
            <AbsoluteFill>
              {LINES.filter((l) => l.from < b.to && l.to > b.from).map((l) => {
                const lFrom = Math.max(l.from, b.from);
                const lDur = sec(Math.min(l.to, b.to) - lFrom);
                if (lDur < 4) return null;
                return (
                  <Sequence
                    key={`${l.from}-${b.from}`}
                    name={l.main.slice(0, 14)}
                    from={sec(lFrom) - from}
                    durationInFrames={lDur}
                    layout="none"
                  >
                    <CaptionDeep
                      lead={l.lead}
                      main={l.main}
                      accent={l.accent}
                      top={l.top}
                      size={l.size}
                      durationInFrames={lDur}
                    />
                  </Sequence>
                );
              })}
            </AbsoluteFill>

            {/* 4. The speaker, cut out, on top of all of it. */}
            {b.solo ? null : <Speaker from={from} />}

            <Kick />
          </Sequence>
        );
      })}

      {/* 5. Foreground motes — the last depth cue, in front of everything. */}
      <Bokeh />
    </AbsoluteFill>
  );
};
