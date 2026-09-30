"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUI } from "@/app/components/providers/ui-provider";

const SEEN_KEY = "sg-intro";
const SEEN_ATTR = "data-intro-seen";
const BOX = 132;

/**
 * Logo intro. Stages: -1 unmounted, 0 hidden, 1 box in, 2 "sg" + tagline, 3 dot drops,
 * 4 exit (box flies onto the header mark while the backdrop fades).
 * Plays once per session; the head script in layout.tsx hides it for returning visitors.
 */
export default function IntroOverlay() {
  const { setIntroActive, replayToken } = useUI();
  const [stage, setStage] = useState(0);
  const [morph, setMorph] = useState("scale(1)");
  const boxRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const exit = useCallback(() => {
    clearTimers();
    const box = boxRef.current?.getBoundingClientRect();
    const mark = document
      .querySelector("[data-header-mark]")
      ?.getBoundingClientRect();
    if (box && mark) {
      const dx = mark.left + mark.width / 2 - (box.left + box.width / 2);
      const dy = mark.top + mark.height / 2 - (box.top + box.height / 2);
      setMorph(`translate(${dx}px,${dy}px) scale(${mark.width / BOX})`);
    } else {
      setMorph("translate(0px,-60vh) scale(.3)");
    }
    setStage(4);
    timers.current = [
      setTimeout(() => {
        setStage(-1);
        setIntroActive(false);
        document.documentElement.setAttribute(SEEN_ATTR, "");
      }, 1000),
    ];
  }, [setIntroActive]);

  const play = useCallback(() => {
    clearTimers();
    document.documentElement.removeAttribute(SEEN_ATTR);
    setIntroActive(true);
    setMorph("scale(1)");
    setStage(0);
    const at = (ms: number, s: number) => setTimeout(() => setStage(s), ms);
    timers.current = [
      at(60, 1),
      at(520, 2),
      at(950, 3),
      setTimeout(exit, 1900),
    ];
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }, [exit, setIntroActive]);

  // First visit this session plays; otherwise unmount straight away.
  useEffect(() => {
    if (document.documentElement.hasAttribute(SEEN_ATTR)) {
      setStage(-1);
      setIntroActive(false);
    } else {
      play();
    }
    return clearTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Footer "Replay intro".
  useEffect(() => {
    if (replayToken > 0) play();
  }, [replayToken, play]);

  if (stage === -1) return null;

  const exiting = stage >= 4;

  return (
    <div
      data-intro-overlay
      aria-hidden="true"
      onClick={() => stage < 4 && exit()}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center"
      style={{
        backgroundColor: exiting ? "rgba(27,34,56,0)" : "#1B2238",
        transition: "background-color .7s ease .15s",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-7">
        <div
          ref={boxRef}
          className="relative size-[132px] origin-center rounded-[28px] bg-paper"
          style={{
            transition: exiting
              ? "transform .9s cubic-bezier(.7,0,.2,1)"
              : "transform .5s cubic-bezier(.3,1.4,.5,1), opacity .4s",
            transform: exiting ? morph : stage >= 1 ? "scale(1)" : "scale(.6)",
            opacity: stage >= 1 ? 1 : 0,
          }}
        >
          <span
            className="absolute top-3.5 left-5 text-5xl leading-none font-bold tracking-[-.05em] text-hero transition-opacity duration-400"
            style={{ opacity: stage >= 2 ? 1 : 0 }}
          >
            sg
          </span>
          <span
            className="absolute right-[21px] bottom-[21px] size-[34px] rounded-full bg-tangerine"
            style={{
              transition:
                "transform .6s cubic-bezier(.3,1.7,.5,1), opacity .2s",
              transform:
                stage >= 3
                  ? "translateY(0) scale(1)"
                  : "translateY(-160px) scale(.6)",
              opacity: stage >= 3 ? 1 : 0,
            }}
          />
        </div>
        <span
          className="font-mono text-[13px] leading-none tracking-[.14em] text-haze uppercase transition-opacity duration-300"
          style={{ opacity: stage >= 2 && stage < 4 ? 1 : 0 }}
        >
          Frontier AI, made dependable
        </span>
      </div>
    </div>
  );
}
