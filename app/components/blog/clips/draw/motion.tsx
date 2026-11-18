import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { progress, sec, type Point } from "../timing";

/** The current frame, so clips never import `remotion` themselves. */
export function useClipFrame(): number {
  return useCurrentFrame();
}

/** 0 → 1 as something appears, eased like every other clip motion (`sec(0.5)` by default). */
export function useAppear(at: number, dur: number = sec(0.5)): number {
  return progress(useCurrentFrame(), at, at + dur);
}

/** Fades its children down to `to` opacity between `from` and `from + dur`. */
export function Fade({ from, to = 0.2, dur = sec(0.6), children }: { from: number; to?: number; dur?: number; children: ReactNode }) {
  const p = useAppear(from, dur);
  return <g opacity={1 - (1 - to) * p}>{children}</g>;
}

/** Folds its children away: squashes them vertically onto the line `originY` and fades them. */
export function Fold({ from, originY, dur = sec(0.8), children }: { from: number; originY: number; dur?: number; children: ReactNode }) {
  const p = useAppear(from, dur);
  if (p >= 1) return null;
  return (
    <g transform={`translate(0 ${originY}) scale(1 ${1 - p}) translate(0 ${-originY})`} opacity={1 - 0.6 * p}>
      {children}
    </g>
  );
}

/** The point at fraction `t` (0–1) of the polyline's length. */
export function pointAlong(points: Point[], t: number): Point {
  if (points.length === 0) return [0, 0];
  if (points.length === 1 || t <= 0) return points[0];
  const seg = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.min(1, t) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] === 0 ? 0 : Math.min(1, d / seg[i]);
      const [a, b] = [points[i], points[i + 1]];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= seg[i];
  }
  return points[points.length - 1];
}

/**
 * Moves its children along the polyline through `points` between frames `from` and `to`.
 * Draw the children around (0, 0): they are translated to the current point.
 */
export function MoveAlong({ points, from, to, children }: { points: Point[]; from: number; to: number; children: ReactNode }) {
  const [x, y] = pointAlong(points, progress(useCurrentFrame(), from, to));
  return <g transform={`translate(${x} ${y})`}>{children}</g>;
}

/** One gentle pulse (scale 1 → 1.06 → 1 about `x, y`) over `sec(0.6)`, to point at something. */
export function Pulse({ at, x, y, children }: { at: number; x: number; y: number; children: ReactNode }) {
  const p = useAppear(at, sec(0.6));
  const s = 1 + 0.06 * Math.sin(Math.PI * p);
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</g>;
}
