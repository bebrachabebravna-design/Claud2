import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, uiFont } from "../fonts";
import { MODE, Mode, sec } from "./theme";
import { Ground } from "./Chrome";
import { CountUp } from "./Type";
import { Chip, Icon3D } from "./Cards";
import { Caption, CAP_YELLOW } from "./Caps";
import { Cue, SfxTrack } from "./Sound";
import {
  BEATS,
  CAPS,
  CAP_TOP,
  CUTOUTS,
  FRAMES,
  GROUNDS,
  REEL_END,
  Rect,
  SHOTS,
  TRIM,
  t,
} from "./cifra-data";

/**
 * «Самая дорогая статья расходов».
 *
 * Built as one continuous world rather than as alternating blocks. The ground
 * cross-fades between the two palettes, the speaker travels between framings as
 * a card in the same system as everything else, captions run unbroken along the
 * bottom, and objects arrive and leave with real motion. Nothing in the reel
 * cuts; every change is a move.
 */

export const CIFRA_DURATION = sec(REEL_END);

/* ------------------------------------------------------------------ */

/** Interpolate the speaker's rectangle across the keyframes in SHOTS. */
const useShot = (): { r: Rect; travel: number } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;

  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (now >= SHOTS[k].at) i = k;
  const cur = FRAMES[SHOTS[i].frame];
  const prev = i > 0 ? FRAMES[SHOTS[i - 1].frame] : cur;

  // A sprung move, not a linear one: the card should arrive and settle the way
  // every other element in this system does.
  const p =
    i === 0
      ? 1
      : spring({
          frame: frame - Math.round(SHOTS[i].at * fps),
          fps,
          config: { damping: 20, stiffness: 90, mass: 1.1 },
        });

  const mix = (a: number, b: number) => a + (b - a) * p;
  return {
    r: {
      x: mix(prev.x, cur.x),
      y: mix(prev.y, cur.y),
      w: mix(prev.w, cur.w),
      h: mix(prev.h, cur.h),
      radius: mix(prev.radius, cur.radius),
      oy: mix(prev.oy, cur.oy),
    },
    // 0 while parked, up to 1 mid-move — used to add a touch of blur so the
    // travel reads as motion rather than as a resize.
    travel: i === 0 ? 0 : Math.sin(p * Math.PI),
  };
};

/**
 * The speaker. One element for the whole reel: it never unmounts, so the take
 * plays continuously and the framing changes are moves rather than cuts.
 */
