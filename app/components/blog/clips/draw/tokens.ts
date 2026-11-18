import { C } from "../palette";

/** The only ways a shape may be painted. `ink` is a white fill with an ink outline. */
export type Tone = "ink" | "navy" | "fog" | "line" | "muted" | "accent" | "none";

const TONES: Record<Tone, { fill: string; stroke: string }> = {
  ink: { fill: C.white, stroke: C.ink },
  navy: { fill: C.navy, stroke: C.navy },
  fog: { fill: C.fog, stroke: C.line },
  line: { fill: C.line, stroke: C.line },
  muted: { fill: C.muted, stroke: C.muted },
  accent: { fill: C.tangerine, stroke: C.tangerine },
  none: { fill: "none", stroke: "none" },
};

export function toneColors(t: Tone): { fill: string; stroke: string } {
  return TONES[t];
}

export type Weight = "thin" | "bold";
export const STROKE: Record<Weight, 2 | 3> = { thin: 2, bold: 3 };

export type Radius = 6 | 10 | 14;

/** Text colours. Tangerine is signal only, so it is not one of them. */
export type LabelTone = "ink" | "navy" | "slate" | "white";

const LABEL_FILL: Record<LabelTone, string> = { ink: C.ink, navy: C.navy, slate: C.slate, white: C.white };

export function labelFill(t: LabelTone): string {
  return LABEL_FILL[t];
}

/** 34px is the readable floor at phone width; smaller sizes are raised to it. */
export const MIN_LABEL_SIZE = 34;

export function labelSize(n?: number): number {
  return Math.max(MIN_LABEL_SIZE, n ?? MIN_LABEL_SIZE);
}
