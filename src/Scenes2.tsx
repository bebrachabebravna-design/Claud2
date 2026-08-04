import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUE, CYAN, displayFont, INK, NAVY, scriptFont, WHITE } from "./fonts";
import { IconCheck, IconClock, IconDoc } from "./Icons";

const useOut = (durationInFrames: number, frames = 7) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** Drifting brand-navy ground shared by every full-screen scene. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 42) * 6;
  const dy = Math.cos(frame / 57) * 7;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundColor: NAVY, opacity: 0.92 }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + dx}% ${32 + dy}%, ${BLUE} 0%, rgba(0,0,0,0) 60%)`,
          opacity: 0.5,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(69,208,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(69,208,255,0.07) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${-frame * 0.8}px`,
          maskImage: "radial-gradient(ellipse 72% 58% at 50% 45%, #000 28%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
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
 * Tip 1 — a 20-page contract collapsing into a three-line summary.
 *
 * The tall stack of pages on the left shrinks as a short bullet list snaps in on
 * the right, so the "получасовое чтение → минута" claim is shown, not stated.
 */
export const SceneContract: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const collapse = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 120 } });
  const pages = 7;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
          {/* Shrinking stack */}
          <div style={{ position: "relative", width: 220, height: 420 }}>
            {Array.from({ length: pages }).map((_, i) => {
              const gone = interpolate(collapse, [0, 1], [1, 0]);
              const y = i * 26 * gone;
              const op = i === 0 ? 1 : interpolate(collapse, [0, 1], [1, 0.12]);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: i * 4 * gone,
                    top: 420 - 300 - y,
                    width: 210,
                    height: 290,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
                    opacity: op,
                    display: i === 0 ? "flex" : "none",
                    flexDirection: "column",
                    gap: 14,
                    padding: 26,
                  }}
                >
                  {[...Array(6)].map((_, k) => (
                    <div key={k} style={{ height: 10, borderRadius: 5, background: "rgba(10,20,40,0.18)", width: `${90 - k * 8}%` }} />
                  ))}
                </div>
              );
            })}
            <div
              style={{
                position: "absolute",
                top: -18,
                left: 0,
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: 44,
                color: WHITE,
                opacity: interpolate(collapse, [0, 1], [1, 0.3]),
              }}
            >
              20 стр.
            </div>
          </div>

          <div style={{ fontSize: 90, color: CYAN, opacity: collapse }}>→</div>

          {/* Summary list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 340 }}>
            {["Сроки", "Штрафы", "Расторжение"].map((t, i) => {
              const s = spring({ frame: frame - 22 - i * 6, fps, config: { damping: 13, stiffness: 200 } });
              return (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
                    opacity: s,
                    background: "rgba(69,208,255,0.1)",
                    border: `3px solid ${CYAN}`,
                    borderRadius: 18,
                    padding: "16px 22px",
                  }}
                >
                  <IconCheck size={40} color={CYAN} />
                  <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 40, color: WHITE }}>{t}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 60 }}>
          <div style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 64, color: WHITE, textAlign: "center" }}>
            30 минут <span style={{ color: CYAN }}>→ 1 минута</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tip 2 — a meeting recording turning into a checklist of tasks.
 *
 * A waveform pulses, then task rows with owner + date snap in beneath it.
 */
export const SceneMeeting: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const bars = 40;
  const tasks = [
    { who: "Иван", what: "договор", date: "до 5-го" },
    { who: "Аня", what: "смета", date: "до 7-го" },
    { who: "Пётр", what: "отчёт", date: "до 10-го" },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50 }}>
        <Kicker>запись встречи</Kicker>
        {/* Waveform */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 130 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.5 + frame / 4)) * 100;
            return <div key={i} style={{ width: 8, height: h, borderRadius: 4, background: i % 3 === 0 ? CYAN : "rgba(69,208,255,0.4)" }} />;
          })}
        </div>
        <div style={{ fontSize: 70, color: CYAN }}>↓</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 620 }}>
          {tasks.map((t, i) => {
            const s = spring({ frame: frame - 20 - i * 7, fps, config: { damping: 13, stiffness: 200 } });
            return (
              <div
                key={t.who}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                  opacity: s,
                  background: "rgba(255,255,255,0.06)",
                  border: "3px solid rgba(69,208,255,0.35)",
                  borderRadius: 18,
                  padding: "18px 24px",
                }}
              >
                <IconCheck size={44} color={CYAN} />
                <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 40, color: WHITE }}>
                  {t.who} — {t.what}
                </span>
                <span style={{ marginLeft: "auto", fontFamily: displayFont, fontWeight: 700, fontSize: 34, color: CYAN }}>{t.date}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tip 3 — a blank template with empty fields filling itself into a finished doc.
 */
export const SceneTemplate: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const fillT = interpolate(frame, [12, durationInFrames * 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const rows = 6;
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, transform: `scale(${enter})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <IconDoc size={64} color={CYAN} />
          <Kicker>шаблон → документ</Kicker>
        </div>
        <div
          style={{
            width: 620,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 22,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ height: 26, width: "55%", borderRadius: 6, background: NAVY }} />
          {Array.from({ length: rows }).map((_, i) => {
            const filled = fillT > (i + 1) / rows;
            const w = [92, 80, 88, 70, 84, 60][i];
            return (
              <div key={i} style={{ position: "relative", height: 18, borderRadius: 5, background: "rgba(10,20,40,0.12)", width: `${w}%` }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${BLUE}, ${CYAN})`,
                    transformOrigin: "left",
                    transform: `scaleX(${filled ? 1 : 0})`,
                    transition: "none",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 60, color: WHITE }}>
          готово <span style={{ color: CYAN }}>за секунды</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Payoff trio — экономия · прибыль · время, three icons snapping in on beat.
 */
export const SceneTrio: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const items = [
    { label: "ЭКОНОМИЯ", Icon: IconCheck },
    { label: "ПРИБЫЛЬ", Icon: IconCheck },
    { label: "ВРЕМЯ", Icon: IconClock },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46 }}>
        {items.map((it, i) => {
          const s = spring({ frame: frame - i * 8, fps, config: { damping: 12, stiffness: 200 } });
          return (
            <div
              key={it.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                transform: `scale(${s})`,
                opacity: s,
              }}
            >
              <it.Icon size={72} color={CYAN} />
              <span style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 96, letterSpacing: -2, color: WHITE }}>
                {it.label}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Closing card — save + comment prompt, full-screen so the clip ends on the ask.
 */
export const SceneOutro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 190 } });
  const bob = Math.sin(frame / 9) * 9;
  const out = useOut(durationInFrames, 8);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, transform: `scale(${enter})` }}>
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
            fontSize: 108,
            color: CYAN,
            transform: `translateY(${bob}px) rotate(-2deg)`,
            textAlign: "center",
            maxWidth: 860,
            lineHeight: 1.05,
          }}
        >
          какая рутина бесит больше?
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 900, fontSize: 54, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>
          пиши в комменты
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
