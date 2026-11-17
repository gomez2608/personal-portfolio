"use client";

import { Thumbnail } from "@remotion/player";
import { useEffect, useState } from "react";
import { CaptionBar } from "@/app/components/blog/clips/caption-bar";
import { ClipFrame } from "@/app/components/blog/clips/clip-frame";
import type { ClipDef } from "@/app/components/blog/clips/clip-types";
import { activeCaption, FPS, HEIGHT, WIDTH } from "@/app/components/blog/clips/timing";
import { clipRegistry } from "@/lib/blog/clip-registry.generated";

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; def: ClipDef };

const OVERLAY = { position: "fixed", inset: 0, zIndex: 100, background: "#f7f5f0" } as const;

/**
 * One frame of a clip: the 1280×720 stage with the page's caption bar under it, wrapped in
 * `[data-snap]` (what `blog:snap` screenshots). `data-ready` flips once the clip and fonts
 * have loaded.
 */
export function FrameView({ slug, clip, frame }: { slug: string; clip: string; frame: number }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = Object.hasOwn(clipRegistry, slug) ? clipRegistry[slug]?.[clip] : undefined;
    const done = (next: State) => {
      if (cancelled) return;
      setState(next);
      // Two frames after the commit so the thumbnail has painted with the loaded fonts.
      document.fonts.ready.then(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setReady(true))),
      );
    };
    if (!load || !Object.hasOwn(clipRegistry[slug], clip)) {
      done({ status: "missing" });
    } else {
      // Registered but broken (a syntax error, or defineClip rejecting the definition).
      load().then(
        (mod) =>
          mod?.default?.def
            ? done({ status: "ready", def: mod.default.def })
            : done({ status: "error", message: "the module does not default-export defineClip({...})" }),
        (e: unknown) => done({ status: "error", message: e instanceof Error ? e.message : String(e) }),
      );
    }
    return () => {
      cancelled = true;
    };
  }, [slug, clip]);

  if (state.status === "missing") {
    return (
      <div style={{ ...OVERLAY, padding: 24, fontFamily: "monospace", color: "#0f1220" }} data-ready={ready ? "true" : undefined} data-missing="true">
        No se encontró el clip &quot;{slug}/{clip}&quot; en el registro. Ejecuta npm run blog:registry.
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ ...OVERLAY, padding: 24, fontFamily: "monospace", color: "#0f1220", whiteSpace: "pre-wrap" }} data-ready={ready ? "true" : undefined} data-error="true">
        No se pudo cargar el clip &quot;{slug}/{clip}&quot;:{"\n"}
        <span data-error-message>{state.message}</span>
      </div>
    );
  }

  if (state.status === "loading") return <div style={OVERLAY} />;

  const { def } = state;
  const shown = Math.min(frame, def.durationInFrames - 1);
  return (
    <div style={OVERLAY} data-ready={ready ? "true" : undefined} data-duration={def.durationInFrames} data-frame={shown}>
      <div data-snap style={{ width: WIDTH }}>
        <div data-stage style={{ width: WIDTH, height: HEIGHT }}>
          <Thumbnail
            component={ClipFrame}
            inputProps={{ def }}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            durationInFrames={def.durationInFrames}
            fps={FPS}
            frameToDisplay={shown}
            style={{ width: WIDTH, height: HEIGHT }}
          />
        </div>
        <CaptionBar text={activeCaption(def.captions, shown)?.text ?? ""} />
      </div>
    </div>
  );
}
