import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ClipDef } from "./clip-types";
import { C, FONT_SANS } from "./palette";
import { activeCaption, HEIGHT, WIDTH } from "./timing";

/**
 * The Remotion composition for a clip: a Paper stage (in both themes) and the Scene drawn
 * into one shared 1280×720 SVG. In the page, `ClipPlayer` shows captions as HTML under the
 * stage (legible on phones); `burnCaptions` draws them into the bottom ~140px of the stage
 * instead, for snapshots and stills.
 */
export function ClipFrame({ def, burnCaptions = false }: { def: ClipDef; burnCaptions?: boolean }) {
  const frame = useCurrentFrame();
  const caption = burnCaptions ? activeCaption(def.captions, frame) : null;
  const { Scene } = def;

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AbsoluteFill>
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
      {caption ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 36 }}>
          <p
            style={{
              margin: 0,
              maxWidth: 1040,
              padding: "12px 28px",
              borderRadius: 24,
              backgroundColor: "rgba(247, 245, 240, 0.88)",
              color: C.ink,
              fontFamily: FONT_SANS,
              fontSize: 30,
              fontWeight: 600,
              lineHeight: 1.3,
              textAlign: "center",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {caption.text}
          </p>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
