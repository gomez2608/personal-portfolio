"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ClipDef } from "./clip-types";
import { CaptionBar } from "./caption-bar";
import { ClipFrame } from "./clip-frame";
import { playbackPolicy } from "./playback";
import { activeCaptionIndex, FPS, HEIGHT, WIDTH } from "./timing";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Plays a clip in the page like a silent video: muted, looping, only while at least half of
 * it is on screen. With reduced motion it rests on the final frame until the visitor
 * presses play. The stage is always Paper; the frame, caption bar and controls follow the
 * theme. Captions are HTML under the stage, so they stay legible when the stage is scaled down.
 */
export function ClipPlayer({ def }: { def: ClipDef }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const transcriptId = useId();

  const reducedMotion = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(() => activeCaptionIndex(def.captions, 0));

  const { autoplay, showFinalFrame } = playbackPolicy({ reducedMotion, inView, userPaused, userStarted });
  const lastFrame = def.durationInFrames - 1;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Two thresholds: crossing 0.5 starts or stops playback, and crossing 0 catches a clip
    // that was under half visible (started with the button) and then leaves the screen.
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mirror the player's state into the button label, the caption bar and the progress bar.
  // The bar is updated through a ref, and the caption index only changes a few times per
  // clip (React skips same-value updates), so frames don't re-render the component.
  const { captions } = def;
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const sync = (frame: number) => {
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${frame / lastFrame})`;
      setCaptionIndex(activeCaptionIndex(captions, frame));
    };
    const onFrame = (e: { detail: { frame: number } }) => sync(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("seeked", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    sync(player.getCurrentFrame());
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("seeked", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [lastFrame, captions]);

  // The single place playbackPolicy is applied.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (showFinalFrame) {
      player.pause();
      player.seekTo(lastFrame);
    } else if (autoplay) {
      if (!player.isPlaying()) player.play();
    } else if (player.isPlaying()) {
      player.pause();
    }
  }, [autoplay, showFinalFrame, lastFrame]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      setUserPaused(true);
      return;
    }
    // Resting on the final frame (reduced motion): start from the beginning.
    if (showFinalFrame) player.seekTo(0);
    setUserPaused(false);
    setUserStarted(true);
    // A visitor who can press the button can see the clip, even if under half of it is on
    // screen; the observer corrects this on the next threshold crossing.
    setInView(true);
  }, [showFinalFrame]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={def.title}
      aria-describedby={transcriptId}
      className="my-8 overflow-hidden rounded-xl border border-line bg-card"
    >
      <Player
        ref={playerRef}
        component={ClipFrame}
        inputProps={{ def }}
        durationInFrames={def.durationInFrames}
        compositionWidth={WIDTH}
        compositionHeight={HEIGHT}
        fps={FPS}
        loop
        initiallyMuted
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        // Remotion is free for individuals; this silences the license notice in the console.
        acknowledgeRemotionLicense
        style={{ width: "100%" }}
      />
      {/* Screen readers get the whole transcript at once; the visible bar is decorative for them. */}
      <ol id={transcriptId} className="sr-only">
        {def.captions.map((c) => (
          <li key={c.from}>{c.text}</li>
        ))}
      </ol>
      <CaptionBar text={def.captions[captionIndex]?.text ?? ""} />
      <div className="flex items-center gap-3 border-t border-line px-3 py-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Reproducir"}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-graphite text-ink transition-colors hover:bg-fog"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
            {playing ? (
              <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
            ) : (
              <path d="M4.5 2.2v11.6a.5.5 0 0 0 .76.43l9.3-5.8a.5.5 0 0 0 0-.86l-9.3-5.8a.5.5 0 0 0-.76.43z" />
            )}
          </svg>
        </button>
        <div aria-hidden="true" className="h-[3px] flex-1 overflow-hidden rounded-full bg-fog dark:bg-line">
          <div ref={progressRef} className="h-full origin-left bg-tangerine" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
