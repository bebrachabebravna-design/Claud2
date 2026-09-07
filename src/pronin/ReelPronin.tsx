import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { displayFont, uiFont } from "../fonts";
import { ACCENT, ALERT, MODE, Mode, OK, R, sec } from "./theme";
import { Defocus, Ground, Sweep } from "./Chrome";
import { ChapterTitle, CountUp, Label, Selected, WordLine } from "./Type";
import { AppCard, Chip, IconTile, Obj, Panel, Stat } from "./Cards";
import { DottedArc, DottedLoop, DottedRun } from "./Flow";
import {
  Avatar,
  BanGlyph,
  BoltGlyph,
  ChannelCard,
  DocGlyph,
  PromptSheet,
  ShieldGlyph,
  TelegramGlyph,
  Toggle,
} from "./Ui";

/**
 * Neirodocs reel built in the reference style.
 *
 * The structure follows what the references actually do, which is not what our
 * earlier reels did: six chapters, each a single continuous canvas, alternating
 * light and dark, joined by a half-second light sweep. Nothing cuts inside a
 * chapter — elements arrive and leave on springs while the layout holds.
 *
 * The pacing rule taken from the references is that something new lands roughly
 * every second. A layout that finishes assembling and then holds for five
 * seconds reads as a frozen slide, which is what the first pass of this reel
 * did; every chapter below therefore keeps at least one arrival in reserve for
 * its back half.
 *
 * There is no voice-over yet. Beats are timed to a read-aloud pace of `SCRIPT`,
 * so a recorded take can be dropped underneath and nudged rather than re-timed.
 */

/**
 * No handle burned into the frame. The references carry one, but a watermark
 * costs attention in the opening seconds and Instagram already labels the
 * author above the video — `Watermark` stays in Chrome.tsx for the day it is
 * wanted, unused here.
 */

/** Chapter boundaries in seconds. The sweep sits at the head of each chapter. */
const CH = {
  hook: [0, 6.6],
  inside: [6.6, 15.4],
  gpt: [15.4, 25.8],
  money: [25.8, 33.4],
  how: [33.4, 42.2],
  cta: [42.2, 48.8],
} as const;

export const DURATION = sec(CH.cta[1]);
const SWEEP = 14;

/** The spoken script these beats are cut to, kept next to the timing on purpose. */
export const SCRIPT = [
  "Сотрудник спрашивает — и получает ответ за пять секунд. Со ссылкой на пункт.",
  "Внутри компании лежат договоры, регламенты, прайсы, инструкции.",
  "Человек не помнит, что где лежит. Он не ленится — он ищет.",
  "Только не грузи документы компании в публичные нейросети.",
  "Всё, что ты туда закинул, уходит на зарубежные серверы. По 152-ФЗ отвечать тебе.",
  "У дистрибьютора на 24 менеджера ответ клиенту занимал 11 минут. Стал 9 секунд.",
  "Это 238 тысяч рублей в месяц, которых просто не было видно в отчёте.",
  "Схема простая: документы, агент, ответ со ссылкой на пункт. Локально, сервер в РФ.",
  "Хочешь чек-лист, куда внедрять, а куда точно нет — напиши «аудит».",
];

/* ------------------------------------------------------------------ */

const Chapter: React.FC<{
  mode: Mode;
  from: number;
  to: number;
  children: React.ReactNode;
  /** Sweep toward this chapter at its head, unless it is the first. */
  head?: boolean;
  /** Blur out under the next chapter's sweep, unless this is the last. */
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

/** Vertically stacked column, respecting the reel safe area. */
const Stack: React.FC<{ children: React.ReactNode; gap?: number; top?: number }> = ({
  children,
  gap = 40,
  top = 300,
}) => (
  <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", gap, paddingTop: top }}>
    {children}
  </AbsoluteFill>
);

/** Fades a block out again, so a chapter can clear space for its next beat. */
const Until: React.FC<{ children: React.ReactNode; from: number; out: number }> = ({
  children,
  from,
  out,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [out, out + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Sequence from={from} layout="none">
      <div style={{ opacity: o, transform: `translateY(${(1 - o) * -14}px)` }}>{children}</div>
    </Sequence>
  );
};

/* ------------------------------------------------------------------ */

/**
 * 1. Hook — the promise, with the number selected the way a designer would,
 * then the old number struck out under it.
 */
const Hook: React.FC = () => (
  <Stack top={400} gap={46}>
    <Obj name="stopwatch" size={230} float tilt={-8} />
    <WordLine
      mode="dark"
      from={3}
      words={[
        { text: "сотрудник" },
        { text: "спрашивает" },
        { text: "—" },
        { text: "отвечает", hit: true },
      ]}
    />
    <WordLine mode="dark" from={20} words={[{ text: "за" }, { text: "5 секунд", select: true }]} />
    <Sequence from={44} layout="none">
      <Label mode="dark" size={32}>
        со ссылкой на пункт документа
      </Label>
    </Sequence>
    <Sequence from={82} layout="none">
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 26 }}>
        <Struck mode="dark">было 11 минут</Struck>
        <Obj name="hourglass-done" size={78} float />
      </div>
    </Sequence>
  </Stack>
);

