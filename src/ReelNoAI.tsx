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
import { POP_EL, PointBadge } from "./OverlayFx";

import {
  BADGES,
  BEHIND,
  CAPTIONS,
  Chunk,
  CONTENT_END,
  FPS,
  POPS,
  SCENES,
  SHOTS,
  TRIM_START,
  HOOK_START,
  HOOK_END,
} from "./captions-data5";
import { bebasFont, CYAN, WHITE, YELLOW } from "./fonts";
import { Grain } from "./fx";

/**
 * «Куда НЕ надо внедрять ИИ».
 *
 * The delivery is flat, so density does the work. Four layers stack up:
 * re-framings of the take on every pause; graphics popping over him on the
 * exact word they illustrate; kinetic captions changing every ~0.8s; and four
 * short full-screen hits on «Первое / Второе / Третье» and the CTA.
 *
 * The room is left alone — an earlier pass washed a blue gradient over him,
 * which the brief rejected. The only thing laid over the picture now is a
 * vignette to keep the eye centred and a caption scrim at the bottom.
 */
const SRC = "src5.mp4";
const CUT = "cut5-hook0.webm";
const sec = (s: number) => Math.round(s * FPS);
const tl = (s: number) => sec(s - TRIM_START);
const HOLD = 10;

export const DURATION_FRAMES = sec(CONTENT_END - TRIM_START);

