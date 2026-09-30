"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { NewTab, useLang } from "@/app/components/providers/lang-provider";
import { scrollToId } from "@/app/components/providers/ui-provider";
import { site } from "@/app/data/site";
import { StatusPill } from "./status-pill";
import { TypedRole } from "./typed-role";

const btn =
  "rounded-lg px-[18px] py-3.5 text-sm leading-none font-semibold transition-colors";

export default function Hero() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) =>
    reduce ? 0 : Math.min(v, 600) * 0.18,
  );
  const opacity = useTransform(scrollY, (v) =>
    reduce ? 1 : Math.max(0.15, 1 - v / 700),
  );

  return (
    <section id="top" className="overflow-hidden bg-s-bg text-s-fg">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[clamp(36px,5vw,56px)] px-[clamp(20px,4vw,40px)] pt-[clamp(128px,16vw,176px)] pb-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[13px] leading-none tracking-[.12em] text-s-2 uppercase">
            {t.kicker}
          </span>
          <StatusPill />
        </div>

        <motion.h1
          style={{ y, opacity }}
          className="m-0 text-[clamp(56px,10.5vw,152px)] leading-[.92] font-extrabold tracking-[-.055em] text-balance"
        >
          {t.h1a}
          <br />
          {t.h1b}
          <span className="text-tangerine">.</span>
        </motion.h1>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-16 gap-y-8">
          <p className="m-0 max-w-[600px] text-xl leading-[1.6] text-pretty text-s-2">
            {t.hello}
          </p>
          <div className="flex flex-col gap-6">
            <TypedRole />
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => scrollToId("contact-form")}
                className={`${btn} flex items-center gap-2.5 bg-s-cta text-s-cta-fg hover:bg-s-cta-hover`}
              >
                {t.cta}
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-tangerine"
                />
              </button>
              <a
                href={site.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border border-s-line-strong hover:border-s-2`}
              >
                {t.cv} ↗
                <NewTab />
              </a>
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border border-s-line-strong hover:border-s-2`}
              >
                LinkedIn ↗
                <NewTab />
              </a>
              <a
                href={site.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border border-s-line-strong hover:border-s-2`}
              >
                GitHub ↗
                <NewTab />
              </a>
            </div>
          </div>
        </div>

        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] border-t border-s-line">
          {t.facts.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-2 pt-[18px] pr-4">
              <dt className="font-mono text-[11px] leading-none tracking-[.1em] text-s-meta uppercase">
                {k}
              </dt>
              <dd className="m-0 text-base leading-[1.3] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