/** Grey text with a line drawn through it — the "this is what it used to be" beat. */
const Struck: React.FC<{ children: React.ReactNode; mode: Mode }> = ({ children, mode }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const w = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{ position: "relative", fontFamily: uiFont, fontSize: 44, color: m.mute }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: -6,
          right: -6,
          top: "52%",
          height: 4,
          borderRadius: 4,
          background: ALERT,
          transform: `scaleX(${w})`,
          transformOrigin: "left center",
        }}
      />
    </span>
  );
};

/**
 * 2. Inside the company — the dotted loop from reference A, relabelled.
 * The document types sit on the ring; in the second half the magnifier in the
 * middle is replaced by the product, and the toggle answers it.
 */
const Inside: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 230, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="внутри"
        right="компании"
        object={<Obj name="open-file-folder" size={124} float />}
      />
    </div>
    <DottedLoop mode="light" cx={540} cy={950} rx={310} ry={310} delay={12} draw={26} />
    {[
      { t: "договоры", x: 540, y: 640, d: 18 },
      { t: "прайсы", x: 855, y: 950, d: 24 },
      { t: "регламенты", x: 540, y: 1262, d: 30 },
      { t: "инструкции", x: 225, y: 950, d: 36 },
    ].map((n) => (
      <div
        key={n.t}
        style={{ position: "absolute", left: n.x, top: n.y, transform: "translate(-50%,-50%)" }}
      >
        <Chip mode="light" delay={n.d} icon={<DocGlyph size={24} color="#8A8A92" />}>
          {n.t}
        </Chip>
      </div>
    ))}

    {/* First half: the search. */}
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 950,
        transform: "translate(-50%,-50%)",
        width: 520,
      }}
    >
      <Until from={40} out={112}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Obj name="magnifying-glass-tilted-left" size={148} float tilt={4} />
          <Label mode="light" size={32} delay={8}>
            не помнит, что где лежит
          </Label>
        </div>
      </Until>
    </div>

    {/* Second half: the product takes its place. */}
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 950,
        transform: "translate(-50%,-50%)",
        width: 520,
      }}
    >
      <Sequence from={126} layout="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <IconTile bg={ACCENT} size={132} radius={34}>
            <BoltGlyph size={72} />
          </IconTile>
          <Label mode="light" size={34} delay={6} color={MODE.light.ink}>
            спрашивает словами
          </Label>
        </div>
      </Sequence>
    </div>

    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1400,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Sequence from={150} layout="none">
        <Toggle mode="light" on at={18} label="искать не нужно" />
      </Sequence>
    </div>
  </AbsoluteFill>
);

/**
 * 3. The prompt sheet, and what it costs. The one alert-red beat of the reel:
 * documents escape the frame while the stamp lands.
 */
