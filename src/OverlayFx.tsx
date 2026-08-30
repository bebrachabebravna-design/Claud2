import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bebasFont, CYAN, scriptFont, WHITE, YELLOW } from "./fonts";
import {
  IconAlert,
  IconCheck,
  IconChat,
  IconDoc,
  IconSearch,
} from "./Icons";

/**
 * Graphics that pop OVER the speaker, on the exact word they illustrate.
 *
 * These exist because full-screen cutaways alone left long stretches of plain
 * talking head, which is where the edit felt empty. Keeping him in frame and
 * throwing an object onto the word instead gives the eye something to catch
 * every couple of seconds without ever cutting away from him.
 *
 * They all live in the upper half — the captions own the lower third.
 */

const RED = "#FF4D63";

const useEnter = (delay = 0, cfg = { damping: 12, stiffness: 220, mass: 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: cfg });
};

/** Fades the whole pop out at the end of its window. */
const useOut = (durationInFrames: number, frames = 5) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, color = CYAN, style, delay = 0 }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 30px",
        borderRadius: 22,
        background: "rgba(8,16,34,0.62)",
        backdropFilter: "blur(14px)",
        border: `2px solid ${color}`,
        boxShadow: `0 0 34px ${color}55, 0 14px 40px rgba(0,0,0,0.45)`,
        fontFamily: bebasFont,
        fontSize: 62,
        letterSpacing: 1,
        color: WHITE,
        transform: `scale(${interpolate(e, [0, 1], [0.5, 1])}) rotate(${(1 - e) * -6}deg)`,
        opacity: e,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** ₽ notes falling — «слить бюджет». */
const Money: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const t = ((frame * 2.4 + i * 17) % 110) / 110;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + random(`m${i}`) * 840,
              top: interpolate(t, [0, 1], [180, 1080]),
              fontFamily: bebasFont,
              fontSize: 90 + random(`s${i}`) * 50,
              color: YELLOW,
              opacity: Math.sin(t * Math.PI) * 0.9,
              transform: `rotate(${interpolate(t, [0, 1], [0, 50])}deg)`,
              textShadow: `0 0 26px ${YELLOW}88`,
            }}
          >
            ₽
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Digits racing — «начни с цифры». */
const Digits: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const val = Math.round(interpolate(frame, [0, 22], [0, 238000], { extrapolateRight: "clamp" }));
  const e = useEnter();
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Chip color={YELLOW} style={{ top: "17%", right: 70, fontSize: 76 }}>
        {val.toLocaleString("ru-RU").replace(/,/g, " ")} ₽
      </Chip>
      <div style={{ position: "absolute", top: "27%", right: 96, opacity: e }}>
        <div style={{ fontFamily: scriptFont, fontSize: 60, color: YELLOW }}>сначала посчитай</div>
      </div>
    </AbsoluteFill>
  );
};

/** «Нам нужен ИИ» — hype bubbles, the thing being mocked. */
const Hype: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const words = ["ИИ!", "НЕЙРОСЕТЬ!", "АВТОМАТИЗАЦИЯ!"];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {words.map((w, i) => (
        <Chip
          key={w}
          color={i === 1 ? YELLOW : CYAN}
          delay={i * 7}
          style={{
            top: `${13 + i * 9}%`,
            [i % 2 ? "right" : "left"]: 60 + i * 20,
            fontSize: 54,
          }}
        >
          {w}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};

/** Magnifier sweeping — «где теряешь». */
const Search: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          top: "19%",
          left: interpolate(frame, [0, durationInFrames], [120, 780]),
          transform: `scale(${e})`,
          filter: `drop-shadow(0 0 22px ${CYAN})`,
        }}
      >
        <IconSearch size={165} color={WHITE} strokeWidth={3} />
      </div>
    </AbsoluteFill>
  );
};