const Speaker: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { r, travel } = useShot();
  const m = MODE[mode];
  // Hand over to the matted version where one exists, rather than showing both.
  const cutFade = CUTOUTS.reduce((acc, c) => {
    const inAt = sec(c.from);
    const outAt = sec(c.from + c.dur);
    const f = interpolate(
      frame,
      [inAt - 6, inAt + 2, outAt - 2, outAt + 6],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return Math.max(acc, f);
  }, 0);
  const full = r.w > 1040;
  // A slow drift so the locked-off camera never sits perfectly still.
  // Always above 1: the plate is 1072 wide on a 1080 canvas, so any scale
  // below unity opens a black band down the edge.
  const drift = 1.02 + Math.sin(frame / 150) * 0.012;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: r.radius,
        overflow: "hidden",
        background: "#000",
        border: full ? "none" : `1px solid ${m.cardLine}`,
        boxShadow: full ? "none" : m.shadow,
        filter: `blur(${travel * 2.5}px)`,
        opacity: 1 - cutFade,
      }}
    >
      <OffthreadVideo
        src={staticFile("speaker-cifra.mp4")}
        startFrom={sec(TRIM)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${r.oy}%`,
          transform: `scale(${drift})`,
        }}
      />
      {/* Scrim only while full bleed — a card is small enough that the caption
          never sits over it. */}
      {full ? (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(8,6,14,0.40) 0%, rgba(8,6,14,0) 24%, rgba(8,6,14,0) 46%, rgba(8,6,14,0.70) 100%)",
          }}
        />
      ) : null}
    </div>
  );
};

/**
 * The matted speaker, standing on the canvas itself.
 *
 * This is the depth beat: because he is cut out of his plate, an object rendered
 * before this layer genuinely passes behind him. It reads as dimensional in a
 * way that no amount of overlay does, and it is the single most expensive-looking
 * move available with one static camera.
 */
const CutOut: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {CUTOUTS.map((c) => {
        const inAt = sec(c.from);
        const outAt = sec(c.from + c.dur);
        const o = interpolate(
          frame,
          [inAt - 6, inAt + 2, outAt - 2, outAt + 6],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        if (o <= 0) return null;
        return (
          <Sequence
            key={c.src}
            from={inAt}
            durationInFrames={Math.round(c.dur * 30) + 8}
            layout="none"
          >
            <AbsoluteFill style={{ opacity: o }}>
              <OffthreadVideo
                src={staticFile(c.src)}
                transparent
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

/** Cross-fading ground, so the two worlds never hard-cut. */
const Grounds: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  let i = 0;
  for (let k = 0; k < GROUNDS.length; k++) if (now >= GROUNDS[k].at) i = k;
  const p =
    i === 0
      ? 1
      : interpolate(frame, [sec(GROUNDS[i].at), sec(GROUNDS[i].at) + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const prev = i > 0 ? GROUNDS[i - 1].mode : GROUNDS[0].mode;
  return (
    <>
      <Ground mode={prev} />
      <AbsoluteFill style={{ opacity: p }}>
        <Ground mode={GROUNDS[i].mode} />
      </AbsoluteFill>
    </>
  );
};

/** The ground's mode at a given reel second, for colouring elements. */
const modeAt = (s: number): Mode => {
  let m: Mode = "dark";
  for (const g of GROUNDS) if (s >= g.at) m = g.mode;
  return m;
};

/* ------------------------------------------------------------------ */
/* Graphic beats. Each is a Sequence placed on the composition clock.    */

const Beat: React.FC<{ at: number; dur: number; children: React.ReactNode }> = ({
  at,
  dur,
  children,
}) => (
  <Sequence from={sec(at)} durationInFrames={sec(dur)} layout="none">
    {children}
  </Sequence>
);

/** A number that owns the frame, with its caption under it. */
const Figure: React.FC<{
  value: React.ReactNode;
  caption: string;
  mode: Mode;
  life: number;
  size?: number;
}> = ({ value, caption, mode, life, size = 168 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MODE[mode];
  const e = spring({ frame, fps, config: { damping: 15, stiffness: 150, mass: 0.9 } });
  const out = interpolate(frame, [life - 12, life], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ textAlign: "center", opacity: e * out }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -3,
          lineHeight: 1,
          color: m.ink,
          transform: `translateY(${(1 - e) * 40}px) scale(${interpolate(e, [0, 1], [0.72, 1])})`,
          filter: `blur(${(1 - e) * 8}px)`,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontWeight: 500,
          fontSize: 38,
          color: m.mute,
          marginTop: 10,
          opacity: interpolate(e, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
        }}
      >
        {caption}
      </div>
    </div>
  );
};

/** Row helper for objects that live in the graphics band under the card. */
const Band: React.FC<{ top: number; children: React.ReactNode; gap?: number }> = ({
  top,
  children,
  gap = 40,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </div>
);

const Graphics: React.FC = () => (
  <>
    {/* Hook: two objects, arriving from opposite sides beside his head. */}
    <Beat at={BEATS.hookSearch} dur={2.5}>
      <div style={{ position: "absolute", right: 60, top: 560 }}>
        <Icon3D name="analytics-search" size={210} float life={sec(2.5)} fromX={160} fromY={40} />
      </div>
    </Beat>
    {/* Rises from below and passes behind the matted speaker. */}
    <Beat at={BEATS.hookRival} dur={2.4}>
      <div style={{ position: "absolute", left: 560, top: 620 }}>
        <Icon3D name="target-arrow" size={430} float life={sec(2.4)} fromY={430} spin={26} />
      </div>
    </Beat>

    {/* Folders piling up under the card, one per beat. */}
    <Beat at={BEATS.folders} dur={5.4}>
      <Band top={870} gap={26}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon3D
            key={i}
            name="folder"
            size={168}
            float
            phase={i}
            delay={i * 8}
            life={sec(5.4) - i * 8}
            fromY={70 + i * 8}
            spin={i % 2 ? 16 : -16}
          />
        ))}
      </Band>
    </Beat>

    {/* The research figure, with him shrunk into the corner. */}
    <Beat at={BEATS.hours} dur={4.2}>
      <div style={{ position: "absolute", left: 60, top: 620, width: 560 }}>
        <Figure value="1,5 часа" caption="в день на человека" mode="dark" life={sec(4.2)} size={148} />
      </div>
      <div style={{ position: "absolute", left: 190, top: 980 }}>
        <Icon3D name="analytics-search" size={230} float delay={10} life={sec(4.2) - 10} fromY={80} />
      </div>
    </Beat>

    {/* Who the case is about, over the full-bleed shot. */}
    <Beat at={BEATS.caseChips} dur={2.8}>
      <Band top={880} gap={22}>
        <Chip mode="dark" icon={<Icon3D name="users-group" size={36} />}>
          24 менеджера
        </Chip>
        <Chip mode="dark" delay={7}>
          бытовая техника
        </Chip>
      </Band>
    </Beat>

    {/* What was measured. */}
    <Beat at={BEATS.stopwatch} dur={3.6}>
      <Band top={900}>
        <Icon3D name="analytics-search" size={240} float life={sec(3.6)} fromY={90} />
      </Band>
    </Beat>

    {/* The two numbers, arriving one after the other. */}
    <Beat at={BEATS.minutes} dur={1.9}>
      <Band top={860}>
        <Figure value="11 минут" caption="на один вопрос клиента" mode="light" life={sec(1.9)} size={132} />
      </Band>
    </Beat>
    <Beat at={BEATS.money} dur={2.6}>
      <Band top={840}>
        <div style={{ textAlign: "center" }}>
          <CountUp mode="light" to={238000} durationInFrames={30} size={158} suffix=" ₽" />
          <div style={{ fontFamily: uiFont, fontWeight: 500, fontSize: 38, color: MODE.light.mute }}>
            в месяц — на одном отделе
          </div>
        </div>
      </Band>
    </Beat>

    {/* Seven folders, only the last one lit. */}
    <Beat at={BEATS.seventh} dur={3.8}>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 700,
          width: 540,
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const last = i === 6;
          return (
            <div
              key={i}
              style={{
                opacity: last ? 1 : 0.42,
                filter: last ? "none" : "grayscale(0.5) brightness(0.8)",
              }}
            >
              <Icon3D
                name="folder"
                size={last ? 168 : 140}
                float={last}
                phase={i}
                delay={i * 5}
                life={sec(3.8) - i * 5}
                fromY={50}
                spin={last ? -22 : 8}
              />
            </div>
          );
        })}
      </div>
    </Beat>

    {/* The competitor: chips, then the rocket. */}
    <Beat at={BEATS.rival} dur={5.8}>
      <Band top={840} gap={26}>
        <Chip mode="light" icon={<Icon3D name="ai-chip" size={36} />}>
          нашёл заранее
        </Chip>
        <Chip mode="light" delay={8} icon={<Icon3D name="shield-check" size={36} />}>
          убрал через ИИ
        </Chip>
      </Band>
    </Beat>
    <Beat at={BEATS.rocket} dur={3.8}>
      <Band top={950}>
        <Icon3D name="rocket-launch" size={300} float life={sec(3.8)} fromY={150} spin={-26} />
      </Band>
    </Beat>

    {/* The ask. */}
    <Beat at={BEATS.cta} dur={5.0}>
      <div style={{ position: "absolute", right: 70, top: 430 }}>
        <Icon3D name="chat-bubbles" size={200} float fromX={150} fromY={0} />
      </div>
      <Band top={980}>
        <CodeWord />
      </Band>
    </Beat>
  </>
);

/**
 * The code word, in the reel's own accent rather than the interface blue: it is
 * the one thing on screen the viewer is asked to type.
 */
const CodeWord: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 12, stiffness: 200, mass: 0.7 } });
  const pulse = 1 + Math.sin(frame / 10) * 0.02;
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: uiFont,
          fontWeight: 500,
          fontSize: 40,
          color: "rgba(255,255,255,0.86)",
          opacity: e,
          marginBottom: 14,
        }}
      >
        напиши в комментариях
      </div>
      <div
        style={{
          display: "inline-block",
          padding: "12px 42px",
          borderRadius: 22,
          background: CAP_YELLOW,
          transform: `scale(${interpolate(e, [0, 1], [0.6, 1]) * pulse}) rotate(${(1 - e) * -5}deg)`,
          opacity: e,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        <span
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 132,
            letterSpacing: -2,
            color: "#0B0B0C",
          }}
        >
          цифру
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const CUES: Cue[] = [
  ...SHOTS.slice(1).map((s, i): Cue => ({
    at: s.at,
    sfx: i % 2 ? "whoosh" : "whoosh2",
    volume: 0.3,
  })),
  ...CAPS.map((c): Cue => ({ at: c.from, sfx: "tick", volume: 0.14 })),
  { at: BEATS.hookSearch, sfx: "pop", volume: 0.26 },
  { at: BEATS.hookRival, sfx: "digital2", volume: 0.3 },
  ...Array.from({ length: 5 }, (_, i): Cue => ({
    at: BEATS.folders + i * 0.267,
    sfx: (["tick2", "tick3", "pop"] as const)[i % 3],
    volume: 0.22,
  })),
  { at: BEATS.hours, sfx: "digital3", volume: 0.32 },
  { at: BEATS.stopwatch, sfx: "data", volume: 0.26 },
  { at: BEATS.minutes, sfx: "data2", volume: 0.3 },
  { at: BEATS.money, sfx: "digital3", volume: 0.34 },
  ...Array.from({ length: 7 }, (_, i): Cue => ({
    at: BEATS.seventh + i * 0.167,
    sfx: i === 6 ? "digital2" : "tick3",
    volume: i === 6 ? 0.32 : 0.15,
  })),
  { at: BEATS.rocket, sfx: "digital", volume: 0.3 },
  { at: BEATS.cta, sfx: "digital2", volume: 0.34 },
];

export const ReelCifra: React.FC = () => (
  <AbsoluteFill style={{ background: MODE.dark.bg }}>
    <Grounds />
    <Graphics />
    <CutOut />
    <Speaker mode="dark" />

    {/* Captions sit above everything, in one place, all the way through. */}
    {CAPS.map((c) => {
      const dur = sec(c.to) - sec(c.from);
      return (
        <Sequence key={c.from} from={sec(c.from)} durationInFrames={dur} layout="none">
          <div
            style={{
              position: "absolute",
              top: CAP_TOP,
              left: 70,
              right: 70,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Caption words={c.words} durationInFrames={dur} size={c.size ?? 66} />
          </div>
        </Sequence>
      );
    })}

    <Audio src={staticFile("speaker-cifra.mp4")} startFrom={sec(TRIM)} />
    <SfxTrack cues={CUES} />
  </AbsoluteFill>
);

export { modeAt, t };