const Gpt: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, textAlign: "center" }}>
        <Label mode="dark" size={46} color="#FFFFFF">
          только не так
        </Label>
      </div>
      <div style={{ position: "absolute", top: 310, left: 140 }}>
        <PromptSheet
          mode="dark"
          delay={4}
          width={800}
          chips={["договоры", "прайсы", "кадры"]}
          message="что у нас по срокам оплаты в договоре?"
          progressTo={100}
        />
      </div>

      {/* Documents leaking out to the right, once the answer is "ready". */}
      {Array.from({ length: 6 }).map((_, i) => {
        const start = 132 + i * 9;
        const t = interpolate(frame, [start, start + 46], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (t <= 0 || t >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 560 + t * 620,
              top: 700 + i * 88 - t * 150,
              opacity: Math.sin(t * Math.PI) * 0.85,
              transform: `rotate(${t * (26 + i * 5)}deg)`,
            }}
          >
            <DocGlyph size={82} color="#FF8E9B" />
          </div>
        );
      })}

      <div style={{ position: "absolute", top: 1290, left: 0, right: 0 }}>
        <Sequence from={96} layout="none">
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}
          >
            <BanGlyph size={64} />
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: 54,
                color: "#fff",
                letterSpacing: -0.6,
              }}
            >
              уходит за границу
            </div>
          </div>
        </Sequence>
      </div>
      <DottedRun mode="dark" x={330} y={1390} width={420} delay={118} />
      <div style={{ position: "absolute", top: 1436, left: 0, right: 0, textAlign: "center" }}>
        <Sequence from={124} layout="none">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 30px",
              borderRadius: R.chip,
              border: `1px solid ${ALERT}`,
              background: "rgba(255,69,58,0.10)",
            }}
          >
            <ShieldGlyph size={38} color={ALERT} />
            <span style={{ fontFamily: uiFont, fontWeight: 600, fontSize: 34, color: ALERT }}>
              по 152-ФЗ отвечать тебе
            </span>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

/** 4. The number. One case, told as a before/after and a monthly figure. */
const Money: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 240, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="дистрибьютор"
        right="24 чел."
        size={66}
        object={<Obj name="bar-chart" size={100} float />}
      />
    </div>
    <div
      style={{
        position: "absolute",
        top: 540,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 46,
      }}
    >
      <Stat mode="light" delay={10} value="11 мин" caption="было" />
      <Sequence from={18} layout="none">
        <div style={{ fontSize: 62, color: MODE.light.mute, fontFamily: uiFont }}>→</div>
      </Sequence>
      <Stat mode="light" delay={24} value="9 сек" caption="стало" color={OK} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 800,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Sequence from={38} layout="none">
        <>
          <CountUp mode="light" to={238000} durationInFrames={32} size={132} suffix=" ₽" />
          <div style={{ textAlign: "center" }}>
            <Label mode="light" size={34} delay={18}>
              в месяц — на одном отделе
            </Label>
          </div>
        </>
      </Sequence>
    </div>
    <div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Sequence from={86} layout="none">
        <Panel mode="light" width={780} pad={28} radius={R.card}>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 34,
              lineHeight: 1.35,
              color: MODE.light.ink,
              textAlign: "center",
            }}
          >
            Собственник был уверен, что это{" "}
            <span style={{ color: MODE.light.mute }}>«секунд тридцать»</span>
          </div>
        </Panel>
      </Sequence>
    </div>
    <div style={{ position: "absolute", top: 1370, left: 0, right: 0, textAlign: "center" }}>
      <Sequence from={140} layout="none">
        <Label mode="light" size={32} color={MODE.light.mute}>
          этой строки нет в отчётности
        </Label>
      </Sequence>
    </div>
  </AbsoluteFill>
);

