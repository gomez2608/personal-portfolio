import { expect, test } from "vitest";
import { playbackPolicy } from "./playback";

test.each([
  [{ reducedMotion: false, inView: true, userPaused: false, userStarted: false }, { autoplay: true, showFinalFrame: false }],
  [{ reducedMotion: false, inView: false, userPaused: false, userStarted: false }, { autoplay: false, showFinalFrame: false }],
  [{ reducedMotion: false, inView: true, userPaused: true, userStarted: true }, { autoplay: false, showFinalFrame: false }],
  [{ reducedMotion: true, inView: true, userPaused: false, userStarted: false }, { autoplay: false, showFinalFrame: true }],
  [{ reducedMotion: true, inView: true, userPaused: false, userStarted: true }, { autoplay: true, showFinalFrame: false }],
  [{ reducedMotion: true, inView: false, userPaused: false, userStarted: true }, { autoplay: false, showFinalFrame: false }],
])("playbackPolicy(%o)", (input, want) => expect(playbackPolicy(input)).toEqual(want));