/** ChatGPT crossed out — the hard "don't". */
const GptBan: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const e = useEnter();
  const line = useEnter(6, { damping: 14, stiffness: 200, mass: 0.5 });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: "16%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 40px",
              borderRadius: 24,
              background: "rgba(8,16,34,0.72)",
              border: `2px solid ${RED}`,
              fontFamily: bebasFont,
              fontSize: 84,
              color: WHITE,
              letterSpacing: 1,
            }}
          >
            <IconChat size={70} color={RED} strokeWidth={3} />
            CHATGPT
          </div>
          {/* Strike-through drawing across the badge */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "-4%",
              width: `${108 * line}%`,
              height: 12,
              background: RED,
              borderRadius: 8,
              boxShadow: `0 0 24px ${RED}`,
              transform: "rotate(-8deg)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Documents flying out of frame — «уходит за рубеж». */
const FlyOut: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const t = ((frame * 2.1 + i * 14) % 96) / 96;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: interpolate(t, [0, 1], [260, 1180]),
              top: 200 + random(`fy${i}`) * 620 - t * 90,
              opacity: Math.sin(t * Math.PI),
              transform: `rotate(${interpolate(t, [0, 1], [0, 55])}deg)`,
              filter: `drop-shadow(0 0 16px ${RED}88)`,
            }}
          >
            <IconDoc size={78} color="#FFC2CA" strokeWidth={3} />
          </div>
        );
      })}
      <Chip color={RED} style={{ top: "14%", left: 70, fontSize: 56 }}>
        НАРУЖУ →
      </Chip>
    </AbsoluteFill>
  );
};

/** 152-ФЗ stamp slamming in. */
const Law: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const e = useEnter(0, { damping: 8, stiffness: 260, mass: 0.7 });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: 70,
          transform: `scale(${interpolate(e, [0, 1], [2.2, 1])}) rotate(-11deg)`,
          padding: "18px 38px",
          border: `6px solid ${RED}`,
          borderRadius: 16,
          fontFamily: bebasFont,
          fontSize: 92,
          color: RED,
          letterSpacing: 2,
          background: "rgba(255,255,255,0.06)",
          boxShadow: `0 0 40px ${RED}55`,
        }}
      >
        152-ФЗ
      </div>
    </AbsoluteFill>
  );
};

/** «Выдумает» — alert flashing. */
const Invent: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  const blink = 0.55 + Math.abs(Math.sin(frame / 4)) * 0.45;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: blink,
          transform: `scale(${e})`,
          filter: `drop-shadow(0 0 30px ${RED})`,
        }}
      >
        <IconAlert size={190} color={RED} strokeWidth={3} />
      </div>
    </AbsoluteFill>
  );
};

/** Three routine tasks ticking off, one per phrase. */
const Routine: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const items = ["ПОИСК", "РАЗБОР", "ОТВЕТЫ"];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {items.map((t, i) => (
        <Chip
          key={t}
          color={CYAN}
          delay={i * 16}
          style={{ top: `${13 + i * 8.5}%`, left: 70, fontSize: 58 }}
        >
          <IconCheck size={50} color={CYAN} strokeWidth={4} />
          {t}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};

export const POP_EL: Record<string, (d: number) => React.ReactNode> = {
  money: (d) => <Money durationInFrames={d} />,
  digits: (d) => <Digits durationInFrames={d} />,
  hype: (d) => <Hype durationInFrames={d} />,
  search: (d) => <Search durationInFrames={d} />,
  gptban: (d) => <GptBan durationInFrames={d} />,
  flyout: (d) => <FlyOut durationInFrames={d} />,
  law: (d) => <Law durationInFrames={d} />,
  invent: (d) => <Invent durationInFrames={d} />,
  routine: (d) => <Routine durationInFrames={d} />,
};

/** Persistent corner badge for the running point. */
export const PointBadge: React.FC<{ n: number; durationInFrames: number }> = ({
  n,
  durationInFrames,
}) => {
  const e = useEnter();
  const out = useOut(durationInFrames, 7);
  return (
    <div
      style={{
        position: "absolute",
        top: 96,
        left: 62,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 26px 12px 14px",
        borderRadius: 999,
        background: "rgba(8,16,34,0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.22)",
        opacity: e * out,
        transform: `translateX(${(1 - e) * -50}px)`,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: CYAN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: bebasFont,
          fontSize: 44,
          color: "#062033",
        }}
      >
        {n}
      </div>
      <div style={{ fontFamily: bebasFont, fontSize: 40, color: WHITE, letterSpacing: 2 }}>
        ПУНКТ
      </div>
    </div>
  );
};
