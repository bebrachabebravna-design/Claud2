import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Shot } from "./Shot";

/**
 * The source is one continuous take, so the audio runs as a single uncut element.
 * Every visual cut is a re-frame of that same take, positioned at absolute frames,
 * which keeps the picture locked to the voice for the whole 54.8s.
 */
export const ShortEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Audio name="Original sound" src={staticFile("source-video.mp4")} />

      <AbsoluteFill>
        <Sequence name="01 Establish" from={0} durationInFrames={120}>
          <Shot trimBefore={0} originX={50} originY={38} scaleFrom={1} scaleTo={1.06} punch={1} fadeIn={12} slideFrom={0} />
        </Sequence>
        <Sequence name="02 Punch in" from={119} durationInFrames={136}>
          <Shot trimBefore={119} originX={50} originY={30} scaleFrom={1.22} scaleTo={1.27} punch={1.07} fadeIn={1} slideFrom={0} />
        </Sequence>
        <Sequence name="03 Off-center" from={246} durationInFrames={114}>
          <Shot trimBefore={246} originX={38} originY={32} scaleFrom={1.14} scaleTo={1.1} punch={1} fadeIn={9} slideFrom={0} />
        </Sequence>
        <Sequence name="04 Extreme close" from={359} durationInFrames={151}>
          <Shot trimBefore={359} originX={50} originY={27} scaleFrom={1.42} scaleTo={1.48} punch={1.08} fadeIn={1} slideFrom={0} />
        </Sequence>
        <Sequence name="05 Wide reset" from={500} durationInFrames={130}>
          <Shot trimBefore={500} originX={50} originY={45} scaleFrom={1.02} scaleTo={1.07} punch={1} fadeIn={10} slideFrom={0} />
        </Sequence>
        <Sequence name="06 Drift right" from={620} durationInFrames={145}>
          <Shot trimBefore={620} originX={60} originY={33} scaleFrom={1.2} scaleTo={1.15} punch={1} fadeIn={10} slideFrom={6} />
        </Sequence>
        <Sequence name="07 Punch close" from={764} durationInFrames={136}>
          <Shot trimBefore={764} originX={50} originY={29} scaleFrom={1.32} scaleTo={1.38} punch={1.07} fadeIn={1} slideFrom={0} />
        </Sequence>
        <Sequence name="08 Medium" from={891} durationInFrames={129}>
          <Shot trimBefore={891} originX={44} originY={34} scaleFrom={1.16} scaleTo={1.21} punch={1} fadeIn={9} slideFrom={0} />
        </Sequence>
        <Sequence name="09 Extreme close" from={1019} durationInFrames={151}>
          <Shot trimBefore={1019} originX={52} originY={28} scaleFrom={1.45} scaleTo={1.4} punch={1.08} fadeIn={1} slideFrom={0} />
        </Sequence>
        <Sequence name="10 Wide" from={1160} durationInFrames={130}>
          <Shot trimBefore={1160} originX={50} originY={42} scaleFrom={1.04} scaleTo={1.09} punch={1} fadeIn={10} slideFrom={0} />
        </Sequence>
        <Sequence name="11 Punch close" from={1289} durationInFrames={136}>
          <Shot trimBefore={1289} originX={48} originY={30} scaleFrom={1.3} scaleTo={1.35} punch={1.07} fadeIn={1} slideFrom={0} />
        </Sequence>
        <Sequence name="12 Drift left" from={1415} durationInFrames={130}>
          <Shot trimBefore={1415} originX={56} originY={34} scaleFrom={1.18} scaleTo={1.13} punch={1} fadeIn={10} slideFrom={-6} />
        </Sequence>
        <Sequence name="13 Pull out" from={1533} durationInFrames={111}>
          <Shot trimBefore={1533} originX={50} originY={40} scaleFrom={1.1} scaleTo={1.02} punch={1} fadeIn={12} slideFrom={0} />
        </Sequence>
      </AbsoluteFill>

      <AbsoluteFill
        name="Vignette"
        style={{
          background:
            "radial-gradient(ellipse 78% 62% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
