import { AbsoluteFill } from "remotion";
import type { ClipDef } from "./clip-types";
import { C } from "./palette";
import { HEIGHT, WIDTH } from "./timing";

/**
 * The Remotion composition for a clip: a Paper stage (in both themes) and the Scene drawn
 * into one shared 1280×720 SVG. The stage never draws captions: `ClipPlayer` (and the
 * snapshot route) show them as HTML in a bar under the stage, so scenes may use the full
 * 1280×720.
 */
export function ClipFrame({ def }: { def: ClipDef }) {
  const { Scene } = def;

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <Scene />
      </svg>
    </AbsoluteFill>
  );
}
