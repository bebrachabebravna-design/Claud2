import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ReelShot } from "./ReelShot";
import { Caption } from "./Caption";
import { QuestionBadge, FlashCut } from "./Overlays";
import { SceneScatter, SceneWaiting, SceneLoss, SceneCta } from "./Scenes";
import { CAPTIONS, FPS } from "./captions-data";

const sec = (s: number) => Math.round(s * FPS);

/**
 * Shots are held past their nominal end so the next one has something to
 * crossfade over. Without this the outgoing shot is already gone while the
 * incoming one is still at low opacity, and the cut reads as a black flash.
 * Sequences paint in document order, so the later shot lands on top.
 */
const HOLD = 12;

/** Spans where a full-screen scene owns the frame, in seconds. */
const SCENE_WINDOWS: [number, number][] = [
  [8.8, 11.39],
  [15.7, 17.31],
  [29.8, 32.56],
  [36.3, 39.79],
];

/** One SFX hit, placed by the second it should land on. */
const Sfx: React.FC<{ file: string; at: number; volume?: number }> = ({
  file,
  at,
  volume = 0.55,
}) => (
  <Sequence from={sec(at)} durationInFrames={sec(4)} layout="none">
    <Audio src={staticFile(`audio/sfx/${file}`)} volume={volume} />
  </Sequence>
);

/**
 * Vertical reel cut from one locked-off take.
 *
 * The voice runs as a single uncut element for the full 39.8s. Under it the
 * picture alternates between re-framings of the take and full-screen motion
 * scenes that drop the camera entirely — a locked-off talking head cannot hold
 * forty seconds on its own, and the graphic beats are where the argument is
 * actually made.
 *
 * Every cut lands on a pause found by `silencedetect`, so the edit tracks the
 * delivery rather than a fixed interval.
 */
