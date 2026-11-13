import { useId, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../palette";
import { HEIGHT, progress, sec, WIDTH } from "../timing";

export type HighlightProps = {
  /** Frame the ring starts easing on (fully on after `sec(0.4)`). */
  from: number;
  children: ReactNode;
};

/**
 * Eases a tangerine 3px ring and soft glow around whatever it wraps (usually a Node).
 * The filter region is the stage, so use it at the top level of a Scene, not inside a
 * transformed group.
 */
export function Highlight({ from, children }: HighlightProps) {
  const frame = useCurrentFrame();
  // useId output contains characters that are awkward inside url(#…).
  const id = `hl-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const p = progress(frame, from, from + sec(0.4));
  return (
    <>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
          <feMorphology in="SourceAlpha" operator="dilate" radius={3} result="ringShape" />
          <feFlood floodColor={C.tangerine} floodOpacity={p} />
          <feComposite in2="ringShape" operator="in" result="ring" />
          <feMorphology in="SourceAlpha" operator="dilate" radius={6} result="glowShape" />
          <feGaussianBlur in="glowShape" stdDeviation={8} result="glowBlur" />
          <feFlood floodColor={C.tangerine} floodOpacity={0.35 * p} />
          <feComposite in2="glowBlur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="ring" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={p > 0 ? `url(#${id})` : undefined}>{children}</g>
    </>
  );
}
