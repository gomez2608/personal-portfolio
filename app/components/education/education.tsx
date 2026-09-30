"use client";

import { useLang } from "@/app/components/providers/lang-provider";
import { useUI } from "@/app/components/providers/ui-provider";
import { Reveal } from "@/app/components/shared/reveal";
import { THESIS_PROJECT_INDEX } from "@/app/data/content";

export default function Education() {
  const { t } = useLang();
  const { setOpenCase } = useUI();
  const edu = t.education;

  return (
    <Reveal
      id="education"
      aria-labelledby="education-label"
      className="flex flex-col gap-7 border-t border-line px-[clamp(20px,4vw,40px)] py-[88px]"
    >
      <h2
        id="education-label"
        className="m-0 font-mono text-xs leading-none font-normal tracking-[.12em] text-graphite uppercase"
      >
        {edu.label}
      </h2>

      <div className="flex flex-col border-t border-line">
        {edu.items.map((item) => (
          <div
            key={item.degree}
            className="grid grid-cols-[minmax(110px,200px)_minmax(0,1fr)] gap-x-6 gap-y-3 border-b border-line py-7"
          >
            <span className="font-mono text-xs leading-[1.6] tracking-[.06em] text-graphite uppercase">
              {item.date}
            </span>
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3.5">
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="m-0 text-2xl leading-[1.3] font-bold tracking-[-.025em] text-navy">
                  {item.degree}
                </h3>
                <span className="text-base leading-[1.5] font-medium text-slate">
                  {item.school}
                </span>
                {item.thesis && (
                  <p className="m-0 max-w-[720px] text-[15px] leading-[1.6] text-pretty text-slate">
                    {item.thesis}
                  </p>
                )}
                <p className="m-0 max-w-[720px] text-[15px] leading-[1.6] text-pretty text-graphite">
                  {item.coursework}
                </p>
                <span className="mt-1 self-start rounded-full border border-line px-2.5 py-[7px] font-mono text-xs leading-none font-medium text-navy">
                  GPA {item.gpa}
                </span>
              </div>
              {item.opensThesisCaseStudy && (
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setOpenCase(THESIS_PROJECT_INDEX)}
                  className="rounded-lg border border-line bg-card px-4 py-3 text-sm leading-none font-semibold whitespace-nowrap text-navy hover:border-navy"
                >
                  {edu.thesisButton} ↗
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
