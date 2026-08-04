import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ReelShot } from "./ReelShot";
import { Caption } from "./Caption";
import { FlashCut } from "./Overlays";
import { Headline, TipBadge } from "./Headline";
import {
  SceneContract,
  SceneIntro,
  SceneMeeting,
  SceneOutro,
  SceneTemplate,
  SceneTrio,
} from "./Scenes2";
import { CAPTIONS, CONTENT_END, FPS, TRIM_START } from "./captions-data2";
import { CYAN } from "./fonts";

const SRC = "reel2-source.mp4";
const sec = (s: number) => Math.round(s * FPS);
const tl = (s: number) => sec(s - TRIM_START);
const HOLD = 12;

/** Full-screen scene windows, in SOURCE seconds. Captions hide under them. */
const SCENES: { from: number; to: number; el: (d: number) => React.ReactNode }[] = [
  { from: 0, to: 3.45, el: (d) => <SceneIntro durationInFrames={d} /> },
  { from: 12.09, to: 21.03, el: (d) => <SceneContract durationInFrames={d} /> },
  { from: 23.6, to: 33.09, el: (d) => <SceneMeeting durationInFrames={d} /> },
  { from: 36.5, to: 41.67, el: (d) => <SceneTemplate durationInFrames={d} /> },
  { from: 42.15, to: 43.77, el: (d) => <SceneTrio durationInFrames={d} /> },
  { from: 48.6, to: CONTENT_END, el: (d) => <SceneOutro durationInFrames={d} /> },
];

/** Big keyword title-cards over the talking head, in SOURCE seconds. */
const HEADLINES: { from: number; to: number; lead: string; word: string }[] = [
  { from: 3.45, to: 9.45, lead: "не плати за", word: "рутину" },
];

/** Numbered tip pills over the head, in SOURCE seconds. */
const BADGES: { from: number; to: number; n: number }[] = [
  { from: 9.75, to: 12.0, n: 1 },
  { from: 21.45, to: 23.6, n: 2 },
  { from: 33.69, to: 36.5, n: 3 },
];

const Sfx: React.FC<{ file: string; at: number; dur: number; volume?: number }> = ({
  file,
  at,
  dur,
  volume = 0.5,
}) => {
  const from = tl(at);
  if (from < 0) return null;
  return (
    <Sequence from={from} durationInFrames={sec(dur)} layout="none">
      <Audio src={staticFile(`audio/sfx/${file}`)} volume={volume} />
    </Sequence>
  );
};

/**
 * "3 приёма для документов" — reel cut from one locked-off take, in the
 * reference's title-card style (big highlighted keyword over the head) but in
 * the Neirodocs palette.
 *
 * Head and tail are trimmed; the voice runs uncut from TRIM_START. The picture
 * alternates gentle re-framings of the take (each carrying a headline or a
 * numbered tip pill) with full-screen scenes that demonstrate each tip. Source
 * is 720p at 1080p, so scale stays 1.0–1.12.
 */
