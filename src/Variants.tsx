import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import {
  Bokeh,
  Glass,
  GlossSweep,
  Grain,
  Kick,
  Line,
  MeshGradient,
  Rings,
  Speaker,
} from "./fx";
import { YELLOW } from "./fonts";

/**
 * Three edits of the same 10s take (source 9.75–19.75s), so the look can be
 * chosen by eye rather than description. They share captions, voice and the
 * matted speaker; they differ in palette, graphics and rhythm.
 *
 * Common rules across all three, from the brief: white SF Pro (no outline),
 * yellow handwritten accents that are never upper-cased, full-frame animation
 * rather than a few drifting icons, a beat change every 3–6s, and grain +
 * vignette to mask the 720p source. The speaker sits low and small — the
 * graphics, not the face, carry attention.
 */
const FPS = 30;
const SEG_IN = 9.75;
const SRC = "reel2-source.mp4";
const CUT = "cutout-test.webm";
const sec = (s: number) => Math.round(s * FPS);
const DUR = sec(10);

type Cap = { from: number; to: number; text: string; accent?: boolean };

/** Times are relative to the segment start (frame 0 = source 9.75s). */
const CAPS: Cap[] = [
  { from: 0.0, to: 0.75, text: "первое", accent: true },
  { from: 0.75, to: 2.16, text: "ДОГОВОР\nНА 20 СТРАНИЦ" },
  { from: 2.34, to: 3.85, text: "НЕ ЧИТАЙТЕ\nЦЕЛИКОМ" },
  { from: 3.85, to: 5.25, text: "закиньте\nв нейросеть", accent: true },
  { from: 5.25, to: 7.32, text: "СРОКИ\nШТРАФЫ\nУСЛОВИЯ" },
  { from: 7.68, to: 8.75, text: "одним списком", accent: true },
  { from: 8.75, to: 9.95, text: "ПОЛЧАСА\nЧТЕНИЯ" },
];

const Voice: React.FC = () => (
  <Audio name="Original voice" src={staticFile(SRC)} trimBefore={sec(SEG_IN)} />
);

const Captions: React.FC<{ top?: number; color?: string; scrim?: boolean }> = ({
  top = 0.12,
  color = "#FFFFFF",
  scrim = false,
}) => (
  <AbsoluteFill>
    {CAPS.map((c) => {
      const dur = sec(c.to - c.from);
      if (dur < 4) return null;
      return (
        <Sequence key={c.from} from={sec(c.from)} durationInFrames={dur} layout="none">
          {scrim && !c.accent ? (
            <AbsoluteFill
              style={{
                background: `radial-gradient(ellipse 70% 22% at 50% ${top * 100 + 6}%, rgba(5,11,22,0.55), transparent 70%)`,
              }}
            />
          ) : null}
          <Line
            text={c.text}
            accent={c.accent}
            durationInFrames={dur}
            top={c.accent ? top + 0.02 : top}
            color={color}
            size={c.accent ? 88 : 92}
          />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// Beat windows for the background swaps, shared shape across variants.
const BEATS = [
  { from: 0, to: 3.85 },
  { from: 3.85, to: 7.32 },
  { from: 7.32, to: 10 },
];

// ===========================================================================
// VARIANT A — брендовый глянец (aiup-стиль): синий, стекло, кольца
// ===========================================================================
export const VariantA: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#08122E" }}>
      <Voice />

      {/* Background pools + rings, shifting hue per beat */}
      <MeshGradient
        base="#08122E"
        pools={[
          { color: "#1E5FFF", x: 30, y: 25, r: 900 },
          { color: "#45D0FF", x: 75, y: 60, r: 760 },
          { color: "#0A2E7A", x: 50, y: 90, r: 900 },
        ]}
      />
      <Rings x={50} y={34} color="#45D0FF" count={4} />

      {/* Speaker low, cooled to sit in the blue */}
      <Speaker src={CUT} from={0} scale={0.66} filter="saturate(0.7) hue-rotate(-14deg) brightness(1.04)" />

      {/* Glass card behind the type per beat */}
      {BEATS.map((b, i) => (
        <Sequence key={i} from={sec(b.from)} durationInFrames={sec(b.to - b.from)}>
          <Glass
            delay={2}
            edge={i === 1 ? YELLOW : "#45D0FF"}
            style={{ left: "10%", right: "10%", top: "8%", height: 360 }}
          />
          <GlossSweep delay={4} tint="#9FD8FF" />
          <Kick color="#45D0FF" strength={0.16} />
        </Sequence>
      ))}

      <Captions top={0.13} />
      <Bokeh colors={["#45D0FF", YELLOW]} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// VARIANT B — удержание, без бренда: тёмный + сочные вспышки, крупная кинетика
// ===========================================================================
export const VariantB: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0F" }}>
      <Voice />

      {/* Per-beat colour pools cycle vivid hues for retention */}
      {BEATS.map((b, i) => {
        const palettes = [
          [
            { color: "#2E7BFF", x: 25, y: 30, r: 820 },
            { color: "#7A2EFF", x: 78, y: 68, r: 720 },
          ],
          [
            { color: "#FF3DAE", x: 30, y: 28, r: 780 },
            { color: "#2E7BFF", x: 74, y: 66, r: 760 },
          ],
          [
            { color: "#B6FF3C", x: 28, y: 32, r: 700 },
            { color: "#2E7BFF", x: 76, y: 62, r: 780 },
          ],
        ][i];
        return (
          <Sequence key={i} from={sec(b.from)} durationInFrames={sec(b.to - b.from)}>
            <MeshGradient base="#0A0A0F" pools={palettes} speed={1.5} />
            <Kick color="#FFFFFF" strength={0.24} />
          </Sequence>
        );
      })}

      {/* Speaker with a colour rim, kept small */}
      <Speaker src={CUT} from={0} scale={0.6} filter="saturate(0.9) contrast(1.08)" />

      {/* Big full-frame kinetic type, scrim so white pops on colour */}
      <Captions top={0.1} scrim />

      <Bokeh colors={["#2E7BFF", "#FF3DAE", "#B6FF3C"]} count={9} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// VARIANT C — светлый премиум: ледяной фон, спикер в видео-карточке
// ===========================================================================
export const VariantC: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9F0F8" }}>
      <Voice />

      <MeshGradient
        base="#E9F0F8"
        pools={[
          { color: "#CFE4FF", x: 30, y: 24, r: 900 },
          { color: "#FFF2C4", x: 76, y: 70, r: 620 },
          { color: "#DCEBFF", x: 50, y: 92, r: 820 },
        ]}
        speed={0.7}
      />

      {/* Speaker inside a floating video card — dark cut-out reads clean on light */}
      <Speaker src={CUT} from={0} card filter="saturate(0.95)" />

      {/* Soft glass cards float behind the type */}
      {BEATS.map((b, i) => (
        <Sequence key={i} from={sec(b.from)} durationInFrames={sec(b.to - b.from)}>
          <Glass
            delay={2}
            edge={i === 1 ? YELLOW : "#1E5FFF"}
            style={{
              left: i % 2 ? "44%" : "8%",
              width: "48%",
              top: `${16 + i * 4}%`,
              height: 220,
              background: "rgba(255,255,255,0.5)",
            }}
          />
          <GlossSweep delay={5} tint="#FFFFFF" />
        </Sequence>
      ))}

      {/* Dark type for the light ground; accent stays yellow script */}
      <Captions top={0.11} color="#0E2547" />
      <Bokeh colors={["#1E5FFF", YELLOW]} count={5} />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};
