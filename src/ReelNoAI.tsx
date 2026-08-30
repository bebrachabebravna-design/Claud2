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
import { Audio } from "@remotion/media";
import { SCENE_EL } from "./ScenesNoAI";
import { FlashCut } from "./Overlays";
import { BEHIND, CONTENT_END, FPS, SCENES, SHOTS, TRIM_START } from "./captions-data5";
import { bebasFont, CYAN } from "./fonts";
import { Grain } from "./fx";

/**
 * «Куда НЕ надо внедрять ИИ» — the take is a flat delivery, so the edit has to
 * carry the energy on its own.
 *
 * Three devices do that work:
 *  - The frame never rests. Every short pause in the audio becomes a re-frame,
 *    so the picture changes every 2–4 seconds even mid-sentence.
 *  - The long pauses become full-screen inserts, each in a different colour —
 *    the eye has to re-adapt on every one, which reads as pace.
 *  - The hook runs the matted speaker over depth type, so the opening three
 *    seconds — where most viewers are lost — have real dimension.
 *
 * No burned captions: those are added natively in Instagram.
 */
const SRC = "src5.mp4";
const CUT = "cut5-hook.webm";
const sec = (s: number) => Math.round(s * FPS);
/** Source time → timeline frame. */
const tl = (s: number) => sec(s - TRIM_START);
const HOLD = 10;

export const DURATION_FRAMES = sec(CONTENT_END - TRIM_START);

/** One re-framing of the take. Scale drifts within the shot so it never sits still. */
const Shot: React.FC<{
  from: number;
  to: number;
  scale: number;
  ox: number;
  oy: number;
}> = ({ from, to, scale, ox, oy }) => {
  const frame = useCurrentFrame();
  const dur = sec(to - from) + HOLD;
  const s = interpolate(frame, [0, dur], [scale, scale + 0.045]);
  const settle = interpolate(frame, [0, 7], [1.02, 1], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: fade }}>
      <OffthreadVideo
        src={staticFile(SRC)}
        trimBefore={sec(from)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s * settle})`,
          transformOrigin: `${ox}% ${oy}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Depth word, rendered between the room and the matted speaker. */
const Behind: React.FC<{
  text: string;
  color: string;
  top: number;
  durationInFrames: number;
}> = ({ text, color, top, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 14, stiffness: 190 } });
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, durationInFrames], [26, -26]);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: `${top * 100}%`,
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: bebasFont,
          fontSize: 176,
          lineHeight: 0.84,
          letterSpacing: 3,
          color,
          textAlign: "center",
          whiteSpace: "pre-line",
          transform: `translateY(${drift}px) scale(${interpolate(e, [0, 1], [0.78, 1])})`,
          opacity: interpolate(e, [0, 1], [0, 0.95]),
          textShadow: `0 0 70px ${color}66`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** The hook: room, depth type, then the cut-out speaker over the top. */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = tl(6.42);
  // Room and matte share one transform, otherwise the cut-out slides off him.
  const push = interpolate(frame, [0, dur], [1.0, 1.07]);
  const tx = Math.sin(frame / 46) * 10;
  const cam = `scale(${push}) translateX(${tx}px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#080D18", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam }}>
        <OffthreadVideo
          src={staticFile(SRC)}
          trimBefore={sec(TRIM_START)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.52) saturate(0.8) blur(3px)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 72% 26%, rgba(30,95,255,0.4), transparent 58%), radial-gradient(circle at 22% 82%, rgba(69,208,255,0.26), transparent 54%)",
        }}
      />
      {BEHIND.map((b) => {
        const d = sec(b.to - b.from);
        return (
          <Sequence key={b.from} from={tl(b.from)} durationInFrames={d} layout="none">
            <Behind text={b.text} color={b.color} top={b.top} durationInFrames={d} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ transform: cam }}>
        <OffthreadVideo
          src={staticFile(CUT)}
          transparent
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "drop-shadow(0 22px 44px rgba(0,0,0,0.75))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ file: string; at: number; dur: number; volume?: number }> = ({
  file,
  at,
  dur,
  volume = 0.42,
}) => {
  const from = tl(at);
  if (from < 0) return null;
  return (
    <Sequence from={from} durationInFrames={sec(dur)} layout="none">
      <Audio src={staticFile(`audio/sfx/${file}`)} volume={volume} />
    </Sequence>
  );
};

export const ReelNoAI: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050B16" }}>
      <Audio name="Голос" src={staticFile(SRC)} trimBefore={sec(TRIM_START)} />

      {/* Re-framed talking head */}
      <AbsoluteFill>
        {SHOTS.map((s) => (
          <Sequence
            key={s.from}
            name={`Кадр ${s.from}`}
            from={tl(s.from)}
            durationInFrames={sec(s.to - s.from) + HOLD}
          >
            <Shot from={s.from} to={s.to} scale={s.scale} ox={s.ox} oy={s.oy} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Hook with depth type, over the first shot */}
      <Sequence from={0} durationInFrames={tl(6.42)}>
        <Hook />
      </Sequence>

      {/* Vignette — pulls the eye off the edges and hides the flat room light */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 84% 64% at 50% 40%, rgba(0,0,0,0) 54%, rgba(5,11,22,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Full-screen inserts, each a different colour */}
      <AbsoluteFill>
        {SCENES.map((s) => {
          const d = sec(s.to - s.from);
          return (
            <Sequence key={s.from} name={`Сцена ${s.kind}`} from={tl(s.from)} durationInFrames={d}>
              {SCENE_EL[s.kind](d)}
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Flash on every scene entry and on the harder re-frames */}
      {[...SCENES.map((s) => s.from), 17.68, 24.68, 31.5, 38.36].map((at) => (
        <Sequence key={`f${at}`} from={tl(at)} durationInFrames={4}>
          <FlashCut color={CYAN} />
        </Sequence>
      ))}

      <Grain opacity={0.045} />

      {/* Sound cut to each visual */}
      <Sfx file="Digital_12.wav" at={2.2} dur={0.4} volume={0.4} />
      <Sfx file="Digital_15.wav" at={4.3} dur={0.45} volume={0.4} />
      <Sfx file="Cam_2.mp3" at={10.26} dur={0.45} />
      <Sfx file="Icon_2.wav" at={10.5} dur={0.6} volume={0.4} />
      <Sfx file="Click_10.wav" at={17.68} dur={0.4} volume={0.3} />
      <Sfx file="Click_11.wav" at={24.68} dur={0.4} volume={0.3} />
      <Sfx file="Cam_4.mp3" at={26.1} dur={0.45} />
      <Sfx file="Data_5.wav" at={26.3} dur={2.4} volume={0.22} />
      <Sfx file="Click_10.wav" at={31.5} dur={0.4} volume={0.3} />
      <Sfx file="Click_11.wav" at={38.36} dur={0.4} volume={0.3} />
      <Sfx file="Cam_3.mp3" at={41.28} dur={0.45} />
      <Sfx file="Icon_2.wav" at={41.5} dur={0.6} volume={0.4} />
      <Sfx file="Cam_5.mp3" at={48.58} dur={0.8} volume={0.32} />
      <Sfx file="Digital_4.wav" at={49.1} dur={0.4} volume={0.4} />
      <Sfx file="Digital_14.wav" at={51.44} dur={0.7} volume={0.44} />
    </AbsoluteFill>
  );
};
