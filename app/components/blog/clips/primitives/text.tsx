import { useCurrentFrame } from "remotion";
import { C, FONT_MONO, FONT_SANS } from "../palette";
import { progress, sec } from "../timing";

export type TextProps = {
  /** Anchor point: the left edge, centre or right edge of the first line, per `align`. */
  x: number;
  y: number;
  /** SVG text doesn't wrap: use "\n" for line breaks. */
  text: string;
  /** Fades in (with a small rise) over `sec(0.4)` from this frame. */
  appearAt: number;
  /** Fades out over `sec(0.4)` from this frame; omit to keep it on screen. */
  exitAt?: number;
  /** Font size in stage px; 34 (the default) is the readable floor at phone width. */
  size?: number;
  /** DM Mono instead of Manrope, for code, IDs and values. */
  mono?: boolean;
  tone?: "ink" | "navy";
  align?: "left" | "center" | "right";
};

const ANCHOR = { left: "start", center: "middle", right: "end" } as const;

/** A label or short annotation anywhere on the stage. */
export function Text({ x, y, text, appearAt, exitAt, size = 34, mono = false, tone = "ink", align = "left" }: TextProps) {
  const frame = useCurrentFrame();
  const enter = progress(frame, appearAt, appearAt + sec(0.4));
  const exit = exitAt === undefined ? 0 : progress(frame, exitAt, exitAt + sec(0.4));
  const opacity = enter * (1 - exit);
  if (opacity <= 0) return null;
  const lines = text.split("\n");
  return (
    <text
      x={x}
      y={y + 10 * (1 - enter)}
      opacity={opacity}
      textAnchor={ANCHOR[align]}
      dominantBaseline="central"
      fill={tone === "navy" ? C.navy : C.ink}
      style={{ fontFamily: mono ? FONT_MONO : FONT_SANS, fontWeight: mono ? 400 : 500, fontSize: size }}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.3}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
