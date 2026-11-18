import type { ReactNode } from "react";
import { FONT_MONO, FONT_SANS } from "../palette";
import { sec } from "../timing";
import { useAppear } from "./motion";
import { labelFill, labelSize, STROKE, toneColors, type LabelTone, type Radius, type Tone, type Weight } from "./tokens";

type Timing = {
  /** Frame it starts appearing. */
  at?: number;
  /** Frames the appearance takes. */
  dur?: number;
};

export type BoxProps = Timing & {
  /** Top-left corner and size, in stage px. */
  x: number;
  y: number;
  w: number;
  h: number;
  r?: Radius;
  fill?: Tone;
  stroke?: Tone;
  weight?: Weight;
  /** Grow from the left edge instead of fading in. */
  grow?: boolean;
  opacity?: number;
};

/** A rectangle: a page, a row of text, a bar, a cell. */
export function Box({
  x, y, w, h, r = 10, at = 0, dur, fill = "ink", stroke = "none", weight = "thin", grow = false, opacity = 1,
}: BoxProps) {
  const p = useAppear(at, dur);
  if (p <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={grow ? w * p : w}
      height={h}
      rx={r}
      fill={toneColors(fill).fill}
      stroke={toneColors(stroke).stroke}
      strokeWidth={STROKE[weight]}
      opacity={(grow ? 1 : p) * opacity}
    />
  );
}

export type PathProps = Timing & {
  /** Any SVG path `d`, in stage px. */
  d: string;
  stroke?: Tone;
  weight?: Weight;
  /** Dashed instead of solid; a dashed path fades in rather than drawing on. */
  dashed?: boolean;
};

/** Any line or curve, drawn on from its start to its end (`sec(0.8)` by default). */
export function Path({ d, at = 0, dur = sec(0.8), stroke = "ink", weight = "thin", dashed = false }: PathProps) {
  const p = useAppear(at, dur);
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={toneColors(stroke).stroke}
      strokeWidth={STROKE[weight]}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "0.02 0.015" : "1 1"}
      strokeDashoffset={dashed ? undefined : 1 - p}
      opacity={dashed ? p : 1}
    />
  );
}

export type DotProps = Omit<Timing, "dur"> & { x: number; y: number; r?: number; fill?: Tone };

/** A filled circle: a point on a curve, a marker, a token. Pops in over `sec(0.3)`. */
export function Dot({ x, y, r = 10, at = 0, fill = "accent" }: DotProps) {
  const p = useAppear(at, sec(0.3));
  if (p <= 0) return null;
  return <circle cx={x} cy={y} r={r * (0.5 + 0.5 * p)} fill={toneColors(fill).fill} opacity={p} />;
}

export type LabelProps = Omit<Timing, "dur"> & {
  /** Anchor point; `y` is the vertical centre of the line. */
  x: number;
  y: number;
  children: ReactNode;
  /** px; raised to 34 if smaller. Width ≈ 20px/char (Manrope 700) or ≈ 21px/char (DM Mono) at 34px. */
  size?: number;
  mono?: boolean;
  tone?: LabelTone;
  anchor?: "start" | "middle" | "end";
  weight?: 600 | 700 | 800;
};

/** One line of text. Never below 34px, never tangerine. Fades in over `sec(0.4)`. */
export function Label({ x, y, children, at = 0, size, mono = false, tone = "ink", anchor = "start", weight = 700 }: LabelProps) {
  const p = useAppear(at, sec(0.4));
  if (p <= 0) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fill={labelFill(tone)}
      opacity={p}
      style={{
        fontFamily: mono ? FONT_MONO : FONT_SANS,
        fontWeight: mono ? 400 : weight,
        fontSize: labelSize(size),
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </text>
  );
}

export type GroupProps = { x?: number; y?: number; scale?: number; opacity?: number; children: ReactNode };

/** Moves, scales or fades a set of shapes together (to reuse a drawn piece). */
export function Group({ x = 0, y = 0, scale = 1, opacity = 1, children }: GroupProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {children}
    </g>
  );
}
