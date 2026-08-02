import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ReelShot } from "./ReelShot";
import { Caption } from "./Caption";
import { FlashCut } from "./Overlays";
import {
  SceneAnswer,
  SceneCase,
  SceneCta,
  SceneHours,
  SceneLoss,
  ScenePenalty,
  ScenePercent,
  SceneScatter,
} from "./Scenes";
import { CAPTIONS, FPS } from "./captions-data";
import { CYAN } from "./fonts";

const sec = (s: number) => Math.round(s * FPS);

/**
 * Shots are held past their nominal end so the next one has something to
 * crossfade over. Without this the outgoing shot is already gone while the
 * incoming one is still at low opacity, and the cut reads as a black flash.
 * Sequences paint in document order, so the later shot lands on top.
 */
const HOLD = 12;

/**
 * Spans where a full-screen scene owns the frame. Captions are suppressed
 * inside these — the scenes carry their own typography, and a subtitle under
 * them stacks three or four competing texts in one frame.
 */
const SCENES: { from: number; to: number; el: (d: number) => React.ReactNode }[] = [
  { from: 4.4, to: 9.3, el: (d) => <SceneLoss durationInFrames={d} /> },
  { from: 11.84, to: 15.9, el: (d) => <ScenePercent durationInFrames={d} /> },
  { from: 15.98, to: 19.2, el: (d) => <SceneHours durationInFrames={d} /> },
  { from: 20.15, to: 25.5, el: (d) => <SceneScatter durationInFrames={d} /> },
  { from: 28.77, to: 31.6, el: (d) => <ScenePenalty durationInFrames={d} /> },
  { from: 34.8, to: 38.8, el: (d) => <SceneAnswer durationInFrames={d} /> },
  { from: 39.04, to: 44.9, el: (d) => <SceneCase durationInFrames={d} /> },
  { from: 45.24, to: 54.83, el: (d) => <SceneCta durationInFrames={d} /> },
];

/**
 * One SFX hit. `dur` is the visual it belongs to: the clip is cut to the length
 * of what is on screen, so a long sample never keeps ringing after its graphic
 * has left the frame.
 */
const Sfx: React.FC<{ file: string; at: number; dur: number; volume?: number }> = ({
  file,
  at,
  dur,
  volume = 0.5,
}) => (
  <Sequence from={sec(at)} durationInFrames={sec(dur)} layout="none">
    <Audio src={staticFile(`audio/sfx/${file}`)} volume={volume} />
  </Sequence>
);

/**
 * Vertical reel cut from one locked-off take.
 *
 * The voice runs as a single uncut element for the full 54.8s. Under it the
 * picture alternates between gentle re-framings of the take and full-screen
 * motion scenes that drop the camera entirely — a locked-off talking head
 * cannot hold a minute on its own, and the graphic beats are where the argument
 * is actually made.
 *
 * The source is 720p being delivered at 1080p, so the virtual camera stays
 * between 1.0x and 1.12x: anything tighter is visibly soft once the upscale is
 * applied on top of it.
 */
