import { useCurrentFrame } from "remotion";
import { C } from "../palette";
import { connectorPoint, progress, type Point } from "../timing";

export type FlowDotTone = "accent" | "ink" | "navy";

const FILLS: Record<FlowDotTone, string> = { accent: C.tangerine, ink: C.ink, navy: C.navy };

export type FlowDotProps = {
  /** Use the same `from`, `to` and `curve` as the Connector it travels along. */
  from: Point;
  to: Point;
  curve?: number;
  /** Travels from `start` to `end` (frames); hidden outside that window. */
  start: number;
  end: number;
  tone?: FlowDotTone;
  r?: number;
};

/** A dot travelling along a connector: data, a request or a token moving between nodes. */
export function FlowDot({ from, to, curve = 0, start, end, tone = "accent", r = 7 }: FlowDotProps) {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const [cx, cy] = connectorPoint(from, to, curve, progress(frame, start, end));
  return <circle cx={cx} cy={cy} r={r} fill={FILLS[tone]} />;
}
