"use client";

import { useRef } from "react";
import { useLang } from "@/app/components/providers/lang-provider";
import { Reveal } from "@/app/components/shared/reveal";
import { TechLogo } from "@/app/components/shared/tech-logo";
import { certifications } from "@/app/data/content";

export default function Credentials() {
  const { t } = useLang();
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);

  // Mouse drag scrolls the rail; touch and trackpads keep native scrolling.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !railRef.current) return;
    drag.current = { x: e.clientX, scroll: railRef.current.scrollLeft };
    railRef.current.style.cursor = "grabbing";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !railRef.current) return;
    railRef.current.scrollLeft =
      drag.current.scroll - (e.clientX - drag.current.x);
  };
  const endDrag = () => {
    if (railRef.current) railRef.current.style.cursor = "grab";
    drag.current = null;
  };

  return (
    <Reveal
      id="credentials"
      aria-labelledby="credentials-label"
      className="border-t border-line pt-[72px] pb-[88px]"
    >
      <div className="flex items-baseline justify-between px-[clamp(20px,4vw,40px)] pb-5 font-mono text-xs leading-none tracking-[.12em] text-graphite uppercase">
        <h2 id="credentials-label" className="m-0 text-xs font-normal">
          {t.creds} · {certifications.length}
        </h2>
        <span aria-hidden="true">{t.drag} →</span>
      </div>
      <div
        ref={railRef}
        tabIndex={0}
        role="region"
        aria-labelledby="credentials-label"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="no-scrollbar flex cursor-grab gap-4 overflow-x-auto px-[clamp(20px,4vw,40px)] pt-1 pb-3 select-none"
      >
        <ul className="m-0 flex list-none gap-4 p-0">
          {certifications.map((c) => (
            <li
              key={c.name}
              className="flex h-[210px] w-[300px] flex-none flex-col justify-between rounded-xl border border-line bg-card p-[22px] transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-navy"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] leading-[1.4] tracking-[.08em] text-graphite uppercase">
                  {c.date ? `${c.org} · ${c.date}` : c.org}
                </span>
                <TechLogo
                  name={c.org}
                  className="h-[18px] w-auto max-w-[44px] text-navy"
                />
              </div>
              <span className="text-xl leading-[1.25] font-bold tracking-[-.02em] text-balance">
                {c.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
