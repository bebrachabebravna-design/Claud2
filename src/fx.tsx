import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, scriptFont, YELLOW } from "./fonts";

/**
 * 2D motion-graphics kit for the reel variants.
 *
 * The three.js pass looked cheap — flat boxes, a black slab for a phone — so
 * this replaces it with pure CSS/SVG: animated gradient pools, glass panels,
 * gloss sweeps and concentric rings. That reads as modern motion design, and
 * unlike WebGL primitives it renders identically every frame.
 */

// ---------------------------------------------------------------------------
// TYPE — the fix for "толстый и страшный"
// ---------------------------------------------------------------------------

/**
 * Caption block. Two register: a white SF Pro line and a yellow handwritten
 * accent line.
 *
 * The old captions read as a generic impact face because of the outline —
 * iOS type has none, and the stroke is exactly what fattened the letters. So
 * there is NO WebkitTextStroke here; legibility comes from a soft shadow and,
 * where needed, a dark scrim behind the block. The accent is the Good Vibes
 * script in yellow and is never upper-cased — a script face in caps looks
 * broken, and the user asked for it lower-case.
 */
export const Line: React.FC<{
  text: string;
  accent?: boolean;
  durationInFrames: number;
  top?: number;
  size?: number;
  align?: "center" | "flex-start" | "flex-end";
  color?: string;
}> = ({ text, accent = false, durationInFrames, top = 0.12, size = 96, align = "center", color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 200, mass: 0.6 } });
  const exit = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Slight upward drift keeps the type alive next to the moving background.
  const drift = interpolate(frame, [0, durationInFrames], [8, -8]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${top * 100}%`,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: align,
        padding: "0 70px",
        opacity: exit,
        transform: `translateY(${drift}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
      }}
    >
      {accent ? (
        <span
          style={{
            fontFamily: scriptFont,
            fontWeight: 400,
            fontSize: size * 1.35,
            lineHeight: 0.95,
            color: YELLOW,
            textAlign: "center",
            whiteSpace: "pre-line",
            textShadow: `0 0 22px ${YELLOW}66, 0 6px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {text}
        </span>
      ) : (
        <span
          style={{
            fontFamily: displayFont,
            // 700, not 800/900 — the heavy weights plus caps were half of why
            // it read as a cheap impact font.
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.02,
            letterSpacing: -1.5,
            color,
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "pre-line",
            textShadow:
              color === "#FFFFFF"
                ? "0 4px 22px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.5)"
                : "0 2px 14px rgba(255,255,255,0.5)",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// BACKGROUNDS
// ---------------------------------------------------------------------------

/** Drifting radial colour pools — a living gradient, not a flat fill. */
export const MeshGradient: React.FC<{
  base: string;
  pools: { color: string; x: number; y: number; r: number }[];
  speed?: number;
}> = ({ base, pools, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {pools.map((p, i) => {
        const t = frame * 0.012 * speed + i;
        const dx = Math.sin(t) * 90;
        const dy = Math.cos(t * 0.8) * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.r,
              height: p.r,
              transform: `translate(${dx - p.r / 2}px, ${dy - p.r / 2}px)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${p.color} 0%, transparent 68%)`,
              filter: "blur(18px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Frosted panel with a lit top edge — the aiup-style glass card. */
export const Glass: React.FC<{
  style?: React.CSSProperties;
  delay?: number;
  edge?: string;
  children?: React.ReactNode;
}> = ({ style, delay = 0, edge = "#FFFFFF", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 130 } });
  return (
    <div
      style={{
        position: "absolute",
        opacity: e,
        transform: `translateY(${(1 - e) * 40}px) scale(${interpolate(e, [0, 1], [0.9, 1])})`,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.22)",
        borderTop: `2px solid ${edge}`,
        borderRadius: 28,
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A moving specular streak — the "gloss" over dark glass. */
export const GlossSweep: React.FC<{ delay?: number; tint?: string }> = ({ delay = 0, tint = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame - delay, [0, 40], [-60, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: `${x}%`,
          width: "40%",
          height: "160%",
          transform: "rotate(18deg)",
          background: `linear-gradient(90deg, transparent, ${tint}22, transparent)`,
          filter: "blur(8px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Concentric rings that scale and fade — the aiup "signal" motif. */
export const Rings: React.FC<{ x?: number; y?: number; color?: string; count?: number }> = ({
  x = 50,
  y = 40,
  color = "#45D0FF",
  count = 4,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const p = ((frame * 0.02 + i / count) % 1);
        const r = interpolate(p, [0, 1], [120, 900]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: r,
              height: r,
              marginLeft: -r / 2,
              marginTop: -r / 2,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              opacity: interpolate(p, [0, 0.15, 1], [0, 0.5, 0]),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Foreground motes — the last depth cue, in front of the speaker. */
export const Bokeh: React.FC<{ colors?: string[]; count?: number }> = ({
  colors = ["#45D0FF", YELLOW],
  count = 7,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = `m${i}`;
        const size = 24 + random(seed) * 64;
        const x = random(`${seed}x`) * 1080;
        const speed = 0.25 + random(`${seed}s`) * 0.5;
        const y = 1920 - ((frame * speed * 6 + random(`${seed}y`) * 1920) % 2300);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: colors[i % colors.length],
              opacity: 0.08 + random(`${seed}o`) * 0.12,
              filter: `blur(${12 + random(`${seed}b`) * 16}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Film grain + vignette. This is the workhorse for hiding the 720p source:
 * a light grain breaks up the soft upscaled pixels and the vignette pulls the
 * eye off the edges of the frame.
 */
const NOISE =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.5'/></svg>`.replace(
      /%23/g,
      "#",
    ),
  );

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("${NOISE}")`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 78% 70% at 50% 42%, transparent 55%, rgba(0,0,0,0.5) 100%)",
      }}
    />
  </AbsoluteFill>
);

/** Short light kick on a cut. */
export const Kick: React.FC<{ color?: string; strength?: number }> = ({
  color = "#FFFFFF",
  strength = 0.2,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 6], [strength, strength * 0.6, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o }} />;
};

// ---------------------------------------------------------------------------
// SPEAKER
// ---------------------------------------------------------------------------

/**
 * The matted speaker. `scale` and `anchor` keep him in the lower third so the
 * graphics own the frame — the user asked not to centre attention on the face.
 * A contact pool underneath stops the cut-out reading as a sticker; the colour
 * filter cools the magenta practical on the take so he sits in each palette.
 */
export const Speaker: React.FC<{
  src: string;
  from: number;
  scale?: number;
  filter?: string;
  card?: boolean;
}> = ({ src, from, scale = 0.7, filter = "", card = false }) => {
  const body = (
    <OffthreadVideo
      src={staticFile(src)}
      trimBefore={from}
      transparent
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: `drop-shadow(0 18px 34px rgba(0,0,0,0.75)) ${filter}`,
      }}
    />
  );

  if (card) {
    // A rounded video card legitimises the dark cut-out on a light ground.
    return (
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
        <div
          style={{
            width: "78%",
            height: "62%",
            borderRadius: 40,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(10,30,80,0.35)",
            border: "6px solid rgba(255,255,255,0.9)",
            background: "#0D1117",
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            trimBefore={from}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", filter }}
          />
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 52% 24% at 50% 99%, rgba(0,0,0,0.7) 0%, transparent 70%)",
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "bottom center" }}>
        {body}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
