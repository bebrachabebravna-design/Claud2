import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop, Burst, Kicker, useOut } from "./Scenes2";
import { bebasFont, BLUE, CYAN, scriptFont, WHITE, YELLOW } from "./fonts";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconDoc,
  IconFolder,
  IconSearch,
} from "./Icons";

/**
 * Story-specific scenes for the case-study take (public/src4.mp4):
 * "клиент почти выгнал меня → 11 минут на поиск → 238 000 ₽/мес → 9 секунд".
 *
 * These are purpose-built for this narrative rather than reused from the
 * "3 приёма" set, and they share the Neirodocs ground (Backdrop/Burst) so the
 * clip reads as one world. Big numerals are Bebas, per the brief; the yellow
 * script is the only accent colour.
 */

const useEnter = (delay = 0, cfg = { damping: 16, stiffness: 150, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: cfg });
};

const Big: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  glow?: string;
}> = ({ children, size = 300, color = WHITE, glow = CYAN }) => (
  <div
    style={{
      fontFamily: bebasFont,
      fontSize: size,
      lineHeight: 0.86,
      color,
      letterSpacing: 2,
      textAlign: "center",
      textShadow: `0 0 40px ${glow}88, 0 10px 40px rgba(0,0,0,0.5)`,
    }}
  >
    {children}
  </div>
);

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 18 }) => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}
  >
    {children}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// 24 менеджера — company card
