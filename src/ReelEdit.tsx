import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ReelShot } from "./ReelShot";
import { Caption } from "./Caption";
import {
  ChipStack,
  CommentCta,
  FlashCut,
  QuestionBadge,
  ScoreCard,
  WaitTimer,
} from "./Overlays";
import { CAPTIONS, FPS } from "./captions-data";

const sec = (s: number) => Math.round(s * FPS);

/**
 * Shots are held past their nominal end so the next one has something to
 * crossfade over. Without this the outgoing shot is already gone while the
 * incoming one is still at low opacity, and the cut reads as a black flash.
 * Sequences paint in document order, so the later shot lands on top.
 */
const HOLD = 12;

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
 * The audio runs as a single uncut element and every shot re-frames that same
 * take at its own absolute start frame, so the picture stays locked to the voice
 * for the full 39.8s. Cuts land on the pauses that `silencedetect` found, which
 * is why they feel like edit points rather than interruptions.
 */
export const ReelEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Audio name="Original voice" src={staticFile("reel-source.mp4")} />

      {/* ---- Virtual camera: 11 angles, 2.3-5.2s each ---- */}
      <AbsoluteFill>
        <Sequence name="01 Cold open" from={0} durationInFrames={sec(1.92) + HOLD}>
          <ReelShot trimBefore={0} originX={50} originY={34} scaleFrom={1.3} scaleTo={1.18} fadeIn={6} />
        </Sequence>
        <Sequence name="02 Hook" from={sec(1.92)} durationInFrames={sec(3.71) + HOLD}>
          <ReelShot trimBefore={sec(1.92)} originX={50} originY={30} scaleFrom={1.1} scaleTo={1.16} punch={1.1} tilt={1.5} />
        </Sequence>
        <Sequence name="03 Hook close" from={sec(5.63)} durationInFrames={sec(3.12) + HOLD}>
          <ReelShot trimBefore={sec(5.63)} originX={42} originY={28} scaleFrom={1.4} scaleTo={1.34} punch={1.08} />
        </Sequence>
        <Sequence name="04 Q1 wide" from={sec(8.75)} durationInFrames={sec(4.11) + HOLD}>
          <ReelShot trimBefore={sec(8.75)} originX={50} originY={40} scaleFrom={1.02} scaleTo={1.09} fadeIn={7} />
        </Sequence>
        <Sequence name="05 Q2 punch" from={sec(12.86)} durationInFrames={sec(3.76) + HOLD}>
          <ReelShot trimBefore={sec(12.86)} originX={56} originY={29} scaleFrom={1.36} scaleTo={1.3} punch={1.09} tilt={-1.5} />
        </Sequence>
        <Sequence name="06 Q2 drift" from={sec(16.62)} durationInFrames={sec(4.49) + HOLD}>
          <ReelShot trimBefore={sec(16.62)} originX={44} originY={33} scaleFrom={1.16} scaleTo={1.24} fadeIn={8} slideFrom={5} />
        </Sequence>
        <Sequence name="07 Q3 extreme" from={sec(21.11)} durationInFrames={sec(3.04) + HOLD}>
          <ReelShot trimBefore={sec(21.11)} originX={50} originY={26} scaleFrom={1.5} scaleTo={1.42} punch={1.1} />
        </Sequence>
        <Sequence name="08 Q3 medium" from={sec(24.15)} durationInFrames={sec(3.5) + HOLD}>
          <ReelShot trimBefore={sec(24.15)} originX={38} originY={32} scaleFrom={1.2} scaleTo={1.14} fadeIn={6} slideFrom={-5} />
        </Sequence>
        <Sequence name="09 Payoff wide" from={sec(27.65)} durationInFrames={sec(5.18) + HOLD}>
          <ReelShot trimBefore={sec(27.65)} originX={50} originY={43} scaleFrom={1.03} scaleTo={1.12} fadeIn={9} />
        </Sequence>
        <Sequence name="10 Payoff close" from={sec(32.83)} durationInFrames={sec(3.54) + HOLD}>
          <ReelShot trimBefore={sec(32.83)} originX={52} originY={28} scaleFrom={1.38} scaleTo={1.32} punch={1.08} />
        </Sequence>
        <Sequence name="11 CTA pull out" from={sec(36.37)} durationInFrames={sec(3.42) + HOLD}>
          <ReelShot trimBefore={sec(36.37)} originX={50} originY={38} scaleFrom={1.16} scaleTo={1.02} fadeIn={8} />
        </Sequence>
      </AbsoluteFill>

      {/* ---- Flash on the hardest cuts ---- */}
      {[5.63, 12.86, 21.11, 32.83].map((at) => (
        <Sequence key={at} name={`Flash ${at}`} from={sec(at)} durationInFrames={5}>
          <FlashCut color="#FFD60A" />
        </Sequence>
      ))}

      {/* ---- Depth: darken the edges so the captions stay legible ---- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 64% at 50% 40%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0) 42%)",
          pointerEvents: "none",
        }}
      />

      {/* ---- Graphics ---- */}
      <AbsoluteFill>
        <Sequence name="Badge 1" from={sec(6.44)} durationInFrames={sec(2.2)}>
          <QuestionBadge number={1} durationInFrames={sec(2.2)} />
        </Sequence>
        <Sequence name="Chips" from={sec(8.75)} durationInFrames={sec(3.4)}>
          <ChipStack items={["ПАПКИ", "ЧАТ", "ПОЧТА"]} durationInFrames={sec(3.4)} />
        </Sequence>
        <Sequence name="Badge 2" from={sec(12.86)} durationInFrames={sec(2.2)}>
          <QuestionBadge number={2} durationInFrames={sec(2.2)} />
        </Sequence>
        <Sequence name="Timer" from={sec(16.62)} durationInFrames={sec(3.2)}>
          <WaitTimer durationInFrames={sec(3.2)} />
        </Sequence>
        <Sequence name="Badge 3" from={sec(21.11)} durationInFrames={sec(2.2)}>
          <QuestionBadge number={3} durationInFrames={sec(2.2)} />
        </Sequence>
        <Sequence name="Score" from={sec(27.65)} durationInFrames={sec(3.4)}>
          <ScoreCard durationInFrames={sec(3.4)} />
        </Sequence>
        <Sequence name="CTA" from={sec(36.2)} durationInFrames={sec(3.59)}>
          <CommentCta durationInFrames={sec(3.59)} />
        </Sequence>
      </AbsoluteFill>

      {/* ---- Captions ---- */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 430,
          paddingLeft: 70,
          paddingRight: 70,
        }}
      >
        {CAPTIONS.map((chunk) => {
          const dur = Math.max(sec(chunk.to - chunk.from), 8);
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
          Cam = shutter on the hard cuts · Digital = bright reel clicks on
          transitions · Click = caption pops · Data = the numeric beats ·
          Icon = graphics arriving · Keyboard = the typing bed under the chips. */}
      <Sfx file="Digital_12.wav" at={0} volume={0.5} />
      <Sfx file="Cam_2.mp3" at={1.92} volume={0.45} />
      <Sfx file="Digital_15.wav" at={3.0} volume={0.4} />
      <Sfx file="Cam_4.mp3" at={5.63} volume={0.5} />
      <Sfx file="Digital_3.wav" at={6.44} volume={0.45} />
      <Sfx file="Icon_2.wav" at={6.5} volume={0.4} />
      <Sfx file="Keyboard_1.wav" at={8.75} volume={0.16} />
      <Sfx file="Click_10.wav" at={8.8} volume={0.4} />
      <Sfx file="Click_11.wav" at={9.7} volume={0.4} />
      <Sfx file="Click_10.wav" at={10.5} volume={0.4} />
      <Sfx file="Cam_1.mp3" at={12.86} volume={0.5} />
      <Sfx file="Digital_4.wav" at={12.9} volume={0.42} />
      <Sfx file="Data_5.wav" at={16.62} volume={0.35} />
      <Sfx file="Digital_6.wav" at={18.45} volume={0.45} />
      <Sfx file="Cam_3.mp3" at={21.11} volume={0.5} />
      <Sfx file="Digital_8.wav" at={21.94} volume={0.42} />
      <Sfx file="Digital_14.wav" at={25.25} volume={0.45} />
      <Sfx file="Data_2.wav" at={27.65} volume={0.3} />
      <Sfx file="Click_6.wav" at={27.7} volume={0.3} />
      <Sfx file="Digital_15.wav" at={29.78} volume={0.42} />
      <Sfx file="Cam_5.mp3" at={32.83} volume={0.4} />
      <Sfx file="Digital_12.wav" at={33.19} volume={0.45} />
      <Sfx file="Digital_3.wav" at={34.1} volume={0.45} />
      <Sfx file="Icon_2.wav" at={34.93} volume={0.45} />
      <Sfx file="Clicks_14.wav" at={36.7} volume={0.3} />
    </AbsoluteFill>
  );
};
