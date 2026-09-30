"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { TechLogo } from "@/app/components/shared/tech-logo";
import { marqueeStack } from "@/app/data/content";

const REPEATS = 4;
const SPEED_PX_PER_S = 40;
const SCROLL_FACTOR = 0.6;

/**
 * Stack band that drifts left continuously; scrolling the page pushes it further.
 * Wraps after exactly one set of logos, so the loop is seamless.
 */
export default function StackMarquee() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const x = useMotionValue(0);
  const bandRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const elapsed = useRef(0);
  const setWidth = useRef(0);

  // Skip frame work while the band is off screen, and cache the loop length.
  useEffect(() => {
    const band = bandRef.current;
    const set = setRef.current;
    if (!band || !set) return;
    const io = new IntersectionObserver(
      ([e]) => (visible.current = e.isIntersecting),
    );
    const ro = new ResizeObserver(() => (setWidth.current = set.offsetWidth));
    io.observe(band);
    ro.observe(set);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible.current) return;
    const w = setWidth.current;
    if (!w) return;
    elapsed.current += (delta / 1000) * SPEED_PX_PER_S;
    x.set(-((elapsed.current + scrollY.get() * SCROLL_FACTOR) % w));
  });

  return (
    <div
      ref={bandRef}
      className="overflow-hidden border-b border-line bg-fog py-[22px]"
    >
      <ul className="sr-only">
        {marqueeStack.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <motion.div
        aria-hidden="true"
        style={{ x }}
        className="flex w-max whitespace-nowrap"
      >
        {Array.from({ length: REPEATS }, (_, r) => (
          // Trailing padding equals the gap, so one set's width is the exact loop length.
          <div
            key={r}
            ref={r === 0 ? setRef : undefined}
            className="flex gap-12 pr-12"
          >
            {marqueeStack.map((name) => (
              <span
                key={name}
                className="flex items-center gap-3.5 text-[28px] leading-none font-bold tracking-[-.02em] text-navy"
              >
                <TechLogo name={name} className="size-7" />
                {name}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
