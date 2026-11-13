import { useCurrentFrame } from "remotion";
import { C } from "../palette";
import { connectorPath, progress, type Point } from "../timing";

export type ConnectorTone = "ink" | "accent" | "muted";

const STROKES: Record<ConnectorTone, string> = { ink: C.ink, accent: C.tangerine, muted: C.muted };

export type ConnectorProps = {
  from: Point;
  to: Point;
  /** Midpoint bulge in px: 0 straight, positive bends up (−y), negative down. */
  curve?: number;
  /** The line draws on from `drawFrom` to `drawTo` (frames). */
  drawFrom: number;
  drawTo: number;
  tone?: ConnectorTone;
  width?: number;
};

/** A line (straight or curved) that draws itself on between two points. */
export function Connector({ from, to, curve = 0, drawFrom, drawTo, tone = "ink", width = 2 }: ConnectorProps) {
  const frame = useCurrentFrame();
  const p = progress(frame, drawFrom, drawTo);
  if (p <= 0) return null;
  return (
    <path
      d={connectorPath(from, to, curve)}
      fill="none"
      stroke={STROKES[tone]}
      strokeWidth={width}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  );
}
