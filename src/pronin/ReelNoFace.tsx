import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, uiFont } from "../fonts";
import { MODE, Mode, R, sec } from "./theme";
import { Ground } from "./Chrome";
import { CountUp } from "./Type";
import { Chip, Icon3D, Panel } from "./Cards";
import { DottedRun } from "./Flow";
import { Caption, CAP_YELLOW } from "./Caps";
import { Cue, SfxTrack } from "./Sound";
import { CAPS, REEL_END, TRIM, t } from "./cifra-data";

/** Higher than the hybrid cut: on a flat canvas the words are part of the
 *  composition rather than a subtitle strip under a face. */
const CAP_TOP = 1140;

/**
 * «Самая дорогая статья расходов» — faceless cut.
 *
 * Same voice track, no camera at all. This is the version built directly to the
 * numbers measured off the reference reels rather than to a description of them:
 *
 *   * roughly half the running time the frame is completely still, so that the
 *     other half reads as event rather than as noise;
 *   * about one arrival per second — the references land 10 to 12.6 per ten
 *     seconds, against 6.7 in the hybrid cut;
 *   * near-monochrome, one accent (their saturation is 0.06–0.10; the hybrid
 *     was 0.166 because a lit room colours every pixel);
 *   * two grounds and nothing in between — the references spend 0–8% of their
 *     time at mid brightness, the hybrid spent 43%;
 *   * action in the middle band, where the eye already is.
 *
 * Removing the face is what makes all five reachable at once: a person on
 * camera cannot hold still, cannot be monochrome, and occupies the centre.
 */

export const NOFACE_DURATION = sec(REEL_END);

/** Two worlds, alternating on the chapter boundaries. */
const GROUNDS: { at: number; mode: Mode }[] = [
  { at: 0, mode: "dark" },
  { at: t(10.16), mode: "light" },
  { at: t(16.16), mode: "dark" },
  { at: t(20.98), mode: "light" },
  { at: t(25.88), mode: "dark" },
  { at: t(32.06), mode: "light" },
  { at: t(36.22), mode: "dark" },
  { at: t(44.22), mode: "light" },
];

const Grounds: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  let i = 0;
  for (let k = 0; k < GROUNDS.length; k++) if (now >= GROUNDS[k].at) i = k;
  const p =
    i === 0
      ? 1
      : interpolate(frame, [sec(GROUNDS[i].at), sec(GROUNDS[i].at) + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const prev = i > 0 ? GROUNDS[i - 1].mode : GROUNDS[0].mode;
  return (
    <>
      <Ground mode={prev} />
      <AbsoluteFill style={{ opacity: p }}>
        <Ground mode={GROUNDS[i].mode} />
      </AbsoluteFill>
    </>
  );
};

const modeAt = (s: number): Mode => {
  let m: Mode = "dark";
  for (const g of GROUNDS) if (s >= g.at) m = g.mode;
  return m;
};

/* ------------------------------------------------------------------ */

const Beat: React.FC<{ at: number; dur: number; children: React.ReactNode }> = ({
  at,
  dur,
  children,
}) => (
  <Sequence from={sec(at)} durationInFrames={sec(dur)} layout="none">
    {children}
  </Sequence>
);

const usePop = (delay = 0, cfg = { damping: 14, stiffness: 170, mass: 0.85 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: cfg });
};

