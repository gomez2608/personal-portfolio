import { useCurrentFrame } from "remotion";
import { C, FONT_SANS } from "../palette";
import { formatNumberEs, progress, sec } from "../timing";

export type CounterProps = {
  /** Centre of the number. */
  x: number;
  y: number;
  /**
   * Counts from `from` to `to` (rounded to whole numbers) between frames `start` and `end`.
   * Hidden before `start`; it fades in over `sec(0.3)` as the count begins.
   */
  from: number;
  to: number;
  start: number;
  end: number;
  size?: number;
  /** Appended as is, e.g. `" %"` or `" ms"`. */
  suffix?: string;
  tone?: "ink" | "navy";
  /** Adds a tangerine bar under the number that grows with the count. */
  accent?: boolean;
};

/** A big number counting up (or down), Spanish formatted: `1.000.000`. */
export function Counter({ x, y, from, to, start, end, size = 96, suffix, tone = "ink", accent = false }: CounterProps) {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = progress(frame, start, end);
  const value = Math.round(from + (to - from) * p);
  const barW = size * 1.6;
  const barH = Math.max(4, Math.round(size / 14));
  return (
    <g opacity={progress(frame, start, start + sec(0.3))}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={tone === "navy" ? C.navy : C.ink}
        style={{ fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumberEs(value)}
        {suffix ?? ""}
      </text>
      {accent ? (
        <rect
          x={x - barW / 2}
          y={y + size * 0.6}
          width={barW * p}
          height={barH}
          rx={barH / 2}
          fill={C.tangerine}
        />
      ) : null}
    </g>
  );
}
