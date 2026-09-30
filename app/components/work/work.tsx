"use client";

import { useCallback, useRef, useState } from "react";
import { useLang } from "@/app/components/providers/lang-provider";
import { useUI } from "@/app/components/providers/ui-provider";
import { LogoTagList } from "@/app/components/shared/logo-tag";
import { Reveal } from "@/app/components/shared/reveal";
import { experienceTags, projectTags, publications } from "@/app/data/content";
import { cn } from "@/lib/utils";
import { CaseStudyDrawer } from "./case-study-drawer";

type Row = { a: string; b: string; c: string; tags: string[] };

const PROJECTS_TAB = 1;

export default function Work() {
  const { t } = useLang();
  const { tab, setTab, setNavOn } = useUI();
  const [hovered, setHovered] = useState(-1);
  const [openCase, setOpenCase] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const isProjects = tab === PROJECTS_TAB;
  const closeCase = useCallback(() => setOpenCase(-1), []);

  const rows: Row[] =
    tab === 0
      ? t.exp.map(([a, b, c], i) => ({ a, b, c, tags: experienceTags[i] }))
      : isProjects
        ? t.proj.map((p, i) => ({
            a: p.a,
            b: p.title,
            c: "↗",
            tags: projectTags[i],
          }))
        : publications.map((title, i) => ({
            a: t.pubVenue[i],
            b: `“${title}”`,
            c: t.pubStatus[i],
            tags: [],
          }));

  const pick = (i: number) => {
    setTab(i);
    setNavOn(i + 1);
    setHovered(-1);
  };

  // Roving focus across the tabs: arrows, Home and End.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (e: React.KeyboardEvent) => {
    const n = t.tabs.length;
    const next =
      e.key === "ArrowRight"
        ? (tab + 1) % n
        : e.key === "ArrowLeft"
          ? (tab - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    pick(next);
    tabRefs.current[next]?.focus();
  };

  // The preview card follows the cursor inside the list, tilting by x position.
  const onListMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const list = listRef.current;
    const pv = previewRef.current;
    if (!list || !pv) return;
    const r = list.getBoundingClientRect();
    const qx = e.clientX - r.left;
    const qy = e.clientY - r.top;
    const w = list.clientWidth;
    const x = Math.min(qx + 28, w - 310);
    pv.style.transform = `translate(${x}px,${qy - 150}px) rotate(${(qx / w - 0.5) * 6}deg)`;
  };

  const preview = t.proj[Math.max(0, hovered)];

  return (
    <Reveal
      id="work"
      aria-labelledby="work-heading"
      className="flex flex-col gap-8 border-t border-line px-[clamp(20px,4vw,40px)] py-[88px]"
    >
      <h2 id="work-heading" className="sr-only">
        {t.tabs.join(" · ")}
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-9 gap-y-3">
        <div
          role="tablist"
          aria-labelledby="work-heading"
          onKeyDown={onTabKey}
          className="contents"
        >
          {t.tabs.map((label, i) => {
            const active = tab === i;
            return (
              <button
                key={i}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`work-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="work-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => pick(i)}
                className={cn(
                  "border-b-[3px] pb-2.5 text-[clamp(34px,4.2vw,52px)] leading-none font-extrabold tracking-[-.045em] transition-colors duration-200 hover:text-navy",
                  active
                    ? "border-emph text-emph"
                    : "border-transparent text-muted-text",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto font-mono text-xs leading-none text-graphite">
          {isProjects ? t.open : ""}
        </span>
      </div>

      <div
        ref={listRef}
        id="work-panel"
        role="tabpanel"
        aria-labelledby={`work-tab-${tab}`}
        onMouseMove={isProjects ? onListMove : undefined}
        onMouseLeave={() => setHovered(-1)}
        className="relative flex min-h-[240px] flex-col border-t border-line"
      >
        {rows.map((r, i) => {
          const interactive = isProjects;
          return (
            <div
              key={`${tab}-${i}`}
              onMouseEnter={interactive ? () => setHovered(i) : undefined}
              className={cn(
                "relative grid grid-cols-[minmax(110px,200px)_minmax(0,1fr)] gap-x-6 gap-y-3 border-b border-line py-7 transition-[padding] duration-[250ms]",
                interactive ? "cursor-pointer" : "cursor-default",
              )}
              style={{ paddingLeft: interactive && hovered === i ? 16 : 0 }}
            >
              <span className="font-mono text-xs leading-[1.6] tracking-[.06em] text-graphite uppercase">
                {r.a}
              </span>
              <div className="flex min-w-0 flex-col gap-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
                  <h3 className="m-0 text-2xl leading-[1.3] font-bold tracking-[-.025em] text-pretty">
                    {interactive ? (
                      // Stretched over the whole row, so any click on the row opens the case study.
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => {
                          setOpenCase(i);
                          setHovered(-1);
                        }}
                        className="text-left after:absolute after:inset-0 after:content-['']"
                      >
                        {r.b}
                      </button>
                    ) : (
                      r.b
                    )}
                  </h3>
                  <span
                    className="font-mono text-sm leading-[1.4] font-medium text-navy"
                    aria-hidden={r.c === "↗"}
                  >
                    {r.c}
                  </span>
                </div>
                <LogoTagList names={r.tags} />
              </div>
            </div>
          );
        })}

        <div
          ref={previewRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-[4] flex size-[300px] flex-col justify-between rounded-xl bg-ink-fixed p-6 dark:border dark:border-hero-line-strong text-paper shadow-[0_24px_60px_rgba(15,18,32,.25)]"
          style={{
            opacity: isProjects && hovered >= 0 ? 1 : 0,
            transition: "opacity .25s, transform .12s linear",
          }}
        >
          <span className="font-mono text-[11px] leading-none tracking-[.1em] text-hero-meta uppercase">
            {preview.tag}
          </span>
          <div className="flex flex-col gap-3">
            <span className="text-[64px] leading-[.9] font-extrabold tracking-[-.05em] text-tangerine">
              {preview.k1}
            </span>
            <span className="text-base leading-[1.35] font-semibold">
              {preview.k1l}
            </span>
          </div>
          <span className="text-base leading-none font-bold tracking-[-.05em] text-hero-meta">
            sg
          </span>
        </div>
      </div>

      <CaseStudyDrawer index={openCase} onClose={closeCase} />
    </Reveal>
  );
}