const Shot: React.FC<{
  from: number;
  to: number;
  scale: number;
  ox: number;
  oy: number;
}> = ({ from, to, scale, ox, oy }) => {
  const frame = useCurrentFrame();
  const dur = sec(to - from) + HOLD;
  const s = interpolate(frame, [0, dur], [scale, scale + 0.05]);
  // A longer dissolve and no scale pop: the old 4-frame cut with a 2.5%
  // scale snap read as a glitch rather than as an edit.
  const fade = interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp" });
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
          transform: `scale(${s})`,
          transformOrigin: `${ox}% ${oy}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Caption chunk. No plate — a scrim below carries legibility. */
const Cap: React.FC<{ chunk: Chunk; durationInFrames: number }> = ({ chunk, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 14, stiffness: 240, mass: 0.5 } });
  const out = interpolate(frame, [durationInFrames - 3, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: out,
        transform: `translateY(${(1 - e) * 26}px) scale(${interpolate(e, [0, 1], [0.88, 1])})`,
        // Accents are Bebas in yellow, not the script face: these chunks are
        // upper-case, and a calligraphic face set in caps is both unreadable
        // and explicitly off-limits here. The script face stays for the
        // lower-case asides in the full-screen cards.
        fontFamily: bebasFont,
        fontWeight: 400,
        fontSize: chunk.accent ? 146 : 132,
        lineHeight: 0.9,
        letterSpacing: 2,
        color: chunk.accent ? YELLOW : WHITE,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow: chunk.accent
          ? `0 0 30px ${YELLOW}55, 0 6px 24px rgba(0,0,0,0.8)`
          : "0 6px 26px rgba(0,0,0,0.92), 0 2px 5px rgba(0,0,0,0.95)",
      }}
    >
      {chunk.text}
    </div>
  );
};

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
  const drift = interpolate(frame, [0, durationInFrames], [24, -24]);
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
          fontSize: 168,
          lineHeight: 0.84,
          letterSpacing: 3,
          color,
          textAlign: "center",
          whiteSpace: "pre-line",
          transform: `translateY(${drift}px) scale(${interpolate(e, [0, 1], [0.8, 1])})`,
          opacity: interpolate(e, [0, 1], [0, 0.95]),
          textShadow: `0 0 70px ${color}66`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Hook: the matted speaker over depth type. The room behind him is only dimmed
 * and blurred — no colour is laid onto it.
 */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = tl(HOOK_END) - tl(HOOK_START);
  const push = interpolate(frame, [0, dur], [1.0, 1.06]);
  const cam = `scale(${push})`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0C", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam }}>
        <OffthreadVideo
          src={staticFile(SRC)}
          trimBefore={sec(HOOK_START)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.45) blur(3px)",
          }}
        />
      </AbsoluteFill>
      {BEHIND.map((b) => {
        const d = sec(b.to - b.from);
        return (
          <Sequence key={b.from} from={tl(b.from) - tl(HOOK_START)} durationInFrames={d} layout="none">
            <Behind text={b.text} color={b.color} top={b.top} durationInFrames={d} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ transform: cam }}>
        <OffthreadVideo
          src={staticFile(CUT)}
          trimBefore={sec(HOOK_START)}
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


/**
 * Soft lift on a cut. The shared FlashCut peaks at 0.55 opacity, which on a
 * dark grade reads as a strobe rather than as an accent — this tops out at a
 * fifth of that and fades over twice as long.
 */
const SoftFlash: React.FC<{ color?: string }> = ({ color = CYAN }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 9], [0.12, 0.07, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: "none" }} />;
};

const Sfx: React.FC<{ file: string; at: number; dur: number; volume?: number }> = ({
  file,
  at,
  dur,
  volume = 0.4,
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

      {/* 1. Re-framed take */}
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

      {/* 2. Hook with depth type */}
      <Sequence from={tl(HOOK_START)} durationInFrames={tl(HOOK_END) - tl(HOOK_START)}>
        <Hook />
      </Sequence>

      {/* 3. Vignette + caption scrim. No colour over the room. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 88% 66% at 50% 38%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.34) 22%, rgba(0,0,0,0) 42%)",
          pointerEvents: "none",
        }}
      />

      {/* 4. Point badge */}
      <AbsoluteFill>
        {BADGES.map((b) => {
          const d = sec(b.to - b.from);
          return (
            <Sequence key={b.from} from={tl(b.from) - tl(HOOK_START)} durationInFrames={d} layout="none">
              <PointBadge n={b.n} durationInFrames={d} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* 5. Graphics popping on the word */}
      <AbsoluteFill>
        {POPS.map((p) => {
          const d = sec(p.dur);
          return (
            <Sequence key={p.at} name={`Поп ${p.kind}`} from={tl(p.at)} durationInFrames={d}>
              {POP_EL[p.kind](d)}
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* 6. Kinetic captions */}
      <AbsoluteFill>
        {CAPTIONS.map((c, i) => {
          const hidden = SCENES.some((s) => c.from < s.to && c.to > s.from);
          if (hidden) return null;
          const next = CAPTIONS[i + 1];
          const end = next ? Math.min(c.to, next.from) : c.to;
          const d = Math.max(sec(end - c.from), 6);
          return (
            <Sequence key={`${c.from}`} from={tl(c.from)} durationInFrames={d} layout="none">
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingBottom: 440,
                  paddingLeft: 70,
                  paddingRight: 70,
                }}
              >
                <Cap chunk={c} durationInFrames={d} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* 7. Full-screen hits */}
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

      {/* 8. Soft lift only where a point changes — not on every re-frame */}
      {SCENES.map((sc) => (
        <Sequence key={`f${sc.from}`} from={tl(sc.from)} durationInFrames={9}>
          <SoftFlash />
        </Sequence>
      ))}

      <Grain opacity={0.04} />

      {/* Sound cut to each visual */}
      <Sfx file="Digital_12.wav" at={1.37} dur={0.4} />
      <Sfx file="Digital_15.wav" at={4.1} dur={0.4} />
      <Sfx file="Data_5.wav" at={5.55} dur={1.1} volume={0.22} />
      <Sfx file="Cam_2.mp3" at={6.85} dur={0.45} />
      <Sfx file="Digital_3.wav" at={8.77} dur={0.5} />
      <Sfx file="Click_10.wav" at={12.6} dur={0.4} volume={0.3} />
      <Sfx file="Click_11.wav" at={18.27} dur={0.4} volume={0.3} />
      <Sfx file="Digital_4.wav" at={21.5} dur={0.4} />
      <Sfx file="Cam_4.mp3" at={25.07} dur={0.45} />
      <Sfx file="Digital_8.wav" at={27.8} dur={0.3} volume={0.46} />
      <Sfx file="Data_2.wav" at={30.2} dur={1.6} volume={0.2} />
      <Sfx file="Digital_14.wav" at={34.15} dur={0.6} volume={0.46} />
      <Sfx file="Digital_8.wav" at={38.7} dur={0.3} volume={0.44} />
      <Sfx file="Cam_3.mp3" at={41.17} dur={0.45} />
      <Sfx file="Click_10.wav" at={44.61} dur={0.4} volume={0.3} />
      <Sfx file="Click_11.wav" at={45.7} dur={0.4} volume={0.3} />
      <Sfx file="Click_10.wav" at={46.85} dur={0.4} volume={0.3} />
      <Sfx file="Cam_5.mp3" at={52.41} dur={0.8} volume={0.32} />
      <Sfx file="Digital_14.wav" at={52.9} dur={0.7} volume={0.44} />
    </AbsoluteFill>
  );
};
