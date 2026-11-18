// Brand drawing layer: free-form shapes for clips drawn from each paper's own objects (a
// reasoning trace, a form, a timeline, a grid), when the eight primitives would turn every
// paper into the same boxes and lines. Mix freely with the primitives.
//
// Props accept brand tokens only: tones (`ink`, `navy`, `fog`, `line`, `muted`, `accent`,
// `none`), stroke weights `thin` (2) and `bold` (3), radii 6/10/14. Labels are never below
// 34px (smaller sizes are raised) and never tangerine. Coordinates are stage px (1280×720),
// timings frames (`sec()`); keep ~40px clear of every edge. Text widths at 34px: ≈20px per
// character for Manrope 700, ≈21px for DM Mono. Clips may only import clip-def, primitives,
// draw and timing (`blog:check` enforces it), so frame-driven code uses `useClipFrame`.
export { Box, Dot, Group, Label, Path, type BoxProps, type DotProps, type GroupProps, type LabelProps, type PathProps } from "./atoms";
export { Fade, Fold, MoveAlong, Pulse, pointAlong, useAppear, useClipFrame } from "./motion";
export { labelSize, STROKE, toneColors, type LabelTone, type Radius, type Tone, type Weight } from "./tokens";
