import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";
import { MODE, Mode } from "./theme";

/**
 * The dotted connectors between cards.
 *
 * Reference B joins its four pipeline cards with hand-drawn-looking arcs made
 * of round dots, each carrying a small rotated "2 шаг" label. The dots draw on
 * progressively rather than fading in as a whole, which is what makes the eye
 * travel from one card to the next in the right order.
 */

export const DottedArc: React.FC<{
  mode: Mode;
  /** Endpoints and the control point, in canvas coordinates. */
  from: [number, number];
  to: [number, number];
  bend?: number;
  dots?: number;
  label?: string;
  delay?: number;
  /** Frames the draw-on takes from first dot to last. */
  draw?: number;
}> = ({ mode, from, to, bend = 90, dots = 13, label, delay = 0, draw = 14 }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  const [x1, y1] = from;
  const [x2, y2] = to;
  // Control point pushed perpendicular to the chord, so the arc always bows
  // away from the straight line regardless of the cards' relative positions.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;

  const at = (t: number): [number, number] => [
    (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
  ];

  const [lx, ly] = at(0.5);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const labelIn = interpolate(frame, [delay + draw * 0.4, delay + draw * 0.4 + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {Array.from({ length: dots }).map((_, i) => {
        const t = i / (dots - 1);
        const [x, y] = at(t);
        const e = interpolate(
          frame,
          [delay + (i / dots) * draw, delay + (i / dots) * draw + 5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        // The dots grow slightly toward the end of the arc, which reads as a
        // direction of travel without needing an arrowhead.
        const r = 5 + t * 2.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r * 2,
              background: m.dot,
              opacity: e,
              transform: `scale(${e})`,
            }}
          />
        );
      })}
      {label ? (
        <div
          style={{
            position: "absolute",
            left: lx,
            top: ly,
            transform: `translate(-50%, -50%) rotate(${angle - 90}deg)`,
            fontFamily: uiFont,
            fontSize: 24,
            color: m.mute,
            opacity: labelIn,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};

/**
 * The closed dotted loop from reference A: a diamond of dots enclosing a group
 * of labels, saying "these things are one circuit" without drawing a box.
 */
export const DottedLoop: React.FC<{
  mode: Mode;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  dots?: number;
  delay?: number;
  draw?: number;
}> = ({ mode, cx, cy, rx, ry, dots = 40, delay = 0, draw = 24 }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  return (
    <>
      {Array.from({ length: dots }).map((_, i) => {
        const t = (i / dots) * Math.PI * 2 - Math.PI / 2;
        // A squared-off sine gives the diamond-with-soft-corners shape the
        // reference uses, rather than a plain ellipse.
        const sx = Math.cos(t);
        const sy = Math.sin(t);
        const k = 0.62;
        const x = cx + Math.sign(sx) * Math.pow(Math.abs(sx), k) * rx;
        const y = cy + Math.sign(sy) * Math.pow(Math.abs(sy), k) * ry;
        const e = interpolate(
          frame,
          [delay + (i / dots) * draw, delay + (i / dots) * draw + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 5,
              top: y - 5,
              width: 10,
              height: 10,
              borderRadius: 10,
              background: m.dot,
              opacity: e * 0.9,
              transform: `scale(${e})`,
            }}
          />
        );
      })}
    </>
  );
};

/** Straight run of dots, used to lead the eye from a phrase to a row of logos. */
export const DottedRun: React.FC<{
  mode: Mode;
  x: number;
  y: number;
  width: number;
  dots?: number;
  delay?: number;
}> = ({ mode, x, y, width, dots = 9, delay = 0 }) => {
  const frame = useCurrentFrame();
  const m = MODE[mode];
  return (
    <>
      {Array.from({ length: dots }).map((_, i) => {
        const e = interpolate(frame, [delay + i * 1.6, delay + i * 1.6 + 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + (i / (dots - 1)) * width,
              top: y,
              width: 8,
              height: 8,
              borderRadius: 8,
              background: m.dot,
              opacity: e,
            }}
          />
        );
      })}
    </>
  );
};