export const ReelEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Audio name="Original voice" src={staticFile("reel-source.mp4")} />

      {/* ---- Camera on the take ---- */}
      <AbsoluteFill>
        <Sequence name="01 Cold open" from={0} durationInFrames={sec(1.92) + HOLD}>
          <ReelShot trimBefore={0} originX={50} originY={34} scaleFrom={1.32} scaleTo={1.18} fadeIn={6} />
        </Sequence>
        <Sequence name="02 Hook" from={sec(1.92)} durationInFrames={sec(3.04) + HOLD}>
          <ReelShot trimBefore={sec(1.92)} originX={50} originY={30} scaleFrom={1.1} scaleTo={1.17} punch={1.11} tilt={1.6} />
        </Sequence>
        <Sequence name="03 Q1 close" from={sec(4.96)} durationInFrames={sec(3.84) + HOLD}>
          <ReelShot trimBefore={sec(4.96)} originX={42} originY={28} scaleFrom={1.42} scaleTo={1.33} punch={1.09} />
        </Sequence>

        {/* 8.8-11.4 — scene 1 replaces the camera */}

        <Sequence name="04 Q2 wide" from={sec(11.39)} durationInFrames={sec(2.82) + HOLD}>
          <ReelShot trimBefore={sec(11.39)} originX={50} originY={40} scaleFrom={1.03} scaleTo={1.1} fadeIn={7} />
        </Sequence>
        <Sequence name="05 Q2 punch" from={sec(14.21)} durationInFrames={sec(1.49) + HOLD}>
          <ReelShot trimBefore={sec(14.21)} originX={57} originY={29} scaleFrom={1.38} scaleTo={1.32} punch={1.1} tilt={-1.6} />
        </Sequence>

        {/* 15.7-17.7 — scene 2 replaces the camera */}

        <Sequence name="06 Q2 out" from={sec(17.31)} durationInFrames={sec(1.94) + HOLD}>
          <ReelShot trimBefore={sec(17.31)} originX={44} originY={33} scaleFrom={1.18} scaleTo={1.26} fadeIn={8} slideFrom={5} />
        </Sequence>
        <Sequence name="07 Q3 extreme" from={sec(19.25)} durationInFrames={sec(4.1) + HOLD}>
          <ReelShot trimBefore={sec(19.25)} originX={50} originY={26} scaleFrom={1.5} scaleTo={1.4} punch={1.11} />
        </Sequence>
        <Sequence name="08 Q3 medium" from={sec(23.35)} durationInFrames={sec(3.09) + HOLD}>
          <ReelShot trimBefore={sec(23.35)} originX={38} originY={32} scaleFrom={1.2} scaleTo={1.13} fadeIn={6} slideFrom={-5} />
        </Sequence>
        <Sequence name="09 Payoff wide" from={sec(26.44)} durationInFrames={sec(3.36) + HOLD}>
          <ReelShot trimBefore={sec(26.44)} originX={50} originY={43} scaleFrom={1.04} scaleTo={1.13} fadeIn={9} />
        </Sequence>

        {/* 29.8-32.6 — scene 3 replaces the camera */}

        <Sequence name="10 Close" from={sec(32.56)} durationInFrames={sec(2.65) + HOLD}>
          <ReelShot trimBefore={sec(32.56)} originX={52} originY={28} scaleFrom={1.4} scaleTo={1.3} punch={1.09} />
        </Sequence>
        <Sequence name="11 Last look" from={sec(35.21)} durationInFrames={sec(1.09) + HOLD}>
          <ReelShot trimBefore={sec(35.21)} originX={50} originY={36} scaleFrom={1.14} scaleTo={1.04} fadeIn={7} />
        </Sequence>

        {/* 36.3-39.79 — closing card */}
      </AbsoluteFill>

      {/* ---- Depth over the camera shots only ---- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 82% 66% at 50% 40%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.52) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 22%, rgba(0,0,0,0) 44%)",
          pointerEvents: "none",
        }}
      />

      {/* ---- Full-screen motion scenes: these paint over the camera ---- */}
      <AbsoluteFill>
        <Sequence name="Scene scatter" from={sec(8.8)} durationInFrames={sec(2.59)}>
          <SceneScatter durationInFrames={sec(2.59)} />
        </Sequence>
        <Sequence name="Scene waiting" from={sec(15.7)} durationInFrames={sec(1.61)}>
          <SceneWaiting durationInFrames={sec(1.61)} />
        </Sequence>
        <Sequence name="Scene loss" from={sec(29.8)} durationInFrames={sec(2.76)}>
          <SceneLoss durationInFrames={sec(2.76)} />
        </Sequence>
        <Sequence name="Scene CTA" from={sec(36.3)} durationInFrames={sec(3.49)}>
          <SceneCta durationInFrames={sec(3.49)} />
        </Sequence>
      </AbsoluteFill>

      {/* ---- Flash on the hardest cuts ---- */}
      {[4.96, 11.39, 19.25, 32.56].map((at) => (
        <Sequence key={at} name={`Flash ${at}`} from={sec(at)} durationInFrames={5}>
          <FlashCut color="#FFE24A" />
        </Sequence>
      ))}

      {/* ---- Question badges ---- */}
      <AbsoluteFill>
        <Sequence name="Badge 1" from={sec(4.96)} durationInFrames={sec(1.9)}>
          <QuestionBadge number={1} durationInFrames={sec(1.9)} />
        </Sequence>
        <Sequence name="Badge 2" from={sec(11.39)} durationInFrames={sec(1.9)}>
          <QuestionBadge number={2} durationInFrames={sec(1.9)} />
        </Sequence>
        <Sequence name="Badge 3" from={sec(19.25)} durationInFrames={sec(1.9)}>
          <QuestionBadge number={3} durationInFrames={sec(1.9)} />
        </Sequence>
      </AbsoluteFill>

      {/* ---- Captions ----
          Held back while a full-screen scene is up: those compositions carry
          their own copy, and a subtitle under them stacks three or four
          competing texts in one frame. Each chunk is also clipped to the start
          of the next one, so two lines never sit on top of each other during a
          hand-off. */}
      <AbsoluteFill>
        {CAPTIONS.map((chunk, i) => {
          const hidden = SCENE_WINDOWS.some(
            ([a, b]) => chunk.from < b && chunk.to > a,
          );
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
                  paddingBottom: 420,
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
          Cam = shutter on the hard cuts · Digital = bright reel clicks on
          transitions · Click = elements landing · Data = the numeric beats ·
          Icon = graphics arriving · Keyboard = bed under the scatter scene. */}
      <Sfx file="Digital_12.wav" at={0} volume={0.5} />
      <Sfx file="Cam_2.mp3" at={1.92} volume={0.45} />
      <Sfx file="Digital_15.wav" at={2.49} volume={0.4} />
      <Sfx file="Cam_4.mp3" at={4.96} volume={0.5} />
      <Sfx file="Icon_2.wav" at={5.0} volume={0.4} />
      <Sfx file="Keyboard_1.wav" at={8.8} volume={0.14} />
      <Sfx file="Click_10.wav" at={8.85} volume={0.42} />
      <Sfx file="Click_11.wav" at={9.2} volume={0.42} />
      <Sfx file="Click_10.wav" at={9.72} volume={0.42} />
      <Sfx file="Cam_1.mp3" at={11.39} volume={0.5} />
      <Sfx file="Digital_4.wav" at={11.43} volume={0.42} />
      <Sfx file="Data_5.wav" at={15.7} volume={0.38} />
      <Sfx file="Digital_6.wav" at={17.31} volume={0.45} />
      <Sfx file="Cam_3.mp3" at={19.25} volume={0.5} />
      <Sfx file="Digital_8.wav" at={19.29} volume={0.42} />
      <Sfx file="Digital_14.wav" at={23.35} volume={0.45} />
      <Sfx file="Digital_3.wav" at={26.44} volume={0.42} />
      <Sfx file="Data_2.wav" at={29.8} volume={0.34} />
      <Sfx file="Click_6.wav" at={29.85} volume={0.3} />
      <Sfx file="Cam_5.mp3" at={32.56} volume={0.4} />
      <Sfx file="Digital_12.wav" at={33.38} volume={0.45} />
      <Sfx file="Icon_2.wav" at={36.3} volume={0.5} />
      <Sfx file="Clicks_14.wav" at={36.5} volume={0.32} />
    </AbsoluteFill>
  );
};