// ---------------------------------------------------------------------------
export const SceneCompany: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const e = useEnter();
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Center gap={26}>
        <div style={{ opacity: e }}>
          <Kicker>дистрибьютор техники</Kicker>
        </div>
        {/* Avatar grid animating in */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 20,
            width: 720,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const ai = useEnter(6 + i * 1.2, { damping: 12, stiffness: 200, mass: 0.5 });
            return (
              <div
                key={i}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background: `linear-gradient(160deg, ${BLUE}, ${CYAN})`,
                  transform: `scale(${ai})`,
                  boxShadow: `0 6px 20px rgba(0,0,0,0.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: bebasFont,
                  fontSize: 44,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {String.fromCharCode(1040 + (i % 30))}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, transform: `scale(${e})` }}>
          <Big size={220} color={CYAN}>24</Big>
          <Big size={96}>МЕНЕДЖЕРА</Big>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Засечём — question + running stopwatch
// ---------------------------------------------------------------------------
export const SceneStopwatch: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  // Digits race upward — the "meter running" feel.
  const secs = Math.floor(interpolate(frame, [20, durationInFrames], [0, 660], { extrapolateRight: "clamp" }));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const ringP = interpolate(frame, [20, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  const R = 150;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Center gap={44}>
        {/* Question bubble */}
        <div
          style={{
            transform: `translateY(${(1 - e) * 30}px) scale(${e})`,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(10px)",
            border: `1px solid rgba(255,255,255,0.25)`,
            borderRadius: 28,
            padding: "26px 44px",
            maxWidth: 820,
          }}
        >
          <div style={{ fontFamily: scriptFont, fontSize: 76, color: YELLOW, lineHeight: 0.95 }}>
            какая отсрочка<br />по договору?
          </div>
        </div>
        {/* Stopwatch ring */}
        <div style={{ position: "relative", width: 360, height: 360 }}>
          <svg width="360" height="360" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="180" cy="180" r={R} stroke="rgba(255,255,255,0.12)" strokeWidth="16" fill="none" />
            <circle
              cx="180"
              cy="180"
              r={R}
              stroke={CYAN}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - ringP)}
              style={{ filter: `drop-shadow(0 0 12px ${CYAN})` }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Big size={150} color={WHITE}>{mm}:{ss}</Big>
          </div>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 11 минут — the reveal slam
// ---------------------------------------------------------------------------
export const SceneReveal: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const slam = spring({ frame, fps: 30, config: { damping: 9, stiffness: 260, mass: 0.6 } });
  // A quick shake right after the slam.
  const shake = frame < 20 ? Math.sin(frame * 1.6) * (1 - frame / 20) * 10 : 0;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop withField={false} />
      <AbsoluteFill style={{ background: "rgba(5,11,22,0.35)" }} />
      <Center gap={4}>
        <div style={{ transform: `translateX(${shake}px) scale(${interpolate(slam, [0, 1], [0.6, 1])})` }}>
          <Big size={420} color={WHITE} glow={CYAN}>11</Big>
        </div>
        <Big size={140} color={CYAN}>МИНУТ</Big>
        <Burst x={540} y={760} startAt={4} n={22} />
      </Center>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Chaos — document scattered across folders + failing search
// ---------------------------------------------------------------------------
export const SceneChaos: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const spots = [
    { x: 120, y: 380, label: "договор", Icon: IconDoc, d: 4 },
    { x: 720, y: 300, label: "условия", Icon: IconFolder, d: 14 },
    { x: 200, y: 780, label: "прайс", Icon: IconFolder, d: 24 },
    { x: 760, y: 860, label: "почта", Icon: IconDoc, d: 34 },
  ];
  // A magnifier drifts between the folders, never quite landing.
  const mx = 540 + Math.sin(frame / 20) * 300;
  const my = 620 + Math.cos(frame / 16) * 240;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Center gap={0}>
        <div style={{ position: "absolute", top: 150 }}>
          <Kicker>всё разложено… но</Kicker>
        </div>
      </Center>
      {spots.map((s, i) => {
        const e = useEnter(s.d, { damping: 13, stiffness: 180, mass: 0.6 });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              transform: `scale(${e})`,
              opacity: e,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <s.Icon size={130} color={CYAN} strokeWidth={3} />
            <div style={{ fontFamily: bebasFont, fontSize: 52, color: "rgba(255,255,255,0.8)" }}>{s.label}</div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: mx,
          top: my,
          filter: `drop-shadow(0 0 16px ${CYAN})`,
        }}
      >
        <IconSearch size={180} color={WHITE} strokeWidth={3} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 238 000 ₽/мес — money counter
// ---------------------------------------------------------------------------
export const SceneMoney: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const val = Math.round(
    interpolate(frame, [8, 55], [0, 238000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const fmt = val.toLocaleString("ru-RU").replace(/,/g, " ");
  const e = useEnter();
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Center gap={10}>
        <div style={{ opacity: e }}>
          <Kicker>утекает в месяц</Kicker>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <Big size={230} color={WHITE} glow={CYAN}>{fmt}</Big>
          <Big size={150} color={CYAN}>₽</Big>
        </div>
        <div style={{ fontFamily: scriptFont, fontSize: 92, color: YELLOW }}>каждый месяц</div>
        <Burst x={540} y={780} startAt={50} n={20} />
      </Center>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 11 мин → 9 сек — the contrast
// ---------------------------------------------------------------------------
export const SceneContrast: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const before = useEnter(2);
  const after = useEnter(24, { damping: 10, stiffness: 240, mass: 0.6 });
  const arrow = useEnter(16);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Center gap={30}>
        <div style={{ opacity: before, transform: `scale(${before})`, position: "relative" }}>
          <Big size={150} color="rgba(255,255,255,0.55)">11 МИНУТ</Big>
          {/* strike-through */}
          <div
            style={{
              position: "absolute",
              top: "52%",
              left: "-4%",
              width: `${108 * before}%`,
              height: 10,
              background: YELLOW,
              borderRadius: 6,
            }}
          />
        </div>
        <div style={{ opacity: arrow, transform: `rotate(90deg) scale(${arrow})` }}>
          <IconArrowRight size={90} color={CYAN} strokeWidth={4} />
        </div>
        <div style={{ transform: `scale(${after})`, display: "flex", alignItems: "center", gap: 24 }}>
          <IconCheck size={110} color={CYAN} strokeWidth={4} />
          <Big size={230} color={WHITE} glow={CYAN}>9 СЕК</Big>
        </div>
        <Burst x={620} y={1120} startAt={26} n={20} />
      </Center>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CTA — засеки свой вопрос
// ---------------------------------------------------------------------------
export const SceneCaseCTA: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  const secs = interpolate(frame, [10, durationInFrames], [0, 40], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      {/* rising comment bubbles */}
      {Array.from({ length: 6 }).map((_, i) => {
        const t = ((frame * 0.9 + i * 40) % 260) / 260;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + random(`c${i}`) * 760,
              top: 1500 - t * 900,
              opacity: (1 - t) * 0.5,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20,
                width: 120 + random(`w${i}`) * 120,
                height: 42,
              }}
            />
          </div>
        );
      })}
      <Center gap={28}>
        <IconClock size={150} color={CYAN} strokeWidth={3} />
        <div style={{ transform: `scale(${e})`, textAlign: "center" }}>
          <Big size={128}>ЗАСЕКИ</Big>
          <Big size={128} color={CYAN}>ОДИН ВОПРОС</Big>
        </div>
        <div style={{ fontFamily: scriptFont, fontSize: 84, color: YELLOW }}>и напиши, что вышло</div>
      </Center>
    </AbsoluteFill>
  );
};