/** 5. The pipeline — the zig-zag card stack with dotted arcs between. */
const How: React.FC = () => {
  const cards = [
    {
      title: "документы",
      sub: "договоры, регламенты, прайсы",
      x: 60,
      y: 420,
      icon: (
        <IconTile bg="#F2C94C">
          <DocGlyph size={44} color="#3A2E00" />
        </IconTile>
      ),
      d: 4,
    },
    {
      title: "Нейродокс",
      sub: "локально, сервер в РФ",
      x: 240,
      y: 680,
      icon: (
        <IconTile bg={ACCENT}>
          <BoltGlyph size={44} />
        </IconTile>
      ),
      d: 24,
      accent: true,
    },
    {
      title: "ответ за 5 сек",
      sub: "со ссылкой на пункт",
      x: 60,
      y: 940,
      icon: (
        <IconTile bg="#2FBF71">
          <ShieldGlyph size={42} />
        </IconTile>
      ),
      d: 44,
    },
    {
      title: "сотрудник",
      sub: "спрашивает обычными словами",
      x: 240,
      y: 1200,
      icon: (
        <IconTile bg="#6E5BFF">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.9" />
            <path d="M4.5 20a7.5 7.5 0 0115 0" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </IconTile>
      ),
      d: 64,
    },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 220, left: 0, right: 0 }}>
        <ChapterTitle
          mode="dark"
          left="схема"
          right="целиком"
          size={68}
          object={<Obj name="gear" size={96} float />}
        />
      </div>
      {cards.map((c) => (
        <div key={c.title} style={{ position: "absolute", left: c.x, top: c.y }}>
          <AppCard
            mode="dark"
            title={c.title}
            sub={c.sub}
            icon={c.icon}
            width={780}
            delay={c.d}
            accent={c.accent}
          />
        </div>
      ))}
      <DottedArc mode="dark" from={[850, 530]} to={[1010, 790]} bend={-66} label="1 шаг" delay={14} />
      <DottedArc mode="dark" from={[230, 790]} to={[70, 1050]} bend={-66} label="2 шаг" delay={34} />
      <DottedArc mode="dark" from={[850, 1050]} to={[1010, 1310]} bend={-66} label="3 шаг" delay={54} />
      <div
        style={{
          position: "absolute",
          top: 1420,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Sequence from={92} layout="none">
          <div style={{ display: "flex", gap: 14 }}>
            <Chip mode="dark" delay={0} icon={<ShieldGlyph size={22} color="#8A8A92" />}>
              локально
            </Chip>
            <Chip mode="dark" delay={5}>
              сервер в РФ
            </Chip>
            <Chip mode="dark" delay={10}>
              152-ФЗ и NDA
            </Chip>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

/** 6. Close — the channel card and the code word. */
const Cta: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 250, left: 0, right: 0 }}>
      <ChapterTitle
        mode="light"
        left="чек-лист"
        right="бесплатно"
        size={66}
        object={<Obj name="spiral-notepad" size={96} float />}
      />
    </div>
    <div style={{ position: "absolute", top: 500, left: 180 }}>
      <ChannelCard
        mode="light"
        delay={8}
        width={720}
        avatar={<Avatar mode="light" size={84} letter="Я" />}
        name="Ярослав Новиков"
        handle="@Novikoff_off"
        bio="Куда внедрять ИИ, а куда точно нет — 7 признаков, 7 стоп-факторов и формула расчёта."
        stats={[
          { value: "5 сек", caption: "ответ" },
          { value: "14 дней", caption: "внедрение" },
          { value: "152-ФЗ", caption: "и NDA" },
        ]}
        cta="написать «аудит»"
        secondary="забрать чек-лист"
      />
    </div>
    <div
      style={{ position: "absolute", top: 1270, left: 0, right: 0, display: "flex", justifyContent: "center" }}
    >
      <Sequence from={44} layout="none">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <IconTile bg={ACCENT} size={76}>
            <TelegramGlyph size={42} />
          </IconTile>
          <Selected mode="light" delay={8}>
            <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 72, letterSpacing: -1 }}>
              аудит
            </span>
          </Selected>
        </div>
      </Sequence>
    </div>
    <div style={{ position: "absolute", top: 1420, left: 0, right: 0, textAlign: "center" }}>
      <Sequence from={70} layout="none">
        <Label mode="light" size={32}>
          в личные сообщения — пришлю в ответ
        </Label>
      </Sequence>
    </div>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */

export const ReelPronin: React.FC = () => (
  <AbsoluteFill style={{ background: MODE.dark.bg }}>
    <Chapter mode="dark" from={CH.hook[0]} to={CH.hook[1]} head={false}>
      <Hook />
    </Chapter>
    <Chapter mode="light" from={CH.inside[0]} to={CH.inside[1]}>
      <Inside />
    </Chapter>
    <Chapter mode="dark" from={CH.gpt[0]} to={CH.gpt[1]}>
      <Gpt />
    </Chapter>
    <Chapter mode="light" from={CH.money[0]} to={CH.money[1]}>
      <Money />
    </Chapter>
    <Chapter mode="dark" from={CH.how[0]} to={CH.how[1]}>
      <How />
    </Chapter>
    <Chapter mode="light" from={CH.cta[0]} to={CH.cta[1]} tail={false}>
      <Cta />
    </Chapter>
  </AbsoluteFill>
);
