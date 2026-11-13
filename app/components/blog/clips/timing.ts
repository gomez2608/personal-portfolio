import type { Caption } from "./clip-def";

/** Every clip is a 1280×720 composition at 30 fps. */
export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

export type Point = [number, number];
export type Ease = (t: number) => number;

/** Seconds → frames (rounded). Write timings as `sec(2.5)` rather than raw frame counts. */
export function sec(s: number): number {
  return Math.round(s * FPS);
}

export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * How far an animation running from frame `start` to frame `end` has got at `frame`:
 * 0 before `start`, 1 from `end` on, eased in between (ease-in-out cubic by default).
 */
export function progress(frame: number, start: number, end: number, ease: Ease = easeInOutCubic): number {
  if (end <= start) return frame >= end ? 1 : 0;
  const t = Math.min(1, Math.max(0, (frame - start) / (end - start)));
  return ease(t);
}

/**
 * The two cubic Bézier control points shared by `connectorPath` and `connectorPoint`.
 * `curve` is the bulge at the midpoint in pixels: 0 is a straight line, positive bends
 * toward −y (up on screen), negative toward +y. A perfectly vertical connector bends
 * toward −x for positive values.
 */
function controlPoints(from: Point, to: Point, curve: number): [Point, Point] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  // Unit normal, oriented so that positive `curve` always points up (or left when vertical).
  let nx = dy / len;
  let ny = -dx / len;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  // With both control points offset by k·curve, the midpoint moves 0.75·k·curve; k = 4/3
  // makes the midpoint bulge exactly `curve` pixels.
  const k = (4 / 3) * curve;
  return [
    [from[0] + dx / 3 + nx * k, from[1] + dy / 3 + ny * k],
    [from[0] + (2 * dx) / 3 + nx * k, from[1] + (2 * dy) / 3 + ny * k],
  ];
}

/** SVG path `d` for a connector from `from` to `to` (see `controlPoints` for `curve`). */
export function connectorPath(from: Point, to: Point, curve: number): string {
  const [c1, c2] = controlPoints(from, to, curve);
  const f = (n: number) => Number(n.toFixed(2));
  return `M ${f(from[0])} ${f(from[1])} C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(to[0])} ${f(to[1])}`;
}

/** The point at parameter `t` (0–1, clamped) along the same curve `connectorPath` draws. */
export function connectorPoint(from: Point, to: Point, curve: number, t: number): Point {
  if (t <= 0) return [from[0], from[1]];
  if (t >= 1) return [to[0], to[1]];
  const [c1, c2] = controlPoints(from, to, curve);
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * from[0] + b * c1[0] + c * c2[0] + d * to[0],
    a * from[1] + b * c1[1] + c * c2[1] + d * to[1],
  ];
}

/** The caption on screen at `frame` (`from` inclusive, `to` exclusive), or null. */
export function activeCaption(captions: Caption[], frame: number): Caption | null {
  return captions.find((c) => frame >= c.from && frame < c.to) ?? null;
}

const numberFormat = new Intl.NumberFormat("es-CO");

/** Colombian Spanish number format: `1.000.000`, `3,5`. */
export function formatNumberEs(n: number): string {
  return numberFormat.format(n);
}