/** Wrapper giving anything the house arrival and departure. */
const In: React.FC<{
  children: React.ReactNode;
  delay?: number;
  life?: number;
  y?: number;
  x?: number;
  scale?: number;
}> = ({ children, delay = 0, life, y = 34, x = 0, scale = 0.88 }) => {
  const frame = useCurrentFrame();
  const e = usePop(delay);
  const out = life
    ? interpolate(frame, [delay + life - 9, delay + life], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  return (
    <div
      style={{
        opacity: e * out,
        transform: `translate(${(1 - e) * x}px, ${(1 - e) * y}px) scale(${interpolate(
          e,
          [0, 1],
          [scale, 1]
        )})`,
        filter: `blur(${(1 - e) * 7}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Center: React.FC<{ top: number; children: React.ReactNode; gap?: number }> = ({
  top,
  children,
  gap = 26,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
    }}
  >
    {children}
  </div>
);

/** Big display figure. */
const Fig: React.FC<{
  children: React.ReactNode;
  mode: Mode;
  size?: number;
  color?: string;
}> = ({ children, mode, size = 172, color }) => (
  <div
    style={{
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: -3,
      lineHeight: 1,
      color: color ?? MODE[mode].ink,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const Sub: React.FC<{ children: React.ReactNode; mode: Mode; size?: number }> = ({
  children,
  mode,
  size = 36,
}) => (
  <div style={{ fontFamily: uiFont, fontWeight: 500, fontSize: size, color: MODE[mode].mute }}>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Chapter 1 — the line that is in no report                            */

/**
 * A ledger with one line missing.
 *
 * The whole hook is "this cost is real and it is not written anywhere", so the
 * graphic is a report that fills in correctly and then turns out to have a
 * blank row — the point is made by an absence, which is far stronger than any
 * icon of money.
 */
const Ledger: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const rows = ["аренда", "зарплаты", "налоги", "закупка", "реклама"];
  // After this frame the filled rows dim and the empty one takes over.
  const reveal = interpolate(frame, [74, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Panel mode={mode} width={820} pad={30} radius={R.panel} delay={2}>
      <div style={{ fontFamily: uiFont, fontWeight: 600, fontSize: 30, color: m.mute }}>
        отчёт о расходах
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
        {rows.map((r, i) => {
          const e = spring({
            frame: frame - (10 + i * 11),
            fps: 30,
            config: { damping: 16, stiffness: 200, mass: 0.6 },
          });
          return (
            <div
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderRadius: 18,
                background: m.inset,
                border: `1px solid ${m.cardLine}`,
                opacity: e * (1 - reveal * 0.72),
                transform: `translateX(${(1 - e) * -22}px)`,
              }}
            >
              <span style={{ fontFamily: uiFont, fontSize: 32, color: m.ink }}>{r}</span>
              <span style={{ fontFamily: uiFont, fontSize: 30, color: m.mute }}>
                {["420 000", "1 850 000", "610 000", "2 300 000", "180 000"][i]} ₽
              </span>
            </div>
          );
        })}
        {/* The row that is not there. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderRadius: 18,
            border: `2px dashed ${reveal > 0.2 ? CAP_YELLOW : m.cardLine}`,
            opacity: interpolate(frame, [60, 76], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `scale(${interpolate(reveal, [0, 1], [0.97, 1.03])})`,
          }}
        >
          <span
            style={{
              fontFamily: uiFont,
              fontSize: 32,
              color: reveal > 0.3 ? CAP_YELLOW : m.mute,
              fontWeight: 600,
            }}
          >
            ??????
          </span>
          <span style={{ fontFamily: uiFont, fontSize: 30, color: m.mute }}>— ₽</span>
        </div>
      </div>
    </Panel>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter 3 — the working day, and how much of it is search            */

const DayBar: React.FC<{ mode: Mode; litFrom: number }> = ({ mode, litFrom }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const lit = i < 1.5;
        const e = spring({
          frame: frame - (litFrom + i * 7),
          fps: 30,
          config: { damping: 16, stiffness: 210, mass: 0.6 },
        });
        return (
          <div
            key={i}
            style={{
              width: 118,
              height: 62,
              borderRadius: 12,
              background: lit ? CAP_YELLOW : m.inset,
              border: `1px solid ${m.cardLine}`,
              opacity: e,
              transform: `scaleY(${interpolate(e, [0, 1], [0.4, 1])})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter 4/5 — the measurement                                        */

/** A stopwatch panel that actually runs, then stops on the answer. */
const Timer: React.FC<{ mode: Mode; runFor: number; stopAt: string }> = ({
  mode,
  runFor,
  stopAt,
}) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const p = Math.min(1, frame / runFor);
  const done = frame >= runFor;
  const secs = Math.round(p * 11 * 60);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pop = done
    ? spring({ frame: frame - runFor, fps: 30, config: { damping: 11, stiffness: 220, mass: 0.6 } })
    : 0;
  return (
    <Panel mode={mode} width={620} pad={30} radius={R.panel}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: uiFont, fontSize: 30, color: m.mute, marginBottom: 10 }}>
          ответ на обычный вопрос клиента
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 140,
            letterSpacing: -2,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: done ? CAP_YELLOW : m.ink,
            transform: `scale(${1 + pop * 0.08})`,
          }}
        >
          {done ? stopAt : `${mm}:${ss}`}
        </div>
      </div>
    </Panel>
  );
};