export const ReelEdit2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050B16" }}>
      <Audio name="Original voice" src={staticFile(SRC)} />

      {/* ---- Camera on the take ---- */}
      <AbsoluteFill>
        {[
          { src: TRIM_START, to: 12.09, oy: 34, sf: 1.06, st: 1.02, fade: 8 },
          { src: 21.03, to: 23.6, oy: 32, sf: 1.08, st: 1.11, punch: 1.04 },
          { src: 33.09, to: 36.5, oy: 33, sf: 1.05, st: 1.09, fade: 7, slide: 4 },
          { src: 43.77, to: 48.6, oy: 36, sf: 1.03, st: 1.08, fade: 8 },
        ].map((s, i) => (
          <Sequence key={i} name={`Shot ${i}`} from={tl(s.src)} durationInFrames={sec(s.to - s.src) + HOLD}>
            <ReelShot
              src={SRC}
              trimBefore={sec(s.src)}
              originX={50}
              originY={s.oy}
              scaleFrom={s.sf}
              scaleTo={s.st}
              punch={s.punch}
              fadeIn={s.fade ?? 1}
              slideFrom={s.slide ?? 0}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* ---- Depth over the camera shots ---- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 84% 68% at 50% 42%, rgba(0,0,0,0) 50%, rgba(5,11,22,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(5,11,22,0.82) 0%, rgba(5,11,22,0.4) 22%, rgba(0,0,0,0) 46%)",
          pointerEvents: "none",
        }}
      />

      {/* ---- Headlines + tip badges over the head ---- */}
      <AbsoluteFill>
        {HEADLINES.map((h) => {
          const dur = sec(h.to - h.from);
          return (
            <Sequence key={h.from} name={`Headline ${h.word}`} from={tl(h.from)} durationInFrames={dur}>
              <Headline lead={h.lead} word={h.word} durationInFrames={dur} />
            </Sequence>
          );
        })}
        {BADGES.map((b) => {
          const dur = sec(b.to - b.from);
          return (
            <Sequence key={b.from} name={`Badge ${b.n}`} from={tl(b.from)} durationInFrames={dur}>
              <TipBadge n={b.n} durationInFrames={dur} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* ---- Full-screen scenes ---- */}
      <AbsoluteFill>
        {SCENES.map((s) => {
          const dur = sec(s.to - s.from);
          return (
            <Sequence key={s.from} name={`Scene ${s.from}`} from={tl(s.from)} durationInFrames={dur}>
              {s.el(dur)}
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* ---- Flash on the hardest transitions ---- */}
      {[12.09, 23.6, 36.5, 48.6].map((at) => (
        <Sequence key={at} name={`Flash ${at}`} from={tl(at)} durationInFrames={5}>
          <FlashCut color={CYAN} />
        </Sequence>
      ))}

      {/* ---- Captions, suppressed under the scenes ---- */}
      <AbsoluteFill>
        {CAPTIONS.map((chunk, i) => {
          const hidden = SCENES.some((s) => chunk.from < s.to && chunk.to > s.from);
          if (hidden) return null;
          const next = CAPTIONS[i + 1];
          const end = next ? Math.min(chunk.to, next.from) : chunk.to;
          const dur = Math.max(sec(end - chunk.from), 6);
          return (
            <Sequence
              key={`${chunk.from}-${chunk.text}`}
              name={chunk.text.slice(0, 16)}
              from={tl(chunk.from)}
              durationInFrames={dur}
              layout="none"
            >
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingBottom: 380,
                  paddingLeft: 70,
                  paddingRight: 70,
                }}
              >
                <Caption text={chunk.text} accent={chunk.accent} durationInFrames={dur} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* ---- Sound design: each hit cut to its visual ---- */}
      <Sfx file="Digital_12.wav" at={3.45} dur={0.4} volume={0.45} />
      <Sfx file="Digital_15.wav" at={9.75} dur={0.5} volume={0.42} />
      <Sfx file="Cam_2.mp3" at={12.09} dur={0.45} volume={0.42} />
      <Sfx file="Keyboard_1.wav" at={12.2} dur={2.0} volume={0.14} />
      <Sfx file="Click_10.wav" at={15.4} dur={0.5} volume={0.4} />
      <Sfx file="Click_11.wav" at={16.2} dur={0.5} volume={0.4} />
      <Sfx file="Click_10.wav" at={17.0} dur={0.5} volume={0.4} />
      <Sfx file="Digital_3.wav" at={19.7} dur={0.5} volume={0.42} />
      <Sfx file="Digital_15.wav" at={21.45} dur={0.5} volume={0.42} />
      <Sfx file="Cam_4.mp3" at={23.6} dur={0.45} volume={0.42} />
      <Sfx file="Data_5.wav" at={23.8} dur={1.3} volume={0.28} />
      <Sfx file="Click_11.wav" at={29.6} dur={0.5} volume={0.4} />
      <Sfx file="Click_10.wav" at={30.6} dur={0.5} volume={0.4} />
      <Sfx file="Click_11.wav" at={31.6} dur={0.5} volume={0.4} />
      <Sfx file="Digital_15.wav" at={33.69} dur={0.5} volume={0.42} />
      <Sfx file="Cam_3.mp3" at={36.5} dur={0.45} volume={0.42} />
      <Sfx file="Data_2.wav" at={36.7} dur={2.0} volume={0.24} />
      <Sfx file="Digital_14.wav" at={40.7} dur={0.7} volume={0.42} />
      <Sfx file="Digital_8.wav" at={42.15} dur={0.2} volume={0.45} />
      <Sfx file="Digital_4.wav" at={42.7} dur={0.4} volume={0.42} />
      <Sfx file="Cam_5.mp3" at={48.6} dur={0.9} volume={0.32} />
      <Sfx file="Icon_2.wav" at={48.99} dur={0.65} volume={0.42} />
      <Sfx file="Digital_12.wav" at={52.71} dur={0.3} volume={0.42} />
    </AbsoluteFill>
  );
};
