import type { FC } from "react";
import { sec } from "./timing";

/** A caption, in frames. `from` is inclusive, `to` exclusive. Shown in the HTML caption bar under the stage (burned in only for snapshots). */
export type Caption = { from: number; to: number; text: string };

export type ClipDef = {
  /** `clip-<n>`, unique within the post. */
  id: string;
  /** What the clip shows, in Spanish. Used as the player's accessible label. */
  title: string;
  /** Between `sec(8)` and `sec(25)`. */
  durationInFrames: number;
  /** Sorted, non-overlapping, the first one starting at frame 0, each 1–70 characters
   *  (fits 3 lines of the caption bar on a 375 px phone). */
  captions: Caption[];
  /** The animation: `() => <>...primitives...</>`, drawn inside the 1280×720 SVG stage. */
  Scene: FC;
};

/** What a clip module default-exports: a client component that plays the clip. */
export type ClipComponent = FC & { def: ClipDef };

export const MIN_DURATION = sec(8);
export const MAX_DURATION = sec(25);
export const MAX_CAPTION_LENGTH = 70;

/** Returns one message per problem; an empty array means the clip is valid. */
export function validateClipDef(def: ClipDef): string[] {
  const errors: string[] = [];
  const d = def.durationInFrames;

  if (!/^clip-\d+$/.test(def.id)) errors.push(`id "${def.id}" must look like "clip-1"`);
  if (!def.title?.trim()) errors.push(`${def.id}: title must not be empty`);
  if (!Number.isInteger(d) || d < MIN_DURATION || d > MAX_DURATION) {
    errors.push(`${def.id}: durationInFrames ${d} must be an integer between ${MIN_DURATION} and ${MAX_DURATION} (8–25 s)`);
  }

  if (def.captions.length === 0) {
    errors.push(`${def.id}: needs at least one caption`);
    return errors;
  }
  if (def.captions[0].from !== 0) errors.push(`${def.id}: the first caption must start at frame 0`);

  def.captions.forEach((c, i) => {
    const label = `${def.id}: caption ${i + 1}`;
    if (!(c.from < c.to)) errors.push(`${label} must end after it starts (${c.from}–${c.to})`);
    if (c.from < 0 || c.to > d) errors.push(`${label} (${c.from}–${c.to}) must fit within the clip (0–${d})`);
    const len = c.text.trim().length;
    if (len < 1 || c.text.length > MAX_CAPTION_LENGTH) {
      errors.push(`${label} text must be 1–${MAX_CAPTION_LENGTH} characters (has ${c.text.length})`);
    }
    const prev = def.captions[i - 1];
    if (prev) {
      if (c.from < prev.from) errors.push(`${label} must not start before caption ${i}`);
      else if (c.from < prev.to) errors.push(`${label} overlaps caption ${i} (starts at ${c.from}, caption ${i} ends at ${prev.to})`);
    }
  });

  return errors;
}
