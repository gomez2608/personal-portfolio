"use client";

import { useRef } from "react";
import { NewTab, useLang } from "@/app/components/providers/lang-provider";
import { Reveal } from "@/app/components/shared/reveal";

const SPOT = 420;

export default function Talks() {
  const { t } = useLang();
  const talk = t.talks;
  const spotRef = useRef<HTMLDivElement>(null);

  // Cursor spotlight: a tangerine glow that follows a fine pointer. Moved via a ref, not state.
  const canSpot = () =>
    window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const spot = spotRef.current;
    if (!spot || !canSpot()) return;
    const r = e.currentTarget.getBoundingClientRect();
    spot.style.transform = `translate(${e.clientX - r.left - SPOT / 2}px,${e.clientY - r.top - SPOT / 2}px)`;
    spot.style.opacity = "1";
  };
  const onLeave = () => {
    if (spotRef.current) spotRef.current.style.opacity = "0";
  };

  return (
    <Reveal
      id="talks"
      aria-labelledby="talks-label"
      className="flex flex-col gap-9 border-t border-line px-[clamp(20px,4vw,40px)] py-[88px]"
    >
      <h2
        id="talks-label"
        className="m-0 font-mono text-xs leading-none font-normal tracking-[.12em] text-graphite uppercase"
      >
        {talk.label}
      </h2>

      <article
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative flex min-h-[340px] flex-col justify-between gap-8 overflow-hidden rounded-xl bg-hero p-[clamp(32px,4vw,48px)] text-paper dark:border dark:border-hero-line-strong"
      >
        <div
          ref={spotRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 size-[420px] rounded-full opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(240,122,46,.22), rgba(240,122,46,0) 65%)",
          }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs leading-none tracking-[.12em] text-haze uppercase">
            {talk.kind}
          </span>
          <span className="rounded-full border border-hero-line-strong px-2.5 py-[7px] font-mono text-xs leading-none font-medium text-haze">
            {talk.when}
          </span>
        </div>

        <div className="relative flex flex-col gap-4">
          <h3 className="m-0 text-[clamp(40px,4.8vw,64px)] leading-[.95] font-extrabold tracking-[-.05em]">
            {talk.event}
            <span className="text-tangerine">.</span>
          </h3>
          <p
            lang="en"
            className="m-0 text-xl leading-[1.4] font-semibold text-pretty"
          >
            “{talk.title}”
          </p>
          <p className="m-0 text-base leading-[1.6] text-pretty text-haze">
            {talk.summary}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-hero-line pt-5">
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {talk.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-lg border border-hero-line-strong px-[9px] py-1.5 font-mono text-xs leading-none font-medium text-haze"
              >
                {tag}
              </li>
            ))}
          </ul>
          <a
            href={talk.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-paper px-4 py-3 text-sm leading-none font-semibold whitespace-nowrap text-hero hover:bg-white"
          >
            {talk.linkLabel} ↗
            <NewTab />
          </a>
        </div>
      </article>
    </Reveal>
  );
}
