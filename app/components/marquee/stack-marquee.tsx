"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { TechLogo } from "@/app/components/shared/tech-logo";
import { marqueeStack } from "@/app/data/content";

const REPEATS = 4;

/** Scroll-linked stack band: moves left as the page scrolls. */
export default function StackMarquee() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, (v) => (reduce ? 0 : -((v * 0.6) % 1400)));

  return (
    <div className="overflow-hidden border-b border-line bg-fog py-[22px]">
      <ul className="sr-only">
        {marqueeStack.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <motion.div
        aria-hidden="true"
        style={{ x }}
        className="flex w-max gap-12 whitespace-nowrap"
      >
        {Array.from({ length: REPEATS }, (_, r) =>
          marqueeStack.map((name) => (
            <span
              key={`${r}-${name}`}
              className="flex items-center gap-3.5 text-[28px] leading-none font-bold tracking-[-.02em] text-navy"
            >
              <TechLogo name={name} className="size-7" />
              {name}
            </span>
          )),
        )}
      </motion.div>
    </div>
  );
}
