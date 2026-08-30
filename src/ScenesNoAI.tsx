import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop, Burst, Kicker, useOut } from "./Scenes2";
import { bebasFont, BLUE, CYAN, scriptFont, WHITE, YELLOW } from "./fonts";
import { IconAlert, IconCheck, IconClock, IconDoc, IconSearch } from "./Icons";

/**
 * Scenes for «Куда НЕ надо внедрять ИИ».
 *
 * The exact wording of this take is unknown — there was no transcript, so the
 * structure came from the audio envelope. That makes text-heavy scenes risky:
 * a caption that contradicts what he is saying is worse than no caption. So
 * most of these are carried by numerals and imagery, which stay correct
 * whatever the exact phrasing, and only the CTA scene commits to words.
 *
 * Each scene also takes a `tint`, because the brief asked for inserts that
 * differ in colour rather than all sitting on the same blue.
 */

const useEnter = (delay = 0, cfg = { damping: 16, stiffness: 150, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: cfg });
};

/** Colour wash laid over the shared backdrop, so each insert reads different. */
const Tint: React.FC<{ color: string; strength?: number }> = ({ color, strength = 0.5 }) => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 34) * 8;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${50 + d}% ${38 - d}%, ${color} 0%, transparent 62%)`,
        opacity: strength,
        mixBlendMode: "screen",
      }}
    />
  );
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
      lineHeight: 0.84,
      letterSpacing: 2,
      color,
      textAlign: "center",
      whiteSpace: "pre-line",
      textShadow: `0 0 48px ${glow}88, 0 12px 44px rgba(0,0,0,0.55)`,
    }}
  >
    {children}
  </div>
);

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 20 }) => (
  <AbsoluteFill
    style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * Numbered marker. Deliberately almost wordless — the number is true no matter
 * how he phrases the point, so this can sit on any of the three beats.
 */
export const SceneNumber: React.FC<{
  durationInFrames: number;
  n: string;
  label: string;
  tint: string;
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
}> = ({ durationInFrames, n, label, tint, Icon }) => {
  const out = useOut(durationInFrames);
  const e = useEnter();
  const ring = useEnter(4, { damping: 12, stiffness: 200, mass: 0.6 });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Tint color={tint} />
      <Center gap={16}>
        <div style={{ opacity: e, transform: `scale(${ring})` }}>
          <Icon size={150} color={tint} strokeWidth={3} />
        </div>
        <div style={{ transform: `scale(${interpolate(e, [0, 1], [0.55, 1])})` }}>
          <Big size={380} color={WHITE} glow={tint}>{n}</Big>
        </div>
        <div style={{ opacity: e }}>
          <Kicker>{label}</Kicker>
        </div>
        <Burst x={540} y={860} startAt={5} n={20} />
      </Center>
    </AbsoluteFill>
  );
};

/**
 * The leak beat. Documents fly out of the frame past a warning — this is the
 * one point the script promises ("вторая может стоить штрафа"), so it gets the
 * most literal illustration and the only red in the whole edit.
 */
export const SceneLeak: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop withField={false} />
      <Tint color="#FF3D5A" strength={0.42} />
      {/* Documents escaping to the right — the leak, literally. */}
      {Array.from({ length: 7 }).map((_, i) => {
        const t = ((frame * 1.6 + i * 26) % 150) / 150;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: interpolate(t, [0, 1], [340, 1240]),
              top: 620 + random(`y${i}`) * 520 - t * 120,
              opacity: Math.sin(t * Math.PI) * 0.85,
              transform: `rotate(${interpolate(t, [0, 1], [0, 40 + random(`r${i}`) * 30])}deg)`,
            }}
          >
            <IconDoc size={86} color="#FFB3BE" strokeWidth={3} />
          </div>
        );
      })}
      <Center gap={22}>
        <div style={{ transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})` }}>
          <IconAlert size={230} color="#FF6B7F" strokeWidth={3} />
        </div>
        <div style={{ opacity: e }}>
          <Big size={132} color="#FFFFFF" glow="#FF3D5A">ДАННЫЕ{"\n"}УХОДЯТ</Big>
        </div>
        <div style={{ fontFamily: scriptFont, fontSize: 84, color: YELLOW, opacity: e }}>
          и отвечать тебе
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/** Three-line recap. Short, so it survives whatever he actually said. */
export const SceneSummary: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const out = useOut(durationInFrames);
  const lines = [
    { t: "СНАЧАЛА ЦИФРА", c: CYAN },
    { t: "НЕ ПУБЛИЧНЫЕ СЕТИ", c: "#FF6B7F" },
    { t: "НЕ ЧУДО, А ВРЕМЯ", c: YELLOW },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Tint color={BLUE} strength={0.4} />
      <Center gap={30}>
        {lines.map((l, i) => {
          const e = useEnter(i * 9, { damping: 14, stiffness: 190, mass: 0.6 });
          return (
            <div
              key={l.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: e,
                transform: `translateX(${(1 - e) * -60}px)`,
              }}
            >
              <IconCheck size={72} color={l.c} strokeWidth={4} />
              <div style={{ fontFamily: bebasFont, fontSize: 96, color: l.c, letterSpacing: 1 }}>
                {l.t}
              </div>
            </div>
          );
        })}
      </Center>
    </AbsoluteFill>
  );
};

/** Closing card: the code word, which is the whole point of the video. */
export const SceneCode: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const out = useOut(durationInFrames);
  const e = useEnter();
  const pulse = 1 + Math.sin(frame / 9) * 0.03;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Tint color={CYAN} strength={0.45} />
      {/* Comment bubbles rising — the action we are asking for. */}
      {Array.from({ length: 7 }).map((_, i) => {
        const t = ((frame * 1.1 + i * 34) % 250) / 250;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 110 + random(`c${i}`) * 780,
              top: 1560 - t * 980,
              opacity: (1 - t) * 0.45,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.24)",
                borderRadius: 22,
                width: 130 + random(`w${i}`) * 130,
                height: 46,
              }}
            />
          </div>
        );
      })}
      <Center gap={26}>
        <div style={{ fontFamily: scriptFont, fontSize: 78, color: YELLOW, opacity: e }}>
          напиши в комменты
        </div>
        <div
          style={{
            transform: `scale(${interpolate(e, [0, 1], [0.7, 1]) * pulse})`,
            padding: "26px 76px",
            borderRadius: 34,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(18px)",
            border: `2px solid ${CYAN}`,
            boxShadow: `0 0 60px ${CYAN}55, 0 24px 70px rgba(0,0,0,0.5)`,
          }}
        >
          <Big size={200} color={WHITE} glow={CYAN}>ЧЕК</Big>
        </div>
        <div style={{ opacity: e }}>
          <Kicker>куда внедрять, а куда нет</Kicker>
        </div>
        <Burst x={540} y={900} startAt={8} n={22} />
      </Center>
    </AbsoluteFill>
  );
};

export const SCENE_EL: Record<string, (d: number) => React.ReactNode> = {
  n1: (d) => (
    <SceneNumber durationInFrames={d} n="01" label="сначала цифра" tint={CYAN} Icon={IconSearch} />
  ),
  leak: (d) => <SceneLeak durationInFrames={d} />,
  n3: (d) => (
    <SceneNumber durationInFrames={d} n="03" label="не замена, а время" tint="#B06BFF" Icon={IconClock} />
  ),
  summary: (d) => <SceneSummary durationInFrames={d} />,
  cta: (d) => <SceneCode durationInFrames={d} />,
};
