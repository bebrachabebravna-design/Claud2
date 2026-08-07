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
import {
  SceneCaseCTA,
  SceneChaos,
  SceneCompany,
  SceneContrast,
  SceneMoney,
  SceneReveal,
  SceneStopwatch,
} from "./ScenesCase";
import { FlashCut } from "./Overlays";
import { CAPTIONS, CONTENT_END, Chunk, FPS, SCENES, SHOTS } from "./captions-data4";
import { bebasFont, CYAN, scriptFont, WHITE, YELLOW } from "./fonts";

/**
 * Case-study reel on the new take. Same working architecture as ReelNeiro —
 * animated cutaways between spoken beats, no-panel captions, gentle head
 * movement, sound cut to each visual — but with three brief changes:
 *  - No opening cover: it starts on the hook, straight on the face.
 *  - Captions are Bebas, not SF Pro.
 *  - Scenes are purpose-built for this story (stopwatch, 11 min, 238 000 ₽,
 *    11 min → 9 sec, CTA).
 */
const SRC = "src4.mp4";
const sec = (s: number) => Math.round(s * FPS);
const HOLD = 12;

const SCENE_EL: Record<string, (d: number) => React.ReactNode> = {
  company: (d) => <SceneCompany durationInFrames={d} />,
  stopwatch: (d) => <SceneStopwatch durationInFrames={d} />,
  reveal: (d) => <SceneReveal durationInFrames={d} />,
  chaos: (d) => <SceneChaos durationInFrames={d} />,
  money: (d) => <SceneMoney durationInFrames={d} />,
  contrast: (d) => <SceneContrast durationInFrames={d} />,
  cta: (d) => <SceneCaseCTA durationInFrames={d} />,
};

/** Caption chunk in Bebas (no panel). Accent register is the yellow script. */
const Cap: React.FC<{ chunk: Chunk; durationInFrames: number }> = ({ chunk, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 15, stiffness: 210, mass: 0.55 } });
  const out = interpolate(frame, [durationInFrames - 3, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: out,
        transform: `translateY(${(1 - e) * 22}px) scale(${interpolate(e, [0, 1], [0.9, 1])})`,
        fontFamily: chunk.accent ? scriptFont : bebasFont,
        fontWeight: 400,
        // Bebas is condensed, so it can run larger than SF Pro at the same width.
        fontSize: chunk.accent ? 122 : 150,
        lineHeight: chunk.accent ? 0.9 : 0.88,
        letterSpacing: chunk.accent ? 0 : 2,
        color: chunk.accent ? YELLOW : WHITE,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow: chunk.accent
          ? `0 0 26px ${YELLOW}55, 0 6px 22px rgba(0,0,0,0.75)`
          : "0 6px 26px rgba(0,0,0,0.9), 0 2px 5px rgba(0,0,0,0.95)",
      }}
    >
      {chunk.text}
    </div>
  );
};

const Shot: React.FC<{ from: number; to: number; oy: number }> = ({ from, to, oy }) => {
  const frame = useCurrentFrame();
  const dur = sec(to - from) + HOLD;
  const s = interpolate(frame, [0, dur], [1.0, 1.04]);
  const settle = interpolate(frame, [0, 8], [1.012, 1], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
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
          transformOrigin: `50% ${oy}%`,
        }}
      />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ file: string; at: number; dur: number; volume?: number }> = ({
  file,
  at,
  dur,
  volume = 0.45,
}) => (
  <Sequence from={sec(at)} durationInFrames={sec(dur)} layout="none">
    <Audio src={staticFile(`audio/sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const ReelCase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050B16" }}>
      <Audio name="Голос" src={staticFile(SRC)} />

      {/* Talking head */}
      <AbsoluteFill>
        {SHOTS.map((s) => (
          <Sequence
            key={s.from}
            name={`Кадр ${s.from}`}
            from={sec(s.from)}
            durationInFrames={sec(s.to - s.from) + HOLD}
          >
            <Shot from={s.from} to={s.to} oy={s.oy} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Depth + caption scrim */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 86% 66% at 50% 40%, rgba(0,0,0,0) 52%, rgba(5,11,22,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(5,11,22,0.88) 0%, rgba(5,11,22,0.44) 24%, rgba(0,0,0,0) 48%)",
          pointerEvents: "none",
        }}
      />

      {/* Scenes */}
      <AbsoluteFill>
        {SCENES.map((s) => {
          const d = sec(s.to - s.from);
          return (
            <Sequence key={s.from} name={`Сцена ${s.kind}`} from={sec(s.from)} durationInFrames={d}>
              {SCENE_EL[s.kind](d)}
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Flash into each scene */}
      {SCENES.map((s) => (
        <Sequence key={`f${s.from}`} from={sec(s.from)} durationInFrames={5}>
          <FlashCut color={CYAN} />
        </Sequence>
      ))}

      {/* Captions (no panel), hidden under scenes */}
      <AbsoluteFill>
        {CAPTIONS.map((c, i) => {
          const hidden = SCENES.some((s) => c.from < s.to && c.to > s.from);
          if (hidden) return null;
          const next = CAPTIONS[i + 1];
          const end = next ? Math.min(c.to, next.from) : c.to;
          const d = Math.max(sec(end - c.from), 7);
          return (
            <Sequence key={`${c.from}-${c.text}`} from={sec(c.from)} durationInFrames={d} layout="none">
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingBottom: 430,
                  paddingLeft: 80,
                  paddingRight: 80,
                }}
              >
                <Cap chunk={c} durationInFrames={d} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Sound design */}
      <Sfx file="Cam_2.mp3" at={4.61} dur={0.45} volume={0.42} />
      <Sfx file="Icon_2.wav" at={4.9} dur={0.6} volume={0.4} />
      <Sfx file="Cam_4.mp3" at={17.21} dur={0.45} volume={0.42} />
      <Sfx file="Data_5.wav" at={17.4} dur={5.4} volume={0.14} />
      <Sfx file="Digital_8.wav" at={23.2} dur={0.3} volume={0.5} />
      <Sfx file="Digital_14.wav" at={23.35} dur={0.8} volume={0.46} />
      <Sfx file="Cam_3.mp3" at={27.59} dur={0.45} volume={0.42} />
      <Sfx file="Click_10.wav" at={28.2} dur={0.5} volume={0.36} />
      <Sfx file="Click_11.wav" at={30.0} dur={0.5} volume={0.36} />
      <Sfx file="Click_10.wav" at={32.0} dur={0.5} volume={0.36} />
      <Sfx file="Cam_2.mp3" at={35.55} dur={0.45} volume={0.42} />
      <Sfx file="Data_2.wav" at={35.7} dur={3.8} volume={0.2} />
      <Sfx file="Digital_12.wav" at={39.4} dur={0.4} volume={0.46} />
      <Sfx file="Cam_4.mp3" at={41.61} dur={0.45} volume={0.42} />
      <Sfx file="Digital_15.wav" at={43.0} dur={0.5} volume={0.4} />
      <Sfx file="Digital_4.wav" at={45.3} dur={0.5} volume={0.46} />
      <Sfx file="Cam_5.mp3" at={55.9} dur={0.9} volume={0.3} />
      <Sfx file="Icon_2.wav" at={56.3} dur={0.65} volume={0.42} />
      <Sfx file="Digital_12.wav" at={60.0} dur={0.3} volume={0.42} />
    </AbsoluteFill>
  );
};
