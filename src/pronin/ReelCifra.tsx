import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, uiFont } from "../fonts";
import { ACCENT, ALERT, FPS, MODE, Mode, OK, POP, R, sec } from "./theme";
import { Defocus, Ground, Sweep } from "./Chrome";
import { ChapterTitle, CountUp, Label, Selected, WordLine } from "./Type";
import { Chip, Icon3D, Panel, Stat } from "./Cards";
import { DottedRun } from "./Flow";
import { Cue, SfxTrack } from "./Sound";
import { BEATS, CHAPTERS, Chap, PHRASES, REEL_END, TRIM } from "./cifra-data";

/**
 * «Самая дорогая статья расходов» — the full reel, in the reference style.
 *
 * The take is a static talking head, so the edit alternates two grounds: the
 * face full frame for the claims a person has to be trusted for, and the pure
 * canvas for everything that is really a number. Chapters join with the light
 * sweep and never hard-cut, exactly as in the references.
 *
 * The voice runs as its own track across the whole composition, so it keeps
 * going while the picture leaves the speaker — which is what makes the graphic
 * chapters read as illustration rather than as an interruption.
 */

export const CIFRA_DURATION = sec(REEL_END);
const SWEEP = 14;

/* ------------------------------------------------------------------ */

/**
 * The take, full frame, with a slow push so a locked-off camera never sits
 * still, and a soft scrim top and bottom so white type stays legible over the
 * lit wall without a plate under it.
 */
