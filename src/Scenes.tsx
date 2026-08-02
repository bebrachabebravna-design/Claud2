import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUE, CYAN, displayFont, INK, NAVY, scriptFont, WHITE } from "./fonts";
import {
  IconAlert,
  IconArrowDown,
  IconArrowRight,
  IconChat,
  IconCheck,
  IconClock,
  IconDoc,
  IconFolder,
  IconMail,
  IconSearch,
  IconSliders,
} from "./Icons";

/** Fade the whole scene out over its last frames. */
const useOut = (durationInFrames: number, frames = 7) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Ground for every full-screen scene: two slow-drifting light pools over the
 * brand navy, plus a grid that creeps upward. Nothing here is ever still, which
 * is what keeps a static graphic from reading as a slide.
 */
const Backdrop: React.FC<{ tint?: string; intensity?: number }> = ({
  tint = BLUE,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 42) * 6;
  const dy = Math.cos(frame / 57) * 7;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundColor: NAVY, opacity: 0.9 }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + dx}% ${30 + dy}%, ${tint} 0%, rgba(0,0,0,0) ${60 * intensity}%)`,
          opacity: 0.55 * intensity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${26 - dy}% ${74 - dx}%, ${CYAN} 0%, rgba(0,0,0,0) 52%)`,
          opacity: 0.18 * intensity,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(69,208,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(69,208,255,0.07) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${-frame * 0.8}px`,
          maskImage:
            "radial-gradient(ellipse 72% 58% at 50% 45%, #000 28%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Shared kicker/caption typography inside scenes. */
const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "rgba(255,255,255,0.66)",
}) => (
  <div
    style={{
      fontFamily: displayFont,
      fontWeight: 700,
      fontSize: 40,
      letterSpacing: 3,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

const Script: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 96,
  color = CYAN,
}) => (
  <div
    style={{
      fontFamily: scriptFont,
      fontSize: size,
      lineHeight: 1,
      color,
      textAlign: "center",
      maxWidth: 900,
    }}
  >
    {children}
  </div>
);

/**
 * Scene 1 — the headline loss.
 *
 * The figure counts up rather than cutting straight to five million: watching
 * the number climb is what makes its size land, and it fills the beat where the
 * voice is still saying it.
 */
export const SceneLoss: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });

  const t = interpolate(frame, [4, durationInFrames * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const value = Math.round(t * 5_000_000);
  const shown = value.toLocaleString("ru-RU").replace(/,/g, " ");
  const glow = 0.35 + Math.sin(frame / 9) * 0.12;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          transform: `scale(${enter})`,
        }}
      >
        <Kicker>компания из 30 человек</Kicker>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 210,
            lineHeight: 1,
            letterSpacing: 1,
            color: WHITE,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 ${70 * glow}px rgba(69,208,255,${glow})`,
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <span style={{ color: CYAN }}>−</span>
          {shown}
          <span style={{ fontSize: 120, color: CYAN }}>₽</span>
        </div>
        <Script size={92}>в год</Script>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 2 — the 42% share.
 *
 * A ring that draws itself to 42%. A proportion is easier to feel as a filled
 * arc than as digits, and the sweep gives the beat its own motion.
 */
export const ScenePercent: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });

  const R = 190;
  const C = 2 * Math.PI * R;
  const t = interpolate(frame, [5, durationInFrames * 0.6], [0, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pct = Math.round(t * 100);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          transform: `scale(${enter})`,
        }}
      >
        <div style={{ position: "relative", width: 440, height: 440 }}>
          <svg width={440} height={440} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={220} cy={220} r={R} stroke="rgba(255,255,255,0.12)" strokeWidth={26} fill="none" />
            <circle
              cx={220}
              cy={220}
              r={R}
              stroke={CYAN}
              strokeWidth={26}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - t)}
              style={{ filter: "drop-shadow(0 0 26px rgba(69,208,255,0.65))" }}
            />
          </svg>
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 168,
              color: WHITE,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pct}%
          </AbsoluteFill>
        </div>
        <Kicker>ищут файл дольше,</Kicker>
        <Script size={86}>чем работают с ним</Script>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 3 — hours per day compounding into months per year.
 *
 * Twelve month blocks light up to three: the yearly figure is abstract, the
 * filled calendar is not.
 */
