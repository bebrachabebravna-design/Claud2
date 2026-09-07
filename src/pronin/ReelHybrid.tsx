import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { displayFont } from "../fonts";
import { ACCENT, MODE, Mode, sec } from "./theme";
import { Defocus, Ground, Sweep } from "./Chrome";
import { ChapterTitle, Label, Selected, WordLine } from "./Type";
import { Icon3D } from "./Cards";
import { DottedRun } from "./Flow";
import { DemoWindow, Pin } from "./Device";
import { Cue, SfxTrack, ticks } from "./Sound";

/**
 * Test piece for the hybrid format: the reference's graphic language with the
 * real product recording cut into the middle of it.
 *
 * The recording is 1152x720 landscape, so it never fills a 1080x1920 frame.
 * Rather than crop it to portrait and upscale 2.7x, it sits in a browser window
 * the way every interface in the references does, and the reading is carried by
 * pins set in our own type over the top — the references' own mock text is
 * illegible at reel size too, and it does not matter, because the large overlaid
 * words carry the meaning.
 *
 * Sound follows the reference rule: every arrival has a cue, and no cue plays
 * without something arriving.
 */

const CH = {
  hook: [0, 5.4],
  proof: [5.4, 14.0],
  close: [14.0, 19.2],
} as const;

export const HYBRID_DURATION = sec(CH.close[1]);
const SWEEP = 14;

/**
 * Where in the recording the proof chapter starts, and how fast it runs.
 *
 * Measured off the file: the source document opens at 32.3s and closes again at
 * 34.6s — the money shot is 2.3 seconds long. At 0.66x it stretches to three
 * and a half seconds on screen, which is the least this beat can be held and
 * still be read. Slowing a screen recording is invisible; freezing it is not.
 */
const DEMO_IN = 30.0;
const DEMO_RATE = 0.53;

const Chapter: React.FC<{
  mode: Mode;
  from: number;
  to: number;
  children: React.ReactNode;
  head?: boolean;
  tail?: boolean;
}> = ({ mode, from, to, children, head = true, tail = true }) => {
  const dur = sec(to) - sec(from);
  return (
    <Sequence from={sec(from)} durationInFrames={dur} layout="none">
      <AbsoluteFill>
        <Ground mode={mode} />
        <Defocus at={dur - SWEEP} durationInFrames={SWEEP} active={tail}>
          {children}
        </Defocus>
      </AbsoluteFill>
      {head ? (
        <Sequence durationInFrames={SWEEP} layout="none">
          <Sweep toward={mode} durationInFrames={SWEEP} />
        </Sequence>
      ) : null}
    </Sequence>
  );
};

/** 1. The promise. */
const Hook: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", paddingTop: 430, gap: 44 }}>
    <Icon3D name="ai-chip" size={300} float />
    <WordLine
      mode="dark"
      from={4}
      words={[{ text: "спросил" }, { text: "обычными" }, { text: "словами" }]}
    />
    <WordLine mode="dark" from={22} words={[{ text: "ответ" }, { text: "за 5 секунд", select: true }]} />
    <Sequence from={52} layout="none">
      <Label mode="dark" size={34}>
        и сразу видно, из какого пункта
      </Label>
    </Sequence>
  </AbsoluteFill>
);

/**
 * 2. The proof — the recording itself.
 *
 * The window holds the chat while the answer is on screen, then travels into
 * the opened document as the source clause appears. That move is the whole
 * point of the chapter: the claim and its receipt in one continuous shot.
 */
const Proof: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 230, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="вот"
        right="как это"
        size={80}
        object={<Icon3D name="magnifier" size={110} float />}
      />
    </div>

    <div style={{ position: "absolute", top: 630, left: 50 }}>
      <DemoWindow
        mode="light"
        src="demo-app.mp4"
        startFrom={DEMO_IN}
        playbackRate={DEMO_RATE}
        width={980}
        delay={6}
        focus={[0.60, 0.26, 2.0]}
        focusTo={[0.727, 0.60, 2.3]}
        moveOver={[130, 175]}
      />

      {/* Phase one: name what the answer is, while the chat is on screen. */}
      <Sequence from={34} durationInFrames={76} layout="none">
        <Pin mode="light" x={600} y={175} side="left" label="отвечает по вашим документам" />
      </Sequence>
      <Sequence from={76} durationInFrames={50} layout="none">
        <Pin mode="light" x={430} y={470} label="и показывает пункт" />
      </Sequence>

      {/* Phase two: after the travel, the document itself. */}
      <Sequence from={182} durationInFrames={70} layout="none">
        <Pin mode="light" x={372} y={291} label="вот он — пункт 1.2" />
      </Sequence>
    </div>

    <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center" }}>
      <Sequence from={200} layout="none">
        <Label mode="light" size={36} color={MODE.light.ink}>
          не пересказ — сам документ
        </Label>
      </Sequence>
    </div>
  </AbsoluteFill>
);

