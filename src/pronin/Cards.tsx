import React from "react";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, uiFont } from "../fonts";
import { ACCENT, MODE, Mode, POP, R, T } from "./theme";

/**
 * The card language. Everything in the references that is not a word or a 3D
 * object is one of these: a pill-shaped app card, a rounded panel, or a list
 * of rows inside a panel.
 *
 * The shared recipe is a near-flat fill, a single hairline that is brighter
 * than you would expect (16% white on the dark ground), and a wide soft shadow.
 * At reel size the hairline is what separates the card from the ground — a
 * shadow alone disappears on a phone in daylight.
 */

const useSpring = (delay: number, config = POP) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

/**
 * A 3D emoji object, drawn from the Fluent set in `public/emoji`.
 *
 * The source art is flat-ish vector, so the depth comes from the shadow beneath
 * it and a slight tilt. Against the reference's true 3D renders this reads
 * close at reel scale, and it is the one element that would be worth swapping
 * for real assets if the user has a 3D pack.
 */
export const Obj: React.FC<{ name: string; size?: number; tilt?: number; float?: boolean }> = ({
  name,
  size = 120,
  tilt = -6,
  float = false,
}) => {
  const frame = useCurrentFrame();
  const y = float ? Math.sin(frame / 24) * 6 : 0;
  return (
    <img
      src={staticFile(`emoji/${name}.svg`)}
      width={size}
      height={size}
      style={{
        display: "block",
        transform: `translateY(${y}px) rotate(${tilt}deg)`,
        filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.30))",
      }}
    />
  );
};

/**
 * The supplied 3D pack: real renders with a transparent background.
 *
 * Every object arrives travelling and blurred and settles on an overshooting
 * spring, and leaves by scaling down rather than cutting. Objects that appear
 * and disappear on a hard frame are the single clearest tell of an edit
 * assembled rather than animated.
 *
 * They carry their own lighting, so the drop shadow stays light — a heavy one
 * under an already-shaded render reads as a sticker pasted on the frame.
 */
export const Icon3D: React.FC<{
  name: string;
  size?: number;
  tilt?: number;
  float?: boolean;
  /** Phase offset, so a row of objects does not bob in unison. */
  phase?: number;
  /** Frame it arrives on, relative to its Sequence. */
  delay?: number;
  /** Total life in frames. Given one, the object also leaves properly. */
  life?: number;
  /** Arrival direction, in canvas pixels travelled. */
  fromX?: number;
  fromY?: number;
  spin?: number;
}> = ({
  name,
  size = 160,
  tilt = 0,
  float = false,
  phase = 0,
  delay = 0,
  life,
  fromX = 0,
  fromY = 90,
  spin = -18,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Arrival: a spring that overshoots, travelling in from a direction and
  // unblurring as it settles. A plain opacity pop is what made the previous cut
  // look like slides — an object has to arrive from somewhere.
  const e = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 170, mass: 0.9 },
  });

  // Departure: scale down and blur out rather than vanishing on a frame.
  const leave = life
    ? interpolate(frame, [delay + life - 10, delay + life], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const y = (float ? Math.sin(frame / 26 + phase) * 8 : 0) + (1 - e) * fromY;
  const x = (float ? Math.cos(frame / 34 + phase) * 5 : 0) + (1 - e) * fromX;
  const r = tilt + (float ? Math.sin(frame / 30 + phase) * 2.2 : 0) + (1 - e) * spin;
  const scale = interpolate(e, [0, 1], [0.35, 1]) * (1 - leave * 0.25);

  return (
    <img
      src={staticFile(`icons3d/${name}.png`)}
      width={size}
      height={size}
      style={{
        display: "block",
        opacity: e * (1 - leave),
        transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${scale})`,
        filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.28)) blur(${
          (1 - e) * 10 + leave * 8
        }px)`,
      }}
    />
  );
};

/** Rounded square holding an app glyph, matching an iOS icon's proportions. */
export const IconTile: React.FC<{
  children: React.ReactNode;
  bg: string;
  size?: number;
  radius?: number;
}> = ({ children, bg, size = 84, radius = R.icon }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
    }}
  >
    {children}
  </div>
);

/**
 * The signature element: a pill card carrying an icon, a headline and a grey
 * sub-line. In the references these stack down the frame with alternating
 * horizontal offsets, joined by dotted arcs.
 */
