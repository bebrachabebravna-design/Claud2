import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, impactFont, INK, scriptFont, YELLOW } from "./fonts";
import { IconArrowDown, IconChat, IconFolder, IconMail, IconSearch } from "./Icons";

/** Slow drifting mesh behind the full-screen scenes so nothing is ever static. */
const LiveBackdrop: React.FC<{ tint?: string }> = ({ tint = "#1B0F3A" }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 5;
  const drift2 = Math.cos(frame / 55) * 6;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift}% ${28 + drift2}%, ${tint} 0%, rgba(0,0,0,0) 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${28 - drift2}% ${76 - drift}%, rgba(255,226,74,0.16) 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      {/* Grid that slides slowly upward — reads as depth without pulling focus. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${-frame * 0.9}px`,
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, #000 30%, transparent 78%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Scene 1 — where a document actually lives.
 *
 * Three labelled cards fan out and keep floating on separate sine phases while
 * a magnifier sweeps between them without settling. The point of the shot is
 * that the search never lands, so nothing in it is allowed to come to rest.
 */
export const SceneScatter: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cards = [
    { label: "ПАПКИ", Icon: IconFolder, x: -250, y: -170, rot: -11 },
    { label: "ЧАТ", Icon: IconChat, x: 240, y: 30, rot: 9 },
    { label: "ПОЧТА", Icon: IconMail, x: -170, y: 250, rot: -6 },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <LiveBackdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {cards.map((c, i) => {
          const s = spring({
            frame: frame - i * 8,
            fps,
            config: { damping: 12, stiffness: 170, mass: 0.7 },
          });
          const float = Math.sin((frame + i * 30) / 22) * 16;
          const wobble = Math.sin((frame + i * 20) / 30) * 2.5;
          return (
            <div
              key={c.label}
              style={{
                position: "absolute",
                transform: `translate(${c.x * s}px, ${c.y * s + float}px) rotate(${c.rot + wobble}deg) scale(${s})`,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "3px solid rgba(255,255,255,0.22)",
                borderRadius: 34,
                padding: "34px 44px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 26px 70px rgba(0,0,0,0.6)",
              }}
            >
              <c.Icon size={72} />
              <div
                style={{
                  fontFamily: displayFont,
                  fontWeight: 800,
                  fontSize: 46,
                  letterSpacing: -1,
                  color: "#FFFFFF",
                }}
              >
                {c.label}
              </div>
            </div>
          );
        })}

        {/* Magnifier hunting between the cards and never arriving. */}
        <div
          style={{
            position: "absolute",
            transform: `translate(${Math.sin(frame / 15) * 300}px, ${Math.cos(frame / 11) * 220}px) rotate(${Math.sin(frame / 15) * 16}deg)`,
            filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.7))",
          }}
        >
          <IconSearch size={110} color={YELLOW} strokeWidth={7} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 2 — the client waiting while someone digs.
 *
 * A live timer plus a bar that fills toward a red zone. The seconds are what
 * sell the line, so they run visibly rather than sitting as a static number.
 */
