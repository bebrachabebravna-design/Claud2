import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bebasFont, BLUE, CYAN, scriptFont, WHITE, YELLOW } from "./fonts";
import { Grain } from "./fx";

/**
 * Direction pilot (~13s) built to the new brief:
 *  - No burned-in subtitles: those are added natively in Instagram. The only
 *    type here is the depth keyword BEHIND the speaker, and scene labels.
 *  - Inserts vary in colour and style rather than all being the same blue.
 *  - Glass panels.
 *  - The talking frame moves.
 *  - Real product footage (the agent screen recording) is the insert that lands
 *    in the 8–18s drop zone the retention graph exposed.
 */
const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);
const SRC = "src4.mp4";
const CUT = "cut4-hook.webm";
const AGENT = "agent-demo.mp4";

// ---- 1. HOOK: text behind the matted speaker, moving frame ----
const KEYS: { from: number; to: number; text: string; color: string; top: string }[] = [
  { from: 0.0, to: 2.0, text: "ПОЧТИ\nВЫГНАЛ", color: CYAN, top: "18%" },
  { from: 2.0, to: 4.6, text: "ПОЗВОНИЛ\nСАМ", color: YELLOW, top: "20%" },
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // One slow push shared by room and cut-out, so the matte stays aligned.
  const push = interpolate(frame, [0, sec(4.6)], [1.0, 1.06]);
  const tx = Math.sin(frame / 40) * 12;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E1A", overflow: "hidden" }}>
      {/* room, dimmed, as the ground */}
      <AbsoluteFill style={{ transform: `scale(${push}) translateX(${tx}px)` }}>
        <OffthreadVideo
          src={staticFile(SRC)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.85) blur(2px)" }}
        />
      </AbsoluteFill>
      {/* colour wash for depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 70% 30%, ${BLUE}55, transparent 55%), radial-gradient(circle at 20% 80%, ${CYAN}33, transparent 50%)`,
        }}
      />
      {/* keyword BEHIND him */}
      {KEYS.map((k) => {
        const d = sec(k.to - k.from);
        return (
          <Sequence key={k.from} from={sec(k.from)} durationInFrames={d} layout="none">
            <BehindWord text={k.text} color={k.color} top={k.top} durationInFrames={d} />
          </Sequence>
        );
      })}
      {/* the speaker, matted, on top — same push keeps him aligned */}
      <AbsoluteFill style={{ transform: `scale(${push}) translateX(${tx}px)` }}>
        <OffthreadVideo
          src={staticFile(CUT)}
          transparent
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}
        />
      </AbsoluteFill>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

const BehindWord: React.FC<{ text: string; color: string; top: string; durationInFrames: number }> = ({
  text,
  color,
  top,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const drift = interpolate(frame, [0, durationInFrames], [30, -30]);
  return (
    <AbsoluteFill style={{ alignItems: "center", top, opacity: out }}>
      <div
        style={{
          fontFamily: bebasFont,
          fontSize: 260,
          lineHeight: 0.82,
          letterSpacing: 3,
          color,
          textAlign: "center",
          whiteSpace: "pre-line",
          transform: `translateY(${drift}px) scale(${interpolate(e, [0, 1], [0.8, 1])})`,
          opacity: interpolate(e, [0, 1], [0, 0.92]),
          textShadow: `0 0 60px ${color}66`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---- 2. VARIED INSERT: warm glass card (different colour/style) ----
const InsertWarm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A0E22", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${40 + Math.sin(frame / 30) * 8}% 35%, #7A2EFF 0%, transparent 55%), radial-gradient(circle at 75% 75%, #FF3D9A55 0%, transparent 50%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontFamily: scriptFont, fontSize: 74, color: YELLOW, opacity: e }}>дистрибьютор</div>
        <div
          style={{
            display: "flex",
            gap: 18,
            padding: "34px 60px",
            borderRadius: 34,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderTop: "3px solid #FF3D9A",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            alignItems: "baseline",
            transform: `scale(${interpolate(e, [0, 1], [0.85, 1])})`,
          }}
        >
          <span style={{ fontFamily: bebasFont, fontSize: 300, color: "#FF7AC8", lineHeight: 0.8 }}>24</span>
          <span style={{ fontFamily: bebasFont, fontSize: 120, color: WHITE, lineHeight: 0.8 }}>МЕНЕДЖЕРА</span>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

// ---- 3. REAL PRODUCT: agent screen recording in a browser card ----
const ProductDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  // Ken Burns on the recording so a static UI clip still feels alive.
  const kb = interpolate(frame, [0, 150], [1.02, 1.12]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04121A", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${CYAN}33 0%, transparent 55%), radial-gradient(circle at 20% 85%, ${BLUE}55 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div style={{ textAlign: "center", opacity: e }}>
          <div style={{ fontFamily: scriptFont, fontSize: 70, color: YELLOW }}>а вот как это</div>
          <div style={{ fontFamily: bebasFont, fontSize: 130, color: WHITE, lineHeight: 0.85, letterSpacing: 2 }}>
            РАБОТАЕТ ВЖИВУЮ
          </div>
        </div>
        {/* browser card */}
        <div
          style={{
            width: 940,
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${CYAN}22`,
            transform: `translateY(${(1 - e) * 60}px) scale(${interpolate(e, [0, 1], [0.9, 1])})`,
            background: "#0E1622",
          }}
        >
          <div style={{ height: 54, background: "#1A2332", display: "flex", alignItems: "center", gap: 12, padding: "0 24px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />
            ))}
            <div style={{ marginLeft: 16, height: 26, flex: 1, borderRadius: 8, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <OffthreadVideo
              src={staticFile(AGENT)}
              muted
              style={{ width: "100%", display: "block", transform: `scale(${kb})`, transformOrigin: "50% 30%" }}
            />
          </div>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

export const ReelPilot: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#04121A" }}>
      <Audio />
      <Sequence from={0} durationInFrames={sec(4.6)}>
        <Hook />
      </Sequence>
      <Sequence from={sec(4.6)} durationInFrames={sec(2.8)}>
        <InsertWarm />
      </Sequence>
      <Sequence from={sec(7.4)} durationInFrames={sec(5.6)}>
        <ProductDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

// Voice from the take across the whole pilot.
import { Audio as RemotionAudio } from "@remotion/media";
const Audio: React.FC = () => <RemotionAudio src={staticFile(SRC)} />;

export const PILOT_FRAMES = sec(13);