const Speaker: React.FC<{ chap: Chap; durationInFrames: number }> = ({
  chap,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const [z0, z1] = chap.zoom ?? [1, 1.05];
  const z = interpolate(frame, [0, durationInFrames], [z0, z1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo
          src={staticFile("speaker-cifra.mp4")}
          startFrom={Math.round((chap.from + TRIM) * FPS)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `50% ${chap.oy ?? 44}%`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,6,14,0.45) 0%, rgba(8,6,14,0) 26%, rgba(8,6,14,0) 52%, rgba(8,6,14,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** A spoken line, held only while it is being said. */
const Phrase: React.FC<{
  words: React.ComponentProps<typeof WordLine>["words"];
  size?: number;
  top: number;
  durationInFrames: number;
  mode: Mode;
  /** Set on speaker chapters, where the ground is a lit wall rather than a flat
   *  canvas and the canvas grey would disappear into it. */
  onVideo?: boolean;
}> = ({ words, size = 66, top, durationInFrames, mode, onVideo }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        display: "flex",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <WordLine
        mode={mode}
        words={words}
        size={size}
        stagger={3}
        muted={onVideo ? "rgba(255,255,255,0.78)" : undefined}
        shadow={onVideo ? "0 3px 22px rgba(0,0,0,0.55)" : undefined}
      />
    </div>
  );
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: POP });
};

/** Object that flies in beside the speaker, on the beat of a word. */
const SideObject: React.FC<{
  name: string;
  size?: number;
  left?: number;
  right?: number;
  top: number;
}> = ({ name, size = 190, left, right, top }) => {
  const e = usePop(0);
  return (
    <div
      style={{
        position: "absolute",
        left,
        right,
        top,
        opacity: e,
        transform: `scale(${interpolate(e, [0, 1], [0.4, 1])}) rotate(${(1 - e) * -14}deg)`,
      }}
    >
      <Icon3D name={name} size={size} float />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Graphic chapters                                                     */

/** 2. What the invisible cost actually is: the search itself. */
const SearchChapter: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 250, left: 0, right: 0 }}>
        <ChapterTitle
          mode="light"
          left="это"
          right="время"
          size={96}
          object={<Icon3D name="magnifier" size={116} float />}
        />
      </div>
      {/* Folders piling up one per beat: the pile is the point, not any one of
          them, so they land fast and slightly scattered. */}
      {Array.from({ length: 6 }).map((_, i) => {
        const e = spring({ frame: frame - (14 + i * 7), fps: FPS, config: POP });
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 190 + col * 250,
              top: 560 + row * 230,
              opacity: e,
              transform: `scale(${interpolate(e, [0, 1], [0.5, 1])}) rotate(${
                (i % 2 ? 5 : -5) * (1 - e * 0.6)
              }deg)`,
            }}
          >
            <Icon3D name="folder" size={175} float phase={i} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 3. The research figure, alone on a dark ground. */
const ResearchChapter: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center" }}>
      <Label mode="dark" size={36}>
        по исследованиям, в среднем
      </Label>
    </div>
    <div
      style={{
        position: "absolute",
        top: 560,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Sequence from={16} layout="none">
        <BigFigure value="1,5 часа" caption="в день на человека" mode="dark" />
      </Sequence>
    </div>
    <div style={{ position: "absolute", top: 1050, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Sequence from={22} layout="none">
        <Icon3D name="analytics-search" size={230} float />
      </Sequence>
    </div>
  </AbsoluteFill>
);

const BigFigure: React.FC<{
  value: React.ReactNode;
  caption: string;
  mode: Mode;
  color?: string;
}> = ({ value, caption, mode, color }) => {
  const e = usePop(0);
  const m = MODE[mode];
  return (
    <div style={{ textAlign: "center", opacity: e }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: 156,
          letterSpacing: -3,
          lineHeight: 1,
          color: color ?? m.ink,
          transform: `scale(${interpolate(e, [0, 1], [0.7, 1])})`,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 36, color: m.mute, marginTop: 8 }}>{caption}</div>
    </div>
  );
};

/** 5. The case: what was measured, and what it came to in money. */
const CaseChapter: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 240, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="засекли"
        right="секундомером"
        size={62}
        object={<Icon3D name="analytics-search" size={98} float />}
      />
    </div>
    <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center" }}>
      <Sequence from={10} layout="none">
        <Label mode="light" size={36}>
          за сколько менеджер отвечает на обычный вопрос
        </Label>
      </Sequence>
    </div>

    <div
      style={{
        position: "absolute",
        top: 640,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <Sequence from={112} layout="none">
        <Stat mode="light" value="11 минут" caption="на один вопрос" />
      </Sequence>
    </div>

    <div
      style={{
        position: "absolute",
        top: 830,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Sequence from={134} layout="none">
        <>
          <CountUp mode="light" to={238000} durationInFrames={36} size={150} suffix=" ₽" />
          <div style={{ textAlign: "center" }}>
            <Label mode="light" size={36} delay={20}>
              в месяц — на одном отделе
            </Label>
          </div>
        </>
      </Sequence>
    </div>

    <div style={{ position: "absolute", top: 1210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Sequence from={160} layout="none">
        <Icon3D name="growth-chart" size={220} float />
      </Sequence>
    </div>
  </AbsoluteFill>
);

/**
 * 6. The seventh folder. A row of folders where only the last one is lit is the
 * whole joke of the line, so it gets the frame to itself.
 */
const FoldersChapter: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <Label mode="dark" size={38}>
          люди просто открывают
        </Label>
      </div>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 26,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const e = spring({ frame: frame - (6 + i * 5), fps: FPS, config: POP });
          const last = i === 6;
          return (
            <div
              key={i}
              style={{
                opacity: last ? e : e * 0.62,
                transform: `scale(${interpolate(e, [0, 1], [0.5, last ? 1.2 : 1])})`,
                filter: last ? "none" : "grayscale(0.55) brightness(0.85)",
              }}
            >
              <Icon3D name="folder" size={150} float={last} phase={i} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 7. The competitor, who found the number first. */
const CompetitorChapter: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 260, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="а он"
        right="уже убрал"
        size={78}
        object={<Icon3D name="target-arrow" size={110} float />}
      />
    </div>

    <div
      style={{
        position: "absolute",
        top: 560,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 34,
      }}
    >
      <Sequence from={14} layout="none">
        <Chip mode="light" icon={<Icon3D name="ai-chip" size={34} />}>
          нашёл заранее
        </Chip>
      </Sequence>
      <Sequence from={22} layout="none">
        <Chip mode="light" icon={<Icon3D name="shield-check" size={34} />}>
          убрал через ИИ
        </Chip>
      </Sequence>
    </div>

    <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Sequence from={62} layout="none">
        <Icon3D name="rocket-launch" size={300} float />
      </Sequence>
    </div>

    <div style={{ position: "absolute", top: 1080, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Sequence from={96} layout="none">
        <Panel mode="light" width={780} pad={26} radius={R.card}>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 36,
              color: MODE.light.ink,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            обгоняет ровно{" "}
            <span style={{ fontWeight: 700, color: OK }}>на эти же деньги</span>
          </div>
        </Panel>
      </Sequence>
    </div>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */

/** Overlay graphics that sit on top of the speaker chapters. */
const HookOverlay: React.FC = () => (
  <>
    {/* Chapter 0 starts at composition frame 0, so these offsets coincide. */}
    <Sequence from={sec(4.68 - TRIM)} durationInFrames={sec(2.4)} layout="none">
      <SideObject name="analytics-search" right={70} top={640} size={200} />
    </Sequence>
    <Sequence from={sec(7.32 - TRIM)} durationInFrames={sec(2.6)} layout="none">
      <SideObject name="target-arrow" left={70} top={640} size={210} />
    </Sequence>
  </>
);

const CaseIntroOverlay: React.FC = () => (
  <Sequence from={12} layout="none">
    <div
      style={{
        position: "absolute",
        top: 700,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Chip mode="dark" icon={<Icon3D name="users-group" size={34} />}>
        24 менеджера
      </Chip>
      <Chip mode="dark" delay={6}>
        бытовая техника
      </Chip>
    </div>
  </Sequence>
);

/**
 * The close: the code word from the script, set as a selection.
 *
 * Offsets here are relative to the chapter, not to the composition — this
 * overlay is mounted inside the chapter's own Sequence.
 */
const CTA_CHAP_START = CHAPTERS[CHAPTERS.length - 1].from;

const CtaOverlay: React.FC = () => (
  <>
    <Sequence from={sec(BEATS.cta - CTA_CHAP_START)} layout="none">
      <>
        <div style={{ position: "absolute", top: 380, right: 80 }}>
          <Icon3D name="chat-bubbles" size={190} float />
        </div>
        <div
          style={{
            position: "absolute",
            top: 1030,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Label mode="dark" size={42} delay={6} color="#FFFFFF">
            напиши в комментариях
          </Label>
          <Selected mode="dark" delay={12}>
            <span
              style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 138, letterSpacing: -2 }}
            >
              цифру
            </span>
          </Selected>
        </div>
      </>
    </Sequence>
    <Sequence from={sec(BEATS.ctaTail - CTA_CHAP_START)} layout="none">
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center" }}>
        <Label mode="dark" size={40} color="rgba(255,255,255,0.9)">
          скину калькулятор потерь
        </Label>
      </div>
    </Sequence>
  </>
);

/* ------------------------------------------------------------------ */

const CHAP_EL: Record<number, React.ReactNode> = {
  1: <SearchChapter />,
  2: <ResearchChapter />,
  4: <CaseChapter />,
  5: <FoldersChapter />,
  6: <CompetitorChapter />,
};

const OVERLAY_EL: Record<number, React.ReactNode> = {
  0: <HookOverlay />,
  3: <CaseIntroOverlay />,
  7: <CtaOverlay />,
};

/**
 * Cue sheet, built from the same tables that drive the picture so a retimed
 * beat cannot silently lose its sound.
 */
const CUES: Cue[] = [
  // A sweep for every chapter boundary except the first.
  ...CHAPTERS.slice(1).map(
    (c, i): Cue => ({ at: c.from, sfx: i % 2 ? "whoosh2" : "whoosh", volume: 0.32 })
  ),
  // A soft tick as each spoken line lands.
  ...PHRASES.map((p): Cue => ({ at: p.from, sfx: "tick", volume: 0.2 })),
  // The beats that are objects or numbers rather than words.
  { at: BEATS.researchBig, sfx: "digital2", volume: 0.32 },
  { at: BEATS.minutes, sfx: "data", volume: 0.28 },
  { at: BEATS.money, sfx: "digital3", volume: 0.34 },
  { at: BEATS.folders + 0.9, sfx: "pop", volume: 0.3 },
  { at: BEATS.rocket, sfx: "data2", volume: 0.3 },
  { at: BEATS.cta, sfx: "digital", volume: 0.3 },
  { at: BEATS.cta + 0.55, sfx: "digital2", volume: 0.34 },
  // Folder pile in the search chapter.
  ...Array.from({ length: 6 }, (_, i): Cue => ({
    at: 8.66 + 0.47 + i * 0.23,
    sfx: (["tick2", "tick3", "pop"] as const)[i % 3],
    volume: 0.22,
  })),
  // The seven folders.
  ...Array.from({ length: 7 }, (_, i): Cue => ({
    at: BEATS.folders + 0.2 + i * 0.167,
    sfx: i === 6 ? "digital2" : "tick3",
    volume: i === 6 ? 0.32 : 0.16,
  })),
];

export const ReelCifra: React.FC = () => (
  <AbsoluteFill style={{ background: MODE.dark.bg }}>
    {CHAPTERS.map((c, i) => {
      const dur = sec(c.to) - sec(c.from);
      const mode: Mode = c.kind === "light" ? "light" : "dark";
      const last = i === CHAPTERS.length - 1;
      return (
        <Sequence key={i} from={sec(c.from)} durationInFrames={dur} layout="none">
          <AbsoluteFill>
            {c.kind === "speaker" ? (
              <Speaker chap={c} durationInFrames={dur} />
            ) : (
              <Ground mode={mode} />
            )}
            <Defocus at={dur - SWEEP} durationInFrames={SWEEP} active={!last}>
              <AbsoluteFill>
                {CHAP_EL[i] ?? null}
                {OVERLAY_EL[i] ?? null}
                {/* Lines are placed against the composition clock, then offset
                    into this chapter, so a phrase never has to be re-timed when
                    a chapter boundary moves. */}
                {PHRASES.filter((p) => p.from >= c.from - 0.001 && p.from < c.to).map((p) => (
                  <Sequence
                    key={p.from}
                    from={sec(p.from) - sec(c.from)}
                    durationInFrames={sec(p.to) - sec(p.from)}
                    layout="none"
                  >
                    <Phrase
                      words={p.words}
                      size={p.size}
                      top={p.top}
                      durationInFrames={sec(p.to) - sec(p.from)}
                      mode={c.kind === "light" ? "light" : "dark"}
                      onVideo={c.kind === "speaker"}
                    />
                  </Sequence>
                ))}
              </AbsoluteFill>
            </Defocus>
          </AbsoluteFill>
          {i > 0 ? (
            <Sequence durationInFrames={SWEEP} layout="none">
              <Sweep toward={mode} durationInFrames={SWEEP} />
            </Sequence>
          ) : null}
        </Sequence>
      );
    })}

    {/* The voice runs unbroken under the whole edit. */}
    <Audio src={staticFile("speaker-cifra.mp4")} startFrom={sec(TRIM)} />
    <SfxTrack cues={CUES} />
  </AbsoluteFill>
);

export { ACCENT, ALERT, DottedRun };