/** 24 tiles, one per manager. */
const Crew: React.FC<{ mode: Mode; delay: number }> = ({ mode, delay }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        width: 820,
        justifyContent: "center",
      }}
    >
      {Array.from({ length: 24 }).map((_, i) => {
        const e = spring({
          frame: frame - (delay + i * 3.4),
          fps: 30,
          config: { damping: 15, stiffness: 260, mass: 0.5 },
        });
        return (
          <div
            key={i}
            style={{
              width: 78,
              height: 78,
              borderRadius: 22,
              background: m.inset,
              border: `1px solid ${m.cardLine}`,
              opacity: e,
              transform: `scale(${interpolate(e, [0, 1], [0.3, 1])})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8.5" r="3.6" stroke={m.mute} strokeWidth="1.8" />
              <path d="M5 20a7 7 0 0114 0" stroke={m.mute} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter 7 — the race                                                 */

const Race: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const you = interpolate(frame, [0, 90], [0, 0.55], { extrapolateRight: "clamp" });
  const rival = interpolate(frame, [0, 90], [0, 0.92], { extrapolateRight: "clamp" });
  const row = (label: string, v: number, hot: boolean, delay: number) => {
    const e = spring({ frame: frame - delay, fps: 30, config: { damping: 16, stiffness: 200, mass: 0.7 } });
    return (
      <div style={{ opacity: e, width: 820 }}>
        <div style={{ fontFamily: uiFont, fontSize: 30, color: hot ? CAP_YELLOW : m.mute, marginBottom: 8 }}>
          {label}
        </div>
        <div
          style={{
            height: 42,
            borderRadius: 14,
            background: m.inset,
            border: `1px solid ${m.cardLine}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${v * 100}%`,
              height: "100%",
              background: hot ? CAP_YELLOW : m.mute,
              borderRadius: 14,
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {row("ты", you, false, 0)}
      {row("конкурент", rival, true, 12)}
    </div>
  );
};

/* ------------------------------------------------------------------ */

const Graphics: React.FC = () => (
  <>
    {/* 1. The ledger with the missing line. 0.4 – 8.4 */}
    <Beat at={0.4} dur={8.0}>
      <Center top={560}>
        <Ledger mode="dark" />
      </Center>
      <Beat at={3.0} dur={2.2}>
        <div style={{ position: "absolute", right: 90, top: 430 }}>
          <Icon3D name="magnifier" size={330} float life={sec(2.2)} fromX={150} fromY={-40} />
        </div>
      </Beat>
      <Beat at={5.3} dur={2.6}>
        <div style={{ position: "absolute", left: 80, top: 430 }}>
          <Icon3D name="target-arrow" size={330} float life={sec(2.6)} fromX={-150} spin={24} />
        </div>
      </Beat>
    </Beat>

    {/* 2. The search itself. 8.9 – 14.5 */}
    <Beat at={8.9} dur={5.6}>
      <Center top={500} gap={40}>
        <In delay={0}>
          <Icon3D name="folder" size={280} float />
        </In>
      </Center>
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {["договоры", "прайсы", "регламенты"].map((c, i) => (
          <In key={c} delay={10 + i * 9}>
            <Chip mode="light">{c}</Chip>
          </In>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <In key={i} delay={46 + i * 9} y={54}>
            <Icon3D name="folder" size={168} float phase={i} />
          </In>
        ))}
      </div>
      <Beat at={2.6} dur={2.9}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center" }}>
          <Icon3D name="magnifier" size={310} float life={sec(2.9)} fromY={90} />
        </div>
      </Beat>
    </Beat>

    {/* 3. An hour and a half of every day. 14.7 – 19.3 */}
    <Beat at={14.7} dur={4.6}>
      <Center top={540} gap={18}>
        <In delay={4}>
          <Sub mode="dark">по исследованиям, в среднем</Sub>
        </In>
        <In delay={16} scale={0.7}>
          <Fig mode="dark">1,5 часа</Fig>
        </In>
        <In delay={30}>
          <Sub mode="dark">в день на человека</Sub>
        </In>
      </Center>
      <Center top={950} gap={18}>
        <In delay={52}>
          <DayBar mode="dark" litFrom={52} />
        </In>
        <In delay={78}>
          <Sub mode="dark" size={30}>рабочий день — 8 часов</Sub>
        </In>
      </Center>
    </Beat>

    {/* 4. Who the case is about. 19.6 – 25.6 */}
    <Beat at={19.6} dur={6.0}>
      <Center top={500} gap={26}>
        <In delay={2}>
          <Icon3D name="users-group" size={310} float />
        </In>
        <div style={{ display: "flex", gap: 18 }}>
          <In delay={14}>
            <Chip mode="light">дистрибьютор</Chip>
          </In>
          <In delay={22}>
            <Chip mode="light">бытовая техника</Chip>
          </In>
        </div>
      </Center>
      <Center top={840}>
        <In delay={40}>
          <Crew mode="light" delay={40} />
        </In>
      </Center>
    </Beat>

    {/* 5. The measurement and the money. 25.9 – 32.0 */}
    <Beat at={25.9} dur={6.1}>
      <Center top={430}>
        <In delay={2}>
          <Timer mode="dark" runFor={sec(2.6)} stopAt="11:00" />
        </In>
      </Center>
      <Beat at={2.9} dur={3.1}>
        <Center top={760} gap={16}>
          <In delay={0} scale={0.7}>
            <Fig mode="dark" size={150} color={CAP_YELLOW}>
              11 минут
            </Fig>
          </In>
          <In delay={14}>
            <Sub mode="dark">на один вопрос</Sub>
          </In>
        </Center>
      </Beat>
      <Beat at={4.0} dur={2.1}>
        <Center top={930} gap={12}>
          <In delay={0} scale={0.75}>
            <div style={{ textAlign: "center" }}>
              <CountUp mode="dark" to={238000} durationInFrames={30} size={140} suffix=" ₽" />
            </div>
          </In>
          <In delay={18}>
            <Sub mode="dark">в месяц — на одном отделе</Sub>
          </In>
        </Center>
      </Beat>
    </Beat>

    {/* 6. The seventh folder, and the owner who was sure. 32.2 – 36.0 */}
    <Beat at={32.2} dur={3.8}>
      <Center top={560} gap={34}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, width: 760, justifyContent: "center" }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const last = i === 6;
            return (
              <In key={i} delay={i * 8} y={46}>
                <div style={{ opacity: last ? 1 : 0.38, filter: last ? "none" : "grayscale(0.6)" }}>
                  <Icon3D name="folder" size={last ? 168 : 138} float={last} phase={i} />
                </div>
              </In>
            );
          })}
        </div>
      </Center>
      <Beat at={1.6} dur={2.2}>
        <Center top={920}>
          <In delay={0} life={sec(2.2)}>
            <Panel mode="light" width={760} pad={26} radius={R.card}>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 36,
                  color: MODE.light.ink,
                  textAlign: "center",
                }}
              >
                а собственник был уверен, что{" "}
                <span style={{ color: MODE.light.mute }}>«у него порядок»</span>
              </div>
            </Panel>
          </In>
        </Center>
      </Beat>
    </Beat>

    {/* 7. The competitor. 36.4 – 44.0 */}
    <Beat at={36.4} dur={7.6}>
      <Center top={470} gap={28}>
        <In delay={2}>
          <Icon3D name="target-arrow" size={330} float />
        </In>
        <div style={{ display: "flex", gap: 18 }}>
          <In delay={16}>
            <Chip mode="dark">нашёл заранее</Chip>
          </In>
          <In delay={26}>
            <Chip mode="dark">убрал через ИИ</Chip>
          </In>
          <In delay={36}>
            <Chip mode="dark" icon={<Icon3D name="ai-chip" size={34} />}>
              посчитал
            </Chip>
          </In>
        </div>
      </Center>
      <Beat at={2.0} dur={5.6}>
        <Center top={800}>
          <In delay={0}>
            <Race mode="dark" />
          </In>
        </Center>
      </Beat>
      <Beat at={3.8} dur={3.8}>
        <div style={{ position: "absolute", right: 90, top: 1080 }}>
          <Icon3D name="rocket-launch" size={340} float life={sec(3.8)} fromY={190} spin={-28} />
        </div>
      </Beat>
      <Beat at={4.4} dur={1.0}>
        <Center top={1090}>
          <In delay={0} life={sec(1.0)}>
            <Sub mode="dark" size={34}>та же выручка, меньше затрат</Sub>
          </In>
        </Center>
      </Beat>
      <Beat at={5.2} dur={2.4}>
        <Center top={1120}>
          <In delay={0} life={sec(2.4)}>
            <div
              style={{
                background: CAP_YELLOW,
                color: "#0B0B0C",
                borderRadius: 20,
                padding: "12px 34px",
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 74,
              }}
            >
              + 238 000 ₽/мес
            </div>
          </In>
        </Center>
      </Beat>
    </Beat>

    {/* 8. The ask. 44.3 – 50.4 */}
    <Beat at={44.3} dur={6.2}>
      <Center top={380} gap={30}>
        <In delay={2}>
          <Icon3D name="chat-bubbles" size={330} float />
        </In>
      </Center>
      <Center top={790} gap={22}>
        <In delay={22}>
          <Sub mode="light" size={40}>напиши в комментариях</Sub>
        </In>
        <In delay={32} scale={0.6}>
          <div
            style={{
              background: CAP_YELLOW,
              borderRadius: 26,
              padding: "14px 52px",
              boxShadow: "0 26px 60px rgba(0,0,0,0.16)",
            }}
          >
            <span
              style={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 132,
                letterSpacing: -3,
                color: "#0B0B0C",
              }}
            >
              цифру
            </span>
          </div>
        </In>
      </Center>
      <DottedRun mode="light" x={460} y={1050} width={160} dots={5} delay={54} />
      <Beat at={2.6} dur={3.6}>
        <div style={{ position: "absolute", right: 110, top: 470 }}>
          <In delay={0}>
            <Icon3D name="documents-approved" size={190} float />
          </In>
        </div>
      </Beat>
    </Beat>
  </>
);

/* ------------------------------------------------------------------ */

const CUES: Cue[] = [
  ...GROUNDS.slice(1).map((g, i): Cue => ({
    at: g.at,
    sfx: i % 2 ? "whoosh" : "whoosh2",
    volume: 0.3,
  })),
  ...CAPS.map((c): Cue => ({ at: c.from, sfx: "tick", volume: 0.13 })),
  // Ledger rows.
  ...Array.from({ length: 5 }, (_, i): Cue => ({
    at: 0.73 + i * 0.3,
    sfx: (["tick2", "tick3"] as const)[i % 2],
    volume: 0.2,
  })),
  { at: 2.4, sfx: "data", volume: 0.24 },
  { at: 3.0, sfx: "pop", volume: 0.26 },
  { at: 4.9, sfx: "digital2", volume: 0.32 },
  { at: 5.3, sfx: "digital", volume: 0.28 },
  // Folder pile.
  ...Array.from({ length: 5 }, (_, i): Cue => ({
    at: 10.43 + i * 0.233,
    sfx: (["tick2", "tick3", "pop"] as const)[i % 3],
    volume: 0.22,
  })),
  { at: 11.5, sfx: "data2", volume: 0.24 },
  { at: 15.23, sfx: "digital3", volume: 0.34 },
  { at: 16.43, sfx: "data", volume: 0.24 },
  { at: 19.67, sfx: "pop", volume: 0.26 },
  { at: 20.93, sfx: "digital", volume: 0.24 },
  { at: 23.2, sfx: "data2", volume: 0.28 },
  { at: 25.97, sfx: "data", volume: 0.26 },
  { at: 28.5, sfx: "digital2", volume: 0.34 },
  { at: 29.9, sfx: "digital3", volume: 0.34 },
  ...Array.from({ length: 7 }, (_, i): Cue => ({
    at: 32.2 + i * 0.167,
    sfx: i === 6 ? "digital2" : "tick3",
    volume: i === 6 ? 0.32 : 0.15,
  })),
  { at: 36.47, sfx: "pop", volume: 0.26 },
  { at: 38.4, sfx: "data2", volume: 0.26 },
  { at: 40.2, sfx: "digital", volume: 0.3 },
  { at: 41.6, sfx: "digital3", volume: 0.34 },
  { at: 44.37, sfx: "pop", volume: 0.28 },
  { at: 45.4, sfx: "digital2", volume: 0.34 },
  { at: 46.9, sfx: "data", volume: 0.24 },
];

export const ReelNoFace: React.FC = () => (
  <AbsoluteFill style={{ background: MODE.dark.bg }}>
    <Grounds />
    <Graphics />

    {CAPS.map((c) => {
      const dur = sec(c.to) - sec(c.from);
      const mode = modeAt(c.from);
      return (
        <Sequence key={c.from} from={sec(c.from)} durationInFrames={dur} layout="none">
          <div
            style={{
              position: "absolute",
              top: CAP_TOP,
              left: 70,
              right: 70,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* On a flat canvas the white caption needs the light ground to
                darken behind it, so light chapters get ink-coloured text. */}
            <CaptionOnGround words={c.words} durationInFrames={dur} mode={mode} />
          </div>
        </Sequence>
      );
    })}

    <Audio src={staticFile("speaker-cifra.mp4")} startFrom={sec(TRIM)} />
    <SfxTrack cues={CUES} />
  </AbsoluteFill>
);

/**
 * Captions have to survive both worlds. White works on the dark ground; on the
 * near-white one it would disappear, so the non-accent words flip to ink while
 * the accent stays yellow with a dark edge.
 */
const CaptionOnGround: React.FC<{
  words: React.ComponentProps<typeof Caption>["words"];
  durationInFrames: number;
  mode: Mode;
}> = ({ words, durationInFrames, mode }) =>
  (
    <Caption
      words={words}
      durationInFrames={durationInFrames}
      size={64}
      onVideo={mode === "dark"}
      base={mode === "dark" ? "#FFFFFF" : MODE.light.ink}
    />
  );