export const AppCard: React.FC<{
  mode: Mode;
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  width?: number;
  delay?: number;
  /** Horizontal nudge, so a stack of cards zig-zags instead of forming a column. */
  offset?: number;
  accent?: boolean;
}> = ({ mode, title, sub, icon, width = 720, delay = 0, offset = 0, accent = false }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "22px 34px 22px 22px",
        borderRadius: R.card,
        background: m.card,
        border: `1px solid ${accent ? ACCENT : m.cardLine}`,
        boxShadow: m.shadow,
        opacity: e,
        transform: `translateX(${offset}px) translateY(${(1 - e) * 34}px) scale(${interpolate(
          e,
          [0, 1],
          [0.9, 1]
        )})`,
      }}
    >
      {icon}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: T.cardTitle,
            letterSpacing: -0.6,
            color: m.ink,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        {sub ? (
          <div style={{ fontFamily: uiFont, fontSize: T.cardSub, color: m.mute }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );
};

/** Generic rounded surface: sheets, mock screens, thumbnails. */
export const Panel: React.FC<{
  mode: Mode;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  radius?: number;
  pad?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ mode, children, width, height, radius = R.panel, pad = 26, delay = 0, style }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        width,
        height,
        padding: pad,
        borderRadius: radius,
        background: m.card,
        border: `1px solid ${m.cardLine}`,
        boxShadow: m.shadow,
        opacity: e,
        transform: `translateY(${(1 - e) * 30}px) scale(${interpolate(e, [0, 1], [0.94, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A titled panel whose rows appear one after another.
 *
 * Reference B spends twenty seconds building four of these into a 2x2 grid, one
 * row at a time — it is the whole middle of that reel. The rows carry almost no
 * information at reel size; what they communicate is "there is a system here,
 * and it is bigger than one thing".
 */
export const ListPanel: React.FC<{
  mode: Mode;
  title: string;
  sub?: string;
  rows: string[];
  icon?: React.ReactNode;
  width?: number;
  delay?: number;
  rowStagger?: number;
}> = ({ mode, title, sub, rows, icon, width = 420, delay = 0, rowStagger = 5 }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        width,
        borderRadius: R.card,
        background: m.card,
        border: `1px solid ${m.cardLine}`,
        boxShadow: m.shadow,
        padding: "20px 22px 22px",
        opacity: e,
        transform: `translateY(${(1 - e) * 26}px) scale(${interpolate(e, [0, 1], [0.93, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        {icon}
        <div>
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 32,
              color: m.ink,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </div>
          {sub ? (
            <div style={{ fontFamily: uiFont, fontSize: 20, color: m.mute }}>{sub}</div>
          ) : null}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r, i) => (
          <Row key={r} mode={mode} text={r} delay={delay + 8 + i * rowStagger} />
        ))}
      </div>
    </div>
  );
};

const Row: React.FC<{ mode: Mode; text: string; delay: number }> = ({ mode, text, delay }) => {
  const m = MODE[mode];
  const e = useSpring(delay, { damping: 18, stiffness: 200, mass: 0.6 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: e,
        transform: `translateX(${(1 - e) * -18}px)`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 26,
          borderRadius: 5,
          background: m.inset,
          border: `1px solid ${m.cardLine}`,
          flex: "0 0 auto",
        }}
      />
      <div style={{ fontFamily: uiFont, fontSize: 24, color: m.mute }}>{text}</div>
    </div>
  );
};

/** Small labelled chip — the folder tags above the prompt field. */
export const Chip: React.FC<{
  mode: Mode;
  children: React.ReactNode;
  delay?: number;
  icon?: React.ReactNode;
  tone?: "plain" | "accent" | "alert";
}> = ({ mode, children, delay = 0, icon, tone = "plain" }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  const bg = tone === "accent" ? ACCENT : m.inset;
  const fg = tone === "accent" ? "#fff" : m.mute;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: R.chip,
        background: bg,
        border: `1px solid ${m.cardLine}`,
        fontFamily: uiFont,
        fontSize: T.small,
        color: fg,
        opacity: e,
        transform: `scale(${interpolate(e, [0, 1], [0.8, 1])})`,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

/**
 * A stat block: a big number over a grey caption. Used in a row of three, the
 * way the references show follower or engagement figures.
 */
export const Stat: React.FC<{
  mode: Mode;
  value: React.ReactNode;
  caption: string;
  delay?: number;
  color?: string;
}> = ({ mode, value, caption, delay = 0, color }) => {
  const m = MODE[mode];
  const e = useSpring(delay);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        opacity: e,
        transform: `translateY(${(1 - e) * 20}px)`,
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: -1,
          color: color ?? m.ink,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 22, color: m.mute }}>{caption}</div>
    </div>
  );
};