export const SceneHours: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          transform: `scale(${enter})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <IconClock size={92} color={CYAN} strokeWidth={4} />
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 168,
              lineHeight: 1,
              color: WHITE,
            }}
          >
            1,5–2 <span style={{ fontSize: 96, color: CYAN }}>Ч/ДЕНЬ</span>
          </div>
        </div>

        <IconArrowDown size={64} color="rgba(255,255,255,0.45)" />

        {/* Twelve months, three of them consumed. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 16,
            width: 720,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const lit = i < 3;
            const s = spring({
              frame: frame - 10 - i * 3,
              fps,
              config: { damping: 13, stiffness: 200 },
            });
            return (
              <div
                key={i}
                style={{
                  height: 92,
                  borderRadius: 18,
                  transform: `scale(${s})`,
                  background: lit ? CYAN : "rgba(255,255,255,0.08)",
                  border: lit ? "none" : "3px solid rgba(255,255,255,0.16)",
                  boxShadow: lit ? "0 0 40px rgba(69,208,255,0.5)" : "none",
                }}
              />
            );
          })}
        </div>

        <Script size={92}>почти 3 месяца в году</Script>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 4 — where documents actually live.
 *
 * Three labelled cards float on separate phases while a magnifier sweeps
 * between them and never settles. The line is about search that does not land,
 * so nothing in the shot comes to rest.
 */
export const SceneScatter: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);

  const cards = [
    { label: "ПАПКИ", Icon: IconFolder, x: -250, y: -190, rot: -10 },
    { label: "ЧАТЫ", Icon: IconChat, x: 245, y: -20, rot: 8 },
    { label: "ПОЧТА", Icon: IconMail, x: -160, y: 235, rot: -5 },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {cards.map((c, i) => {
          const s = spring({
            frame: frame - i * 7,
            fps,
            config: { damping: 12, stiffness: 175, mass: 0.7 },
          });
          const float = Math.sin((frame + i * 30) / 24) * 15;
          const wobble = Math.sin((frame + i * 20) / 32) * 2.2;
          return (
            <div
              key={c.label}
              style={{
                position: "absolute",
                transform: `translate(${c.x * s}px, ${c.y * s + float}px) rotate(${c.rot + wobble}deg) scale(${s})`,
                background: "rgba(69,208,255,0.07)",
                border: "3px solid rgba(69,208,255,0.3)",
                borderRadius: 32,
                padding: "30px 42px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
              }}
            >
              <c.Icon size={66} color={WHITE} />
              <div
                style={{
                  fontFamily: displayFont,
                  fontWeight: 800,
                  fontSize: 44,
                  letterSpacing: -1,
                  color: WHITE,
                }}
              >
                {c.label}
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            transform: `translate(${Math.sin(frame / 16) * 300}px, ${Math.cos(frame / 12) * 215}px) rotate(${Math.sin(frame / 16) * 14}deg)`,
            filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.7))",
          }}
        >
          <IconSearch size={112} color={CYAN} strokeWidth={6} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 5 — the cost of not finding it.
 *
 * Urgency comes from a darker ground, a pulsing outline and the figure snapping
 * in — not from a warning colour outside the palette.
 */
export const ScenePenalty: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 11, stiffness: 220 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.025;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} intensity={0.5} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          transform: `scale(${enter})`,
        }}
      >
        <div style={{ transform: `scale(${pulse})` }}>
          <IconAlert size={120} color={CYAN} strokeWidth={4} />
        </div>
        <Kicker>сорванная сделка</Kicker>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 1,
            color: WHITE,
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            transform: `scale(${pulse})`,
            textShadow: "0 0 60px rgba(69,208,255,0.35)",
          }}
        >
          ИЛИ ШТРАФ
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 230,
            lineHeight: 1,
            color: CYAN,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 70px rgba(69,208,255,0.55)",
          }}
        >
          ОТ 50 000 ₽
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 6 — the agent answering.
 *
 * A question types itself in, then the answer card snaps up with a source
 * reference and a running stopwatch. Demonstrating the five seconds is more
 * convincing than stating them.
 */
export const SceneAnswer: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);

  const question = "Какая отсрочка у клиента по договору?";
  const typed = question.slice(
    0,
    Math.floor(
      interpolate(frame, [0, durationInFrames * 0.4], [0, question.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const answerIn = spring({
    frame: frame - durationInFrames * 0.45,
    fps,
    config: { damping: 13, stiffness: 200 },
  });
  const secs = Math.min(
    5,
    interpolate(frame, [durationInFrames * 0.45, durationInFrames * 0.8], [0, 5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          paddingLeft: 70,
          paddingRight: 70,
        }}
      >
        {/* Question bubble */}
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: 780,
            background: "rgba(255,255,255,0.1)",
            border: "3px solid rgba(255,255,255,0.2)",
            borderRadius: "28px 28px 8px 28px",
            padding: "24px 32px",
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.25,
            color: WHITE,
          }}
        >
          {typed}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
        </div>

        {/* Answer card */}
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: 820,
            opacity: answerIn,
            transform: `translateY(${interpolate(answerIn, [0, 1], [40, 0])}px) scale(${interpolate(answerIn, [0, 1], [0.9, 1])})`,
            background: `linear-gradient(135deg, rgba(30,95,255,0.3), rgba(69,208,255,0.16))`,
            border: `3px solid ${CYAN}`,
            borderRadius: "28px 28px 28px 8px",
            padding: "28px 34px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 0 60px rgba(69,208,255,0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <IconCheck size={52} color={CYAN} />
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 48,
                color: WHITE,
              }}
            >
              Отсрочка 30 дней
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 36,
              color: CYAN,
            }}
          >
            <IconDoc size={40} color={CYAN} />
            договор №14, пункт 4.2
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
          <IconBoltInline />
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 120,
              lineHeight: 1,
              color: WHITE,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {secs.toFixed(1).replace(".", ",")} СЕК
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const IconBoltInline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ transform: `scale(${1 + Math.sin(frame / 7) * 0.06})` }}>
      <IconArrowRight size={64} color={CYAN} />
    </div>
  );
};

/**
 * Scene 7 — the case figure.
 *
 * Before and after side by side, the old number struck through as the new one
 * lands. The contrast is the whole argument, so it is shown rather than
 * narrated.
 */
export const SceneCase: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames);
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });
  const swap = spring({
    frame: frame - durationInFrames * 0.35,
    fps,
    config: { damping: 13, stiffness: 200 },
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          transform: `scale(${enter})`,
        }}
      >
        <Kicker>ответ клиенту</Kicker>

        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div style={{ position: "relative", opacity: interpolate(swap, [0, 1], [1, 0.45]) }}>
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 150,
                lineHeight: 1,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              11 МИН
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "52%",
                height: 8,
                background: CYAN,
                borderRadius: 4,
                transform: `scaleX(${swap})`,
                transformOrigin: "left",
              }}
            />
          </div>

          <div style={{ opacity: swap, transform: `translateX(${interpolate(swap, [0, 1], [-20, 0])}px)` }}>
            <IconArrowRight size={70} color={CYAN} />
          </div>

          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 170,
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: CYAN,
              opacity: swap,
              transform: `scale(${interpolate(swap, [0, 1], [0.7, 1])})`,
              textShadow: "0 0 70px rgba(69,208,255,0.6)",
            }}
          >
            9 СЕК
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "18px 40px",
            borderRadius: 24,
            border: `3px solid ${CYAN}`,
            background: "rgba(69,208,255,0.1)",
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 96,
            color: WHITE,
            opacity: swap,
          }}
        >
          2,8 МЛН ₽ В ГОД
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Closing card — the site and what to do there.
 *
 * Full-screen so the clip ends on the ask rather than on a held frame of
 * someone waiting for it to finish.
 */
export const SceneCta: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = useOut(durationInFrames, 8);
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 190 } });
  const bob = Math.sin(frame / 9) * 9;

  // Three sliders settling at different points, echoing the calculator.
  const sliders = [0.35, 0.62, 0.48];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={BLUE} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          transform: `scale(${enter})`,
        }}
      >
        <IconSliders size={96} color={CYAN} strokeWidth={4} />

        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 1,
            color: WHITE,
            letterSpacing: 1,
          }}
        >
          NEIRODOCS.RU
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 700 }}>
          {sliders.map((target, i) => {
            const s = spring({
              frame: frame - 10 - i * 6,
              fps,
              config: { damping: 16, stiffness: 130 },
            });
            const live = target + Math.sin((frame + i * 25) / 30) * 0.04;
            return (
              <div
                key={i}
                style={{
                  height: 20,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.12)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${live * 100 * s}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${BLUE}, ${CYAN})`,
                    boxShadow: "0 0 24px rgba(69,208,255,0.6)",
                  }}
                />
              </div>
            );
          })}
        </div>

        <Script size={104}>посмотри, сколько теряешь</Script>

        <div style={{ transform: `translateY(${bob}px)`, marginTop: 6 }}>
          <IconArrowDown size={68} color={CYAN} strokeWidth={6} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
