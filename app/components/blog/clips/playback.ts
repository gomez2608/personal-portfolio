export type PlaybackState = {
  /** The visitor prefers reduced motion. */
  reducedMotion: boolean;
  /** At least half the clip is on screen. */
  inView: boolean;
  /** True while the visitor has paused the clip themselves. */
  userPaused: boolean;
  /** Becomes true the first time the visitor presses play. */
  userStarted: boolean;
};

export type PlaybackDecision = {
  /** The player should be playing right now. */
  autoplay: boolean;
  /** The player should rest on its last frame (reduced motion, not started yet). */
  showFinalFrame: boolean;
};

export function playbackPolicy(s: PlaybackState): PlaybackDecision {
  return {
    autoplay: s.inView && !s.userPaused && (!s.reducedMotion || s.userStarted),
    showFinalFrame: s.reducedMotion && !s.userStarted,
  };
}