export const SceneWaiting: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 200 } });

  const elapsed = (frame / fps) * 4.5;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");
  const fill = Math.min(frame / durationInFrames, 1);
  const pulse = 1 + Math.sin(frame / 5) * 0.02;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <LiveBackdrop tint="#3A0F14" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 46,
          transform: `scale(${enter})`,
        }}
      >
        <div
          style={{
            fontFamily: scriptFont,
            fontSize: 108,
            color: YELLOW,
            transform: "rotate(-3deg)",
          }}
        >
          клиент ждёт
        </div>

        <div
          style={{
            fontFamily: impactFont,
            fontSize: 300,
            lineHeight: 1,
            letterSpacing: 2,
            color: "#FF5A5A",
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${pulse})`,
            textShadow: "0 0 70px rgba(255,60,60,0.6)",
          }}
        >
          {mm}:{ss}
        </div>

        <div
          style={{
            width: 720,
            height: 26,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fill * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #FFE24A 0%, #FF5A5A 100%)",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.72)",
            textTransform: "uppercase",
          }}
        >
          сделка остывает
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Scene 3 — the payoff number.
 *
 * Hours per person per day counted up on an eased curve, then restated as the
 * yearly figure. Counting rather than cutting to the final number is what makes
 * the size of it register.
 */
export const SceneLoss: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 200 } });

  const t = interpolate(frame, [6, durationInFrames * 0.62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const hours = (t * 2).toFixed(1).replace(".", ",");

  const bars = [0.28, 0.46, 0.62, 0.79, 1];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <LiveBackdrop tint="#0F2B3A" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          transform: `scale(${enter})`,
        }}
      >
        {/* Bars growing under the number, so the frame has motion of its own. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 230 }}>
          {bars.map((h, i) => {
            const g = spring({
              frame: frame - 8 - i * 5,
              fps,
              config: { damping: 14, stiffness: 150 },
            });
            return (
              <div
                key={i}
                style={{
                  width: 74,
                  height: h * 230 * g,
                  borderRadius: 14,
                  background:
                    i === bars.length - 1
                      ? "linear-gradient(180deg, #FFE24A, #FFA23A)"
                      : "rgba(255,255,255,0.18)",
                  boxShadow:
                    i === bars.length - 1
                      ? "0 0 50px rgba(255,226,74,0.5)"
                      : "none",
                }}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span
            style={{
              fontFamily: impactFont,
              fontSize: 300,
              lineHeight: 1,
              letterSpacing: 2,
              fontVariantNumeric: "tabular-nums",
              color: YELLOW,
              textShadow: "0 0 80px rgba(255,226,74,0.45)",
            }}
          >
            {hours}
          </span>
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: 92,
              letterSpacing: -3,
              color: "#FFFFFF",
            }}
          >
            ЧАСА
          </span>
        </div>

        <div
          style={{
            fontFamily: scriptFont,
            fontSize: 96,
            color: "rgba(255,255,255,0.9)",
            transform: "rotate(-2deg)",
          }}
        >
          в день на каждого
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Closing card. Full-screen so the last thing on the timeline is the ask, not a
 * frame of someone waiting for the clip to end.
 */
export const SceneCta: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 190 } });
  const bob = Math.sin(frame / 8) * 10;
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <LiveBackdrop tint="#2A1050" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          transform: `scale(${enter})`,
        }}
      >
        <div style={{ display: "flex", gap: 22 }}>
          {[0, 1, 2].map((i) => {
            const s = spring({
              frame: frame - 6 - i * 6,
              fps,
              config: { damping: 11, stiffness: 210 },
            });
            const lit = i < 2;
            return (
              <div
                key={i}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 36,
                  transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-14, 0])}deg)`,
                  background: lit ? YELLOW : "rgba(255,255,255,0.08)",
                  border: lit ? "none" : "4px solid rgba(255,255,255,0.3)",
                  color: lit ? INK : "rgba(255,255,255,0.55)",
                  fontFamily: impactFont,
                  fontSize: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: lit ? "0 20px 60px rgba(255,226,74,0.45)" : "none",
                }}
              >
                {lit ? "ДА" : "?"}
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: scriptFont,
            fontSize: 116,
            lineHeight: 1.05,
            color: YELLOW,
            textAlign: "center",
            maxWidth: 880,
            transform: `translateY(${bob}px) rotate(-2deg)`,
            marginTop: 26,
          }}
        >
          сколько «да» у тебя?
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: 62,
            letterSpacing: -1,
            color: "#FFFFFF",
            textTransform: "uppercase",
          }}
        >
          пиши в комменты
        </div>
        <div style={{ transform: `translateY(${bob * 0.6}px)` }}>
          <IconArrowDown size={72} color={YELLOW} strokeWidth={7} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