/** 3. The three-step close. */
const Close: React.FC = () => {
  const steps = [
    { icon: "folder", label: "документы", d: 4 },
    { icon: "ai-chip", label: "агент", d: 20 },
    { icon: "documents-approved", label: "ответ + пункт", d: 36 },
  ];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
        }}
      >
        {steps.map((s, i) => (
          <Sequence key={s.icon} from={s.d} layout="none">
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
            >
              <Icon3D name={s.icon} size={190} float phase={i * 1.4} />
              <Label mode="dark" size={30} delay={4}>
                {s.label}
              </Label>
            </div>
          </Sequence>
        ))}
      </div>
      <DottedRun mode="dark" x={318} y={600} width={80} dots={5} delay={16} />
      <DottedRun mode="dark" x={672} y={600} width={80} dots={5} delay={32} />

      <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <WordLine
          mode="dark"
          from={54}
          size={64}
          words={[{ text: "локально." }, { text: "сервер в РФ." }, { text: "152-ФЗ", hit: true }]}
        />
      </div>

      <div
        style={{ position: "absolute", top: 1160, left: 0, right: 0, display: "flex", justifyContent: "center" }}
      >
        <Sequence from={82} layout="none">
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Icon3D name="logo-telegram" size={120} float />
            <Selected mode="dark" delay={8}>
              <span
                style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 78, letterSpacing: -1 }}
              >
                аудит
              </span>
            </Selected>
          </div>
        </Sequence>
      </div>
      <div style={{ position: "absolute", top: 1370, left: 0, right: 0, textAlign: "center" }}>
        <Sequence from={104} layout="none">
          <Label mode="dark" size={32}>
            напишите это слово — пришлю чек-лист и разбор
          </Label>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Cue sheet. Times are seconds from the start of the composition, so they can be
 * read against the chapter table above without converting frames in your head.
 */
const CUES: Cue[] = [
  // Hook
  { at: 0.0, sfx: "whoosh2", volume: 0.3 },
  { at: 0.1, sfx: "digital", volume: 0.28 },
  ...ticks(0.2, 3),
  { at: 0.78, sfx: "tick", volume: 0.24 },
  { at: 0.95, sfx: "digital2", volume: 0.32 },
  { at: 1.8, sfx: "tick3", volume: 0.18 },

  // Proof
  { at: 5.4, sfx: "whoosh", volume: 0.34 },
  { at: 5.6, sfx: "data", volume: 0.26 },
  { at: 6.8, sfx: "tick2", volume: 0.26 },
  { at: 8.6, sfx: "tick", volume: 0.26 },
  { at: 9.7, sfx: "digital3", volume: 0.3 },
  { at: 10.2, sfx: "data2", volume: 0.24 },
  { at: 11.5, sfx: "tick3", volume: 0.26 },

  // Close
  { at: 14.0, sfx: "whoosh2", volume: 0.34 },
  { at: 14.15, sfx: "pop", volume: 0.26 },
  { at: 14.65, sfx: "pop", volume: 0.26 },
  { at: 15.2, sfx: "pop", volume: 0.26 },
  ...ticks(15.8, 3),
  { at: 16.75, sfx: "digital2", volume: 0.3 },
  { at: 17.5, sfx: "tick", volume: 0.2 },
];

export const ReelHybrid: React.FC = () => (
  <AbsoluteFill style={{ background: MODE.dark.bg }}>
    <Chapter mode="dark" from={CH.hook[0]} to={CH.hook[1]} head={false}>
      <Hook />
    </Chapter>
    <Chapter mode="light" from={CH.proof[0]} to={CH.proof[1]}>
      <Proof />
    </Chapter>
    <Chapter mode="dark" from={CH.close[0]} to={CH.close[1]} tail={false}>
      <Close />
    </Chapter>
    <SfxTrack cues={CUES} />
  </AbsoluteFill>
);

export { ACCENT };
