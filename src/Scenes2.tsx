import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUE, CYAN, displayFont, INK, NAVY, scriptFont, WHITE } from "./fonts";
import {
  IconCheck,
  IconChat,
  IconClock,
  IconDoc,
  IconFolder,
  IconMail,
  IconSearch,
  IconSliders,
} from "./Icons";

const useOut = (durationInFrames: number, frames = 7) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Deep animated ground: brand navy, two drifting light pools, a creeping grid,
 * and a scattered field of faint icons that never stop moving. This is what
 * kills the "one lonely icon on flat blue" feeling — there is always motion
 * behind the content.
 */
const FLOAT_ICONS = [IconDoc, IconFolder, IconMail, IconChat, IconCheck, IconClock, IconSearch, IconSliders];

const FloatingField: React.FC<{ count?: number }> = ({ count = 16 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length];
        const bx = random(`x${i}`) * 1080;
        const by = random(`y${i}`) * 1920;
        const amp = 20 + random(`a${i}`) * 40;
        const speed = 30 + random(`s${i}`) * 50;
        const size = 34 + random(`sz${i}`) * 46;
        const dx = Math.sin((frame + i * 40) / speed) * amp;
        const dy = Math.cos((frame + i * 25) / (speed * 1.2)) * amp;
        const rot = Math.sin((frame + i * 15) / 60) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bx + dx,
              top: by + dy,
              transform: `rotate(${rot}deg)`,
              opacity: 0.09 + random(`o${i}`) * 0.06,
            }}
          >
            <Icon size={size} color={CYAN} strokeWidth={3} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Backdrop: React.FC<{ withField?: boolean }> = ({ withField = true }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 42) * 6;
  const dy = Math.cos(frame / 57) * 7;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundColor: NAVY, opacity: 0.92 }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + dx}% ${32 + dy}%, ${BLUE} 0%, rgba(0,0,0,0) 58%)`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${26 - dy}% ${74 - dx}%, ${CYAN} 0%, rgba(0,0,0,0) 48%)`,
          opacity: 0.16,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(69,208,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(69,208,255,0.08) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: `0px ${-frame * 0.9}px`,
          maskImage: "radial-gradient(ellipse 78% 62% at 50% 45%, #000 30%, transparent 82%)",
        }}
      />
      {withField ? <FloatingField /> : null}
    </AbsoluteFill>
  );
};

/** A short particle burst — cyan sparks flying outward from a point. */
const Burst: React.FC<{ x: number; y: number; startAt: number; n?: number }> = ({
  x,
  y,
  startAt,
  n = 14,
}) => {
  const frame = useCurrentFrame();
  const t = frame - startAt;
  if (t < 0 || t > 26) return null;
  const p = interpolate(t, [0, 26], [0, 1]);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + random(`ang${i}`);
        const dist = (60 + random(`d${i}`) * 120) * Easing.out(Easing.quad)(p);
        const size = 8 + random(`ps${i}`) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(ang) * dist,
              top: y + Math.sin(ang) * dist,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 2 ? CYAN : WHITE,
              opacity: 1 - p,
              boxShadow: `0 0 12px ${CYAN}`,
            }}
          />
        );
      })}
    </>
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: displayFont,
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.62)",
    }}
  >
    {children}
  </div>
);

/**
 * Animated intro over the silent opening seconds: faint document icons rush into
 * the centre and assemble the title, so the clip never opens on a static frame.
 */
