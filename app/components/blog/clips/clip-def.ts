import { createElement, type FC } from "react";
import { ClipPlayer } from "./clip-player";
import { validateClipDef, type ClipComponent, type ClipDef } from "./clip-types";

// Player-free types and validation live in clip-types; re-exported so imports keep working.
export {
  MAX_CAPTION_LENGTH,
  MAX_DURATION,
  MIN_DURATION,
  validateClipDef,
  type Caption,
  type ClipComponent,
  type ClipDef,
} from "./clip-types";

/**
 * Turns a clip definition into the component a clip module default-exports. Clip modules
 * are `"use client"` modules; server components (MDX pages) only render `<Clip1 />`.
 * In development an invalid definition throws, listing every problem.
 */
export function defineClip(def: ClipDef): ClipComponent {
  if (process.env.NODE_ENV !== "production") {
    const errors = validateClipDef(def);
    if (errors.length > 0) throw new Error(`Invalid clip definition:\n- ${errors.join("\n- ")}`);
  }
  const Clip: FC = () => createElement(ClipPlayer, { def });
  Clip.displayName = `Clip(${def.id})`;
  return Object.assign(Clip, { def });
}
