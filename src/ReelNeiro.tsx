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
  SceneContract,
  SceneIntro,
  SceneMeeting,
  SceneOutro,
  SceneTemplate,
  SceneTrio,
} from "./Scenes2";
import { Headline, TipBadge } from "./Headline";
import { FlashCut } from "./Overlays";
import {
  BADGES,
  CAPTIONS,
  CONTENT_END,
  Chunk,
  FPS,
  HEADLINES,
  SCENES,
  SHOTS,
} from "./captions-data3";
import { CYAN, displayFont, scriptFont, WHITE, YELLOW } from "./fonts";

/**
 * The full Neirodocs edit on the new take.
 *
 * This is a return to the architecture that worked — animated full-screen
 * cutaways between the spoken beats, sound cut to each visual, kinetic captions
 * with NO panels — rebuilt on the new source and with the type finally right.
 *
 * Deliberate constraints from the brief:
 *  - The speaker is never graded and barely moved: a ~4% push on the otherwise
 *    static frame, nothing more. No colour work on him at all.
 *  - Captions have no plate. White SF Pro (no outline) reads on a soft scrim;
 *    the accent is the yellow handwritten face, lower-case only.
 *  - The animation lives in the scenes, which own the frame for whole beats,
 *    rather than in constant camera moves on the head.
 */
const SRC = "src3.mp4";
const sec = (s: number) => Math.round(s * FPS);
const HOLD = 12;

const SCENE_EL: Record<string, (d: number) => React.ReactNode> = {
  intro: (d) => <SceneIntro durationInFrames={d} />,
  contract: (d) => <SceneContract durationInFrames={d} />,
  meeting: (d) => <SceneMeeting durationInFrames={d} />,
  template: (d) => <SceneTemplate durationInFrames={d} />,
  trio: (d) => <SceneTrio durationInFrames={d} />,
  outro: (d) => <SceneOutro durationInFrames={d} />,
};

/**
 * A caption chunk, no panel. The old outline is gone — legibility is a soft
 * shadow over the picture scrim, which keeps SF Pro looking native instead of
 * boxed or stroked. The accent register is the yellow script face.
 */
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
        fontFamily: chunk.accent ? scriptFont : displayFont,
        fontWeight: chunk.accent ? 400 : 800,
        fontSize: chunk.accent ? 128 : 96,
        lineHeight: chunk.accent ? 0.9 : 1.0,
        letterSpacing: chunk.accent ? 0 : -2,
        color: chunk.accent ? YELLOW : WHITE,
        textTransform: chunk.accent ? "none" : "uppercase",
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

/** The take, gently pushed, never graded. */
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

export const ReelNeiro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050B16" }}>
      <Audio name="Голос" src={staticFile(SRC)} />

      {/* ---- Talking head (gentle push, no grade) ---- */}
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

      {/* ---- Depth + caption scrim over the head ---- */}
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
            "linear-gradient(to top, rgba(5,11,22,0.86) 0%, rgba(5,11,22,0.42) 24%, rgba(0,0,0,0) 48%)",
          pointerEvents: "none",
        }}
      />

      {/* ---- Headlines + tip badges ---- */}
      <AbsoluteFill>
        {HEADLINES.map((h) => {
          const d = sec(h.to - h.from);
          return (
            <Sequence key={h.from} from={sec(h.from)} durationInFrames={d}>
              <Headline lead={h.lead} word={h.word} durationInFrames={d} />
            </Sequence>
          );
        })}
        {BADGES.map((b) => {
          const d = sec(b.to - b.from);
          return (
            <Sequence key={b.from} from={sec(b.from)} durationInFrames={d}>
              <TipBadge n={b.n} durationInFrames={d} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* ---- Full-screen animated scenes ---- */}
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

      {/* ---- Flash on the hard cuts into scenes ---- */}
      {SCENES.filter((s) => s.from > 0).map((s) => (
        <Sequence key={`f${s.from}`} from={sec(s.from)} durationInFrames={5}>
          <FlashCut color={CYAN} />
        </Sequence>
      ))}

      {/* ---- Captions (no panel), hidden under scenes ---- */}
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

      {/* ---- Sound design, each hit cut to its visual ---- */}
      <Sfx file="Digital_12.wav" at={0.1} dur={0.5} volume={0.4} />
      <Sfx file="Icon_2.wav" at={2.9} dur={0.5} volume={0.4} />
      <Sfx file="Digital_15.wav" at={9.66} dur={0.5} volume={0.42} />
      <Sfx file="Cam_2.mp3" at={13.14} dur={0.45} volume={0.42} />
      <Sfx file="Keyboard_1.wav" at={13.3} dur={2.0} volume={0.12} />
      <Sfx file="Click_10.wav" at={15.3} dur={0.5} volume={0.38} />
      <Sfx file="Click_11.wav" at={16.2} dur={0.5} volume={0.38} />
      <Sfx file="Click_10.wav" at={17.1} dur={0.5} volume={0.38} />
      <Sfx file="Digital_3.wav" at={19.8} dur={0.5} volume={0.42} />
      <Sfx file="Digital_15.wav" at={21.45} dur={0.5} volume={0.42} />
      <Sfx file="Cam_4.mp3" at={23.41} dur={0.45} volume={0.42} />
      <Sfx file="Data_5.wav" at={23.6} dur={1.3} volume={0.26} />
      <Sfx file="Click_11.wav" at={29.6} dur={0.5} volume={0.38} />
      <Sfx file="Click_10.wav" at={30.6} dur={0.5} volume={0.38} />
      <Sfx file="Digital_15.wav" at={33.65} dur={0.5} volume={0.42} />
      <Sfx file="Cam_3.mp3" at={36.5} dur={0.45} volume={0.42} />
      <Sfx file="Data_2.wav" at={36.7} dur={2.0} volume={0.22} />
      <Sfx file="Digital_14.wav" at={41.0} dur={0.7} volume={0.42} />
      <Sfx file="Digital_8.wav" at={42.17} dur={0.2} volume={0.45} />
      <Sfx file="Digital_4.wav" at={42.8} dur={0.4} volume={0.42} />
      <Sfx file="Cam_5.mp3" at={48.9} dur={0.9} volume={0.3} />
      <Sfx file="Icon_2.wav" at={49.3} dur={0.65} volume={0.42} />
      <Sfx file="Digital_12.wav" at={52.9} dur={0.3} volume={0.42} />
    </AbsoluteFill>
  );
};