export const SceneIntro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const three = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 200 } });
  const word = spring({ frame: frame - 16, fps, config: { damping: 12, stiffness: 190 } });
  const sub = interpolate(frame, [26, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      {/* icons converging to centre */}
      {Array.from({ length: 10 }).map((_, i) => {
        const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length];
        const conv = spring({ frame: frame - i * 2, fps, config: { damping: 14, stiffness: 120 } });
        const ang = (i / 10) * Math.PI * 2;
        const r = interpolate(conv, [0, 1], [720, 120]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(ang) * r - 30,
              top: 820 + Math.sin(ang) * r - 30,
              opacity: interpolate(conv, [0, 0.7, 1], [0, 0.5, 0]),
            }}
          >
            <Icon size={60} color={CYAN} strokeWidth={3} />
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: 320,
              lineHeight: 1,
              color: WHITE,
              transform: `scale(${three})`,
              textShadow: "0 0 60px rgba(69,208,255,0.4)",
            }}
          >
            3
          </span>
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: 120,
              letterSpacing: -3,
              color: CYAN,
              transform: `scale(${word}) translateY(${interpolate(word, [0, 1], [30, 0])}px)`,
              textShadow: "0 0 50px rgba(69,208,255,0.55)",
            }}
          >
            ПРИЁМА
          </span>
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 46,
            color: "rgba(255,255,255,0.8)",
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [16, 0])}px)`,
          }}
        >
          как убрать рутину нейросетью
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tip 1 — a scanned contract collapsing into three key points.
 * A scan beam sweeps the document, key lines light up, then pills burst out with
 * particle pops, while a timer counts 30:00 → 00:60. Several motions at once.
 */
export const SceneContract: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);

  const scanY = interpolate(frame % 70, [0, 70], [0, 300]);
  const items = [
    { label: "Сроки", Icon: IconClock },
    { label: "Штрафы", Icon: IconCheck },
    { label: "Расторжение", Icon: IconDoc },
  ];
  // timer 30:00 -> 00:60 (i.e. 1 minute)
  const tt = interpolate(frame, [20, durationInFrames * 0.6], [30, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const mm = String(Math.floor(tt)).padStart(2, "0");

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
          {/* Document with scan beam */}
          <div
            style={{
              position: "relative",
              width: 260,
              height: 340,
              borderRadius: 18,
              background: "rgba(255,255,255,0.96)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {[...Array(9)].map((_, k) => (
              <div key={k} style={{ height: 12, borderRadius: 6, background: "rgba(10,20,40,0.18)", width: `${92 - (k % 3) * 16}%` }} />
            ))}
            {/* scan beam */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: scanY,
                height: 40,
                background: "linear-gradient(rgba(69,208,255,0), rgba(69,208,255,0.55), rgba(69,208,255,0))",
                boxShadow: `0 0 24px ${CYAN}`,
              }}
            />
          </div>

          <div style={{ fontSize: 90, color: CYAN, fontFamily: displayFont, fontWeight: 900 }}>→</div>

          {/* Key pills bursting out */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 380, position: "relative" }}>
            {items.map((it, i) => {
              const s = spring({ frame: frame - 24 - i * 9, fps, config: { damping: 12, stiffness: 210 } });
              return (
                <div key={it.label} style={{ position: "relative" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      transform: `translateX(${interpolate(s, [0, 1], [60, 0])}px) scale(${s})`,
                      opacity: s,
                      background: "linear-gradient(135deg, rgba(30,95,255,0.35), rgba(69,208,255,0.14))",
                      border: `3px solid ${CYAN}`,
                      borderRadius: 18,
                      padding: "16px 22px",
                      boxShadow: "0 0 30px rgba(69,208,255,0.25)",
                    }}
                  >
                    <it.Icon size={42} color={CYAN} />
                    <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 40, color: WHITE }}>{it.label}</span>
                  </div>
                  <Burst x={40} y={30} startAt={24 + i * 9} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 92,
            color: WHITE,
          }}
        >
          <IconClock size={70} color={CYAN} />
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{mm}:00</span>
          <span style={{ color: CYAN, fontSize: 60 }}>→</span>
          <span style={{ color: CYAN }}>1 мин</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tip 2 — a meeting recording becoming a task list.
 * Pulsing mic in a glowing ring, live equalizer, then task cards fly in from
 * alternating sides with checkmark stamps and dates.
 */
export const SceneMeeting: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const pulse = 1 + Math.sin(frame / 6) * 0.06;
  const bars = 34;
  const tasks = [
    { who: "Иван", what: "договор", date: "до 5-го" },
    { who: "Аня", what: "смета", date: "до 7-го" },
    { who: "Пётр", what: "отчёт", date: "до 10-го" },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34 }}>
        <Kicker>запись встречи</Kicker>
        {/* mic + ring */}
        <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `4px solid ${CYAN}`,
              transform: `scale(${pulse})`,
              opacity: 0.6,
              boxShadow: `0 0 40px ${CYAN}`,
            }}
          />
          <IconChat size={80} color={CYAN} />
        </div>
        {/* equalizer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 120 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const h = 16 + Math.abs(Math.sin(i * 0.5 + frame / 3.5)) * 100;
            return <div key={i} style={{ width: 9, height: h, borderRadius: 5, background: i % 3 === 0 ? CYAN : "rgba(69,208,255,0.4)", boxShadow: i % 3 === 0 ? `0 0 10px ${CYAN}` : "none" }} />;
          })}
        </div>
        <div style={{ fontSize: 64, color: CYAN }}>↓</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 640 }}>
          {tasks.map((t, i) => {
            const s = spring({ frame: frame - 24 - i * 8, fps, config: { damping: 13, stiffness: 200 } });
            const fromLeft = i % 2 === 0;
            return (
              <div
                key={t.who}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transform: `translateX(${interpolate(s, [0, 1], [fromLeft ? -80 : 80, 0])}px)`,
                  opacity: s,
                  background: "rgba(255,255,255,0.06)",
                  border: "3px solid rgba(69,208,255,0.4)",
                  borderRadius: 18,
                  padding: "16px 22px",
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: displayFont, fontWeight: 900, fontSize: 30, color: WHITE }}>
                  {t.who[0]}
                </div>
                <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 38, color: WHITE }}>{t.who} — {t.what}</span>
                <span style={{ marginLeft: "auto", fontFamily: displayFont, fontWeight: 700, fontSize: 32, color: CYAN }}>{t.date}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tip 3 — a template typing itself into a finished document, then a stamp slams
 * in with a particle burst.
 */
export const SceneTemplate: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });
  const rows = 6;
  const fillT = interpolate(frame, [12, durationInFrames * 0.62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampAt = Math.round(durationInFrames * 0.66);
  const stamp = spring({ frame: frame - stampAt, fps, config: { damping: 9, stiffness: 240 } });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, transform: `scale(${enter})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <IconDoc size={60} color={CYAN} />
          <Kicker>шаблон → документ</Kicker>
        </div>
        <div
          style={{
            position: "relative",
            width: 640,
            background: "rgba(255,255,255,0.96)",
            borderRadius: 22,
            padding: 44,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ height: 28, width: "55%", borderRadius: 7, background: NAVY }} />
          {Array.from({ length: rows }).map((_, i) => {
            const rowT = interpolate(fillT, [i / rows, (i + 1) / rows], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const w = [92, 80, 88, 70, 84, 60][i];
            return (
              <div key={i} style={{ position: "relative", height: 20, borderRadius: 6, background: "rgba(10,20,40,0.12)", width: `${w}%` }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${rowT * 100}%`,
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${BLUE}, ${CYAN})`,
                    boxShadow: rowT > 0 && rowT < 1 ? `0 0 14px ${CYAN}` : "none",
                  }}
                />
              </div>
            );
          })}
          {/* GOTOVO stamp */}
          <div
            style={{
              position: "absolute",
              right: -20,
              bottom: -30,
              transform: `scale(${stamp}) rotate(${interpolate(stamp, [0, 1], [-25, -12])}deg)`,
              opacity: stamp,
              border: `6px solid #18B26B`,
              color: "#18B26B",
              borderRadius: 16,
              padding: "10px 26px",
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: 54,
              background: "rgba(255,255,255,0.9)",
            }}
          >
            ГОТОВО
          </div>
          <Burst x={560} y={330} startAt={stampAt} n={18} />
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 60, color: WHITE }}>
          за <span style={{ color: CYAN }}>секунды</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Payoff trio with bouncing icons and spark pops. */
