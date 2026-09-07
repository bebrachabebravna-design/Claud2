import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, uiFont } from "../fonts";
import { ACCENT, ALERT, MODE, Mode, OK, POP, R, T } from "./theme";
import { Chip, IconTile, Panel } from "./Cards";
import { TypeLine } from "./Type";

/**
 * Interface mock-ups. The references never show a real screen recording — every
 * "app" on screen is drawn, which is why they hold up at any resolution and why
 * nothing dates.
 */

const useSpring = (delay: number, config = POP) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

/** iOS switch. Reference A turns one off on the line "не нужен". */
export const Toggle: React.FC<{
  mode: Mode;
  on: boolean;
  /** Frame at which it flips to `on`. */
  at?: number;
  label?: string;
  delay?: number;
}> = ({ mode, on, at = 0, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const e = useSpring(delay);
  const p = spring({
    frame: frame - at,
    fps: 30,
    config: { damping: 16, stiffness: 200, mass: 0.6 },
  });
  const t = on ? p : 1 - p;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: e }}>
      <div
        style={{
          width: 96,
          height: 56,
          borderRadius: 56,
          background: `color-mix(in srgb, ${OK} ${t * 100}%, ${m.inset})`,
          border: `1px solid ${m.cardLine}`,
          position: "relative",
          transition: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4 + t * 40,
            width: 46,
            height: 46,
            borderRadius: 46,
            background: "#fff",
            boxShadow: "0 3px 10px rgba(0,0,0,0.28)",
          }}
        />
      </div>
      {label ? (
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 52,
            color: m.ink,
            letterSpacing: -0.5,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/**
 * The prompt sheet: source chips along the top, a sent message bubble, a
 * generating placeholder and an input with a round send button.
 *
 * Reference A holds this single mock for nine seconds while the percentage
 * climbs — proof that one well-drawn interface beats four quick cutaways.
 */
export const PromptSheet: React.FC<{
  mode: Mode;
  chips: string[];
  message: string;
  /** Text typed into the bottom field, if any. */
  input?: string;
  /** Percentage shown under the generating panel, or null to hide it. */
  progressTo?: number | null;
  progressLabel?: string;
  width?: number;
  delay?: number;
}> = ({
  mode,
  chips,
  message,
  input = "спроси что угодно",
  progressTo = 100,
  progressLabel = "генерирую",
  width = 800,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const bubble = useSpring(delay + 8);
  const pct =
    progressTo === null
      ? 0
      : Math.round(
          interpolate(frame, [delay + 22, delay + 90], [0, progressTo], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
  return (
    <Panel mode={mode} width={width} radius={R.sheet} pad={28} delay={delay}>
      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        {chips.map((c, i) => (
          <Chip key={c} mode={mode} delay={delay + 4 + i * 3} icon={<FolderGlyph />}>
            {c}
          </Chip>
        ))}
      </div>
      <div
        style={{
          alignSelf: "flex-end",
          marginLeft: "auto",
          maxWidth: "82%",
          background: ACCENT,
          color: "#fff",
          borderRadius: 28,
          padding: "18px 26px",
          fontFamily: uiFont,
          fontSize: 32,
          lineHeight: 1.25,
          opacity: bubble,
          transform: `translateY(${(1 - bubble) * 18}px) scale(${interpolate(
            bubble,
            [0, 1],
            [0.92, 1]
          )})`,
          width: "fit-content",
        }}
      >
        {message}
      </div>
      {progressTo !== null ? (
        <div
          style={{
            marginTop: 22,
            height: 330,
            borderRadius: 26,
            background: m.inset,
            border: `1px solid ${m.cardLine}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Spinner mode={mode} />
          <div
            style={{
              position: "absolute",
              left: 22,
              bottom: 18,
              fontFamily: uiFont,
              fontSize: 28,
              color: m.mute,
            }}
          >
            {progressLabel} {pct}%
          </div>
        </div>
      ) : null}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: m.inset,
          border: `1px solid ${m.cardLine}`,
          borderRadius: 34,
          padding: "16px 16px 16px 26px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <TypeLine text={input} mode={mode} color={m.mute} size={30} caret={false} />
        </div>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 60,
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Panel>
  );
};

/** Concentric dot field that stands in for "the model is working". */
const Spinner: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const rings = [1, 2, 3, 4, 5];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {rings.map((ring) => {
        const n = ring * 7;
        return Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + frame / (60 + ring * 14);
          const rad = ring * 26;
          return (
            <div
              key={`${ring}-${i}`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 5,
                height: 5,
                borderRadius: 5,
                background: m.mute,
                opacity: 0.22 + 0.1 * Math.sin(frame / 12 + ring),
                transform: `translate(${Math.cos(a) * rad}px, ${Math.sin(a) * rad}px)`,
              }}
            />
          );
        });
      })}
    </div>
  );
};

/**
 * A message-style notification card — the "ии юрист / ии бухгалтер" stack in
 * reference A. Icon, bold sender, timestamp, one line of grey body.
 */
export const NotifCard: React.FC<{
  mode: Mode;
  from: string;
  time: string;
  body: string;
  icon: React.ReactNode;
  width?: number;
  delay?: number;
}> = ({ mode, from, time, body, icon, width = 700, delay = 0 }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        width,
        display: "flex",
        gap: 18,
        alignItems: "flex-start",
        padding: "20px 24px",
        borderRadius: R.card,
        background: m.card,
        border: `1px solid ${m.cardLine}`,
        boxShadow: m.shadow,
        opacity: e,
        transform: `translateY(${(1 - e) * 26}px) scale(${interpolate(e, [0, 1], [0.94, 1])})`,
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 34,
              color: m.ink,
              letterSpacing: -0.4,
            }}
          >
            {from}
          </div>
          <div style={{ marginLeft: "auto", fontFamily: uiFont, fontSize: 24, color: m.mute }}>
            {time}
          </div>
        </div>
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 27,
            color: m.mute,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};

/**
 * Telegram-style channel card used as the closing CTA, matching the shape of
 * the profile card both references end on.
 */
export const ChannelCard: React.FC<{
  mode: Mode;
  name: string;
  handle: string;
  bio: string;
  stats: { value: string; caption: string }[];
  cta: string;
  secondary?: string;
  width?: number;
  delay?: number;
  avatar?: React.ReactNode;
}> = ({ mode, name, handle, bio, stats, cta, secondary, width = 720, delay = 0, avatar }) => {
  const m = MODE[mode];
  return (
    <Panel mode={mode} width={width} radius={R.panel} pad={30} delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {avatar}
        <div>
          <div
            style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 40, color: m.ink }}
          >
            {name}
          </div>
          <div style={{ fontFamily: uiFont, fontSize: 28, color: m.mute }}>{handle}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        {stats.map((s, i) => (
          <div
            key={s.caption}
            style={{
              flex: 1,
              background: m.inset,
              border: `1px solid ${m.cardLine}`,
              borderRadius: 20,
              padding: "14px 16px",
            }}
          >
            <div
              style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 34, color: m.ink }}
            >
              {s.value}
            </div>
            <div style={{ fontFamily: uiFont, fontSize: 22, color: m.mute }}>{s.caption}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 28,
          color: m.ink,
          marginTop: 22,
          lineHeight: 1.35,
        }}
      >
        {bio}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        <div
          style={{
            flex: 1,
            background: ACCENT,
            color: "#fff",
            borderRadius: 18,
            padding: "16px 0",
            textAlign: "center",
            fontFamily: uiFont,
            fontWeight: 600,
            fontSize: 30,
          }}
        >
          {cta}
        </div>
        {secondary ? (
          <div
            style={{
              flex: 1,
              background: m.inset,
              border: `1px solid ${m.cardLine}`,
              color: m.ink,
              borderRadius: 18,
              padding: "16px 0",
              textAlign: "center",
              fontFamily: uiFont,
              fontWeight: 600,
              fontSize: 30,
            }}
          >
            {secondary}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

/**
 * The pointer that drags things around in both references. A real cursor is
 * what turns a static mock into "someone is using this".
 */
export const Cursor: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <svg
    width={38 * scale}
    height={44 * scale}
    viewBox="0 0 20 23"
    style={{ position: "absolute", left: x, top: y, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.4))" }}
  >
    <path d="M1 1l17 10-7.3 1.6L14 20l-3 1.3-3.2-7.3L1 18V1z" fill="#fff" stroke="#111" strokeWidth="1.3" />
  </svg>
);

/* --- app glyphs, drawn rather than shipped as brand assets --- */

export const FolderGlyph: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill={ACCENT} />
  </svg>
);

export const DocGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = "#fff",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 3h7l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
      stroke={color}
      strokeWidth="1.8"
    />
    <path d="M13 3v5h5M8 13h8M8 17h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const TelegramGlyph: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M21 4.5L2.8 11.4c-.9.3-.9 1.6.1 1.9l4.5 1.3 1.7 5c.3.8 1.3 1 1.9.4l2.4-2.3 4.4 3.2c.7.5 1.7.1 1.9-.7L22.6 5.7c.2-.9-.7-1.6-1.6-1.2z"
      fill="#fff"
    />
    <path d="M8 13.5l9.6-6-7.4 7.3-.3 3.6-1.9-4.9z" fill="#C8DFF0" />
  </svg>
);

export const ShieldGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = "#fff",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6l8-3z" stroke={color} strokeWidth="1.8" />
    <path d="M8.6 12.2l2.4 2.4 4.4-4.7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BoltGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = "#fff",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13.5 2L5 13.5h5.5L9.5 22 19 10.5h-5.8L13.5 2z" fill={color} />
  </svg>
);

export const BanGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = ALERT,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
    <path d="M5.8 5.8l12.4 12.4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/** Round avatar placeholder, until a real photo is supplied. */
export const Avatar: React.FC<{ size?: number; mode: Mode; letter?: string }> = ({
  size = 76,
  mode,
  letter = "Я",
}) => {
  const m = MODE[mode];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: `linear-gradient(150deg, ${ACCENT}, #6E5BFF)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: displayFont,
        fontWeight: 800,
        fontSize: size * 0.44,
        color: "#fff",
        flex: "0 0 auto",
        border: `1px solid ${m.cardLine}`,
      }}
    >
      {letter}
    </div>
  );
};

export { IconTile, T };
