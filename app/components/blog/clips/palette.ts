/**
 * Fixed brand colours for everything drawn on the clip stage. The stage is Paper in both
 * themes, so clips never use the page's theme tokens (they flip in dark mode).
 * Tangerine is signal only: shapes, strokes, dots and rings, never text.
 */
export const C = {
  paper: "#f7f5f0",
  white: "#ffffff",
  fog: "#ece8df",
  line: "#e4e0d6",
  muted: "#b9b5aa",
  slate: "#43465a",
  navy: "#1b2238",
  ink: "#0f1220",
  tangerine: "#f07a2e",
} as const;

export const FONT_SANS = "var(--font-manrope), system-ui, sans-serif";
export const FONT_MONO = "var(--font-dm-mono), ui-monospace, monospace";