export const SceneTrio: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const items = [
    { label: "ЭКОНОМИЯ", Icon: IconCheck },
    { label: "ПРИБЫЛЬ", Icon: IconSliders },
    { label: "ВРЕМЯ", Icon: IconClock },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        {items.map((it, i) => {
          const s = spring({ frame: frame - i * 7, fps, config: { damping: 10, stiffness: 220 } });
          return (
            <div key={it.label} style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, transform: `scale(${s})`, opacity: s }}>
              <div style={{ width: 96, height: 96, borderRadius: 24, background: "rgba(69,208,255,0.14)", border: `3px solid ${CYAN}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px rgba(69,208,255,0.3)` }}>
                <it.Icon size={56} color={CYAN} />
              </div>
              <span style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 88, letterSpacing: -2, color: WHITE }}>{it.label}</span>
              <Burst x={48} y={48} startAt={i * 7} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Closing card with a saving bookmark bounce and rising comment bubbles. */
export const SceneOutro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 190 } });
  const bob = Math.sin(frame / 9) * 9;
  const out = useOut(durationInFrames, 8);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      {/* rising comment bubbles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const life = (frame + i * 20) % 120;
        const p = life / 120;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + random(`cx${i}`) * 840,
              top: interpolate(p, [0, 1], [1700, 400]),
              opacity: interpolate(p, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0]),
            }}
          >
            <IconChat size={40 + random(`cs${i}`) * 30} color={CYAN} />
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 28, transform: `scale(${enter})` }}>
        <div style={{ transform: `translateY(${bob}px)` }}>
          <IconCheck size={110} color={CYAN} strokeWidth={5} />
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 92,
            letterSpacing: -2,
            color: WHITE,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          СОХРАНИ,<br />ЧТОБ НЕ ПОТЕРЯТЬ
        </div>
        <div
          style={{
            fontFamily: scriptFont,
            fontSize: 100,
            color: CYAN,
            transform: "rotate(-2deg)",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.05,
          }}
        >
          какая рутина бесит больше?
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 52, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>
          пиши в комменты ↓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
