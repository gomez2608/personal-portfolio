import { useCurrentFrame } from "remotion";
import { C, FONT_SANS } from "../palette";
import { progress, sec, WIDTH } from "../timing";

export type TitleProps = {
  /** One line; SVG text doesn't wrap, so keep it short (about 30 characters at 64px). */
  text: string;
  /** Slides up and fades in over `sec(0.5)` from this frame. */
  appearAt: number;
  /** Fades out over `sec(0.4)` from this frame; omit to keep it on screen. */
  exitAt?: number;
  y?: number;
  size?: number;
};

/** A centred headline (Manrope 800, ink), for openers and section beats. */
export function Title({ text, appearAt, exitAt, y = 330, size = 64 }: TitleProps) {
  const frame = useCurrentFrame();
  const enter = progress(frame, appearAt, appearAt + sec(0.5));
  const exit = exitAt === undefined ? 0 : progress(frame, exitAt, exitAt + sec(0.4));
  const opacity = enter * (1 - exit);
  if (opacity <= 0) return null;
  const dy = 24 * (1 - enter) - 16 * exit;
  return (
    <text
      x={WIDTH / 2}
      y={y + dy}
      opacity={opacity}
      textAnchor="middle"
      dominantBaseline="central"
      fill={C.ink}
      style={{ fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, letterSpacing: "-0.02em" }}
    >
      {text}
    </text>
  );
}