export const ReelEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050B16" }}>
      <Audio name="Original voice" src={staticFile("source-video.mp4")} />

      {/* ---- Camera on the take: gentle, wide, never punched in ---- */}
      <AbsoluteFill>
        <Sequence name="01 Cold open" from={0} durationInFrames={sec(3.02) + HOLD}>
          <ReelShot trimBefore={0} originX={50} originY={36} scaleFrom={1.1} scaleTo={1.03} fadeIn={8} />
        </Sequence>
        <Sequence name="02 Hook" from={sec(3.02)} durationInFrames={sec(1.38) + HOLD}>
          <ReelShot trimBefore={sec(3.02)} originX={50} originY={32} scaleFrom={1.05} scaleTo={1.09} punch={1.04} />
        </Sequence>
        <Sequence name="03 After loss" from={sec(9.3)} durationInFrames={sec(2.54) + HOLD}>
          <ReelShot trimBefore={sec(9.3)} originX={50} originY={38} scaleFrom={1.02} scaleTo={1.07} fadeIn={8} />
        </Sequence>
        <Sequence name="04 Cause" from={sec(19.2)} durationInFrames={sec(0.95) + HOLD}>
          <ReelShot trimBefore={sec(19.2)} originX={48} originY={33} scaleFrom={1.08} scaleTo={1.11} punch={1.04} />
        </Sequence>
        <Sequence name="05 Not in time" from={sec(25.5)} durationInFrames={sec(3.27) + HOLD}>
          <ReelShot trimBefore={sec(25.5)} originX={52} originY={36} scaleFrom={1.03} scaleTo={1.09} fadeIn={9} />
        </Sequence>
        <Sequence name="06 Solution" from={sec(31.6)} durationInFrames={sec(3.2) + HOLD}>
          <ReelShot trimBefore={sec(31.6)} originX={50} originY={34} scaleFrom={1.06} scaleTo={1.1} fadeIn={8} slideFrom={4} />
        </Sequence>
      </AbsoluteFill>

      {/* ---- Depth over the camera shots ---- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 84% 68% at 50% 40%, rgba(0,0,0,0) 52%, rgba(5,11,22,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(5,11,22,0.8) 0%, rgba(5,11,22,0.4) 22%, rgba(0,0,0,0) 45%)",
          pointerEvents: "none",
        }}
      />

      {/* ---- Full-screen motion scenes ---- */}
      <AbsoluteFill>
        {SCENES.map((s) => {
          const dur = sec(s.to - s.from);
          return (
            <Sequence key={s.from} name={`Scene ${s.from}`} from={sec(s.from)} durationInFrames={dur}>
              {s.el(dur)}
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* ---- Flash on the hardest transitions ---- */}
      {[11.84, 20.15, 28.77, 39.04].map((at) => (
        <Sequence key={at} name={`Flash ${at}`} from={sec(at)} durationInFrames={5}>
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
              name={chunk.text.slice(0, 18)}
              from={sec(chunk.from)}
              durationInFrames={dur}
              layout="none"
            >
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingBottom: 430,
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

      {/* ---- Sound design ----
          Every hit is cut to the length of the thing it accompanies, so nothing
          rings on after its graphic has gone. Cam = camera cuts, Digital =
          transitions, Click/Icon = elements landing, Data = counters running,
          Keyboard = the typing bed under the question in the answer scene. */}
      <Sfx file="Digital_12.wav" at={0} dur={0.4} volume={0.45} />
      <Sfx file="Cam_2.mp3" at={3.02} dur={0.45} volume={0.42} />

      {/* Loss counter: beeps only while the number is climbing (4.4-7.1). */}
      <Sfx file="Digital_15.wav" at={4.4} dur={0.55} volume={0.45} />
      <Sfx file="Data_2.wav" at={4.5} dur={2.6} volume={0.26} />
      <Sfx file="Digital_3.wav" at={7.1} dur={0.5} volume={0.4} />
      <Sfx file="Cam_4.mp3" at={9.3} dur={0.4} volume={0.42} />

      {/* Percent ring: sweep for the draw, click when it stops. */}
      <Sfx file="Digital_4.wav" at={11.84} dur={0.4} volume={0.45} />
      <Sfx file="Data_5.wav" at={11.9} dur={1.3} volume={0.3} />
      <Sfx file="Click_10.wav" at={14.3} dur={0.55} volume={0.4} />

      {/* Month blocks lighting up. */}
      <Sfx file="Digital_6.wav" at={15.98} dur={0.2} volume={0.45} />
      <Sfx file="Clicks_14.wav" at={16.3} dur={1.4} volume={0.28} />
      <Sfx file="Digital_14.wav" at={18.2} dur={0.8} volume={0.4} />
      <Sfx file="Cam_1.mp3" at={19.2} dur={0.4} volume={0.42} />

      {/* Cards flying out, one hit each. */}
      <Sfx file="Digital_8.wav" at={20.15} dur={0.2} volume={0.45} />
      <Sfx file="Click_11.wav" at={20.2} dur={0.57} volume={0.4} />
      <Sfx file="Click_10.wav" at={20.45} dur={0.53} volume={0.4} />
      <Sfx file="Click_11.wav" at={20.7} dur={0.57} volume={0.4} />
      <Sfx file="Cam_3.mp3" at={25.5} dur={0.5} volume={0.42} />

      {/* Penalty: single hard hit, nothing sustained. */}
      <Sfx file="Digital_12.wav" at={28.77} dur={0.3} volume={0.5} />
      <Sfx file="Digital_15.wav" at={29.4} dur={0.55} volume={0.42} />
      <Sfx file="Cam_5.mp3" at={31.6} dur={0.9} volume={0.34} />

      {/* Answer scene: typing under the question, then the card landing. */}
      <Sfx file="Keyboard_1.wav" at={34.8} dur={1.6} volume={0.16} />
      <Sfx file="Icon_2.wav" at={36.6} dur={0.65} volume={0.45} />
      <Sfx file="Digital_3.wav" at={37.2} dur={0.5} volume={0.4} />

      {/* Case: strike-through, then the new figure. */}
      <Sfx file="Digital_4.wav" at={39.04} dur={0.4} volume={0.45} />
      <Sfx file="Digital_14.wav" at={41.1} dur={0.8} volume={0.45} />
      <Sfx file="Click_6.wav" at={42.6} dur={1.2} volume={0.3} />

      {/* CTA: sliders settling. */}
      <Sfx file="Icon_2.wav" at={45.24} dur={0.65} volume={0.45} />
      <Sfx file="Click_10.wav" at={45.6} dur={0.53} volume={0.35} />
      <Sfx file="Click_11.wav" at={45.9} dur={0.57} volume={0.35} />
      <Sfx file="Digital_12.wav" at={49.54} dur={0.3} volume={0.42} />
    </AbsoluteFill>
  );
};
