import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { progress, sec } from "../timing";

export type DimProps = {
  /** Frame the fade starts (it takes `sec(0.4)`). */
  from: number;
  /** Final opacity, 0–1. */
  amount?: number;
  children: ReactNode;
};

/** Fades what it wraps back to `amount` opacity, to push it out of focus. */
export function Dim({ from, amount = 0.3, children }: DimProps) {
  const frame = useCurrentFrame();
  const p = progress(frame, from, from + sec(0.4));
  return <g opacity={1 - (1 - amount) * p}>{children}</g>;
}
