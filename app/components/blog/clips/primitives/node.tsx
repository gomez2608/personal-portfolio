import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_MONO, FONT_SANS } from "../palette";
import { sec } from "../timing";

const LABEL_SIZE = 34;
const SUB_SIZE = 26;

export type NodeTone = "ink" | "navy" | "accent" | "muted";

const TONES: Record<NodeTone, { fill: string; stroke: string; strokeWidth: number; label: string; sub: string }> = {
  ink: { fill: C.white, stroke: C.ink, strokeWidth: 2, label: C.ink, sub: C.slate },
  navy: { fill: C.navy, stroke: C.navy, strokeWidth: 2, label: C.white, sub: C.fog },
  accent: { fill: C.navy, stroke: C.tangerine, strokeWidth: 3, label: C.white, sub: C.fog },
  muted: { fill: C.fog, stroke: C.line, strokeWidth: 2, label: C.slate, sub: C.slate },
};

export type NodeProps = {
  /** Centre of the box, in the 1280×720 stage. */
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** One short line (Manrope 700, 34px). */
  label: string;
  /** Optional second line (DM Mono, 26px). */
  sub?: string;
  /** Frame the box starts springing in (scale 0.7→1 and fade over `sec(0.5)`). */
  appearAt?: number;
  /** `ink` white box, `navy` filled, `accent` navy with a tangerine border, `muted` fog. */
  tone?: NodeTone;
};

/** A rounded box with a label: the basic unit of every diagram. */
export function Node({ x, y, w = 240, h = 100, label, sub, appearAt = 0, tone = "ink" }: NodeProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - appearAt, fps, durationInFrames: sec(0.5) });
  if (frame < appearAt) return null;

  const s = TONES[tone];
  const scale = 0.7 + 0.3 * t;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={Math.min(1, t)}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={14}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={s.strokeWidth}
      />
      <text
        y={sub ? -18 : 0}
        textAnchor="middle"
        dominantBaseline="central"
        fill={s.label}
        style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: LABEL_SIZE }}
      >
        {label}
      </text>
      {sub ? (
        <text
          y={22}
          textAnchor="middle"
          dominantBaseline="central"
          fill={s.sub}
          style={{ fontFamily: FONT_MONO, fontSize: SUB_SIZE }}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}
