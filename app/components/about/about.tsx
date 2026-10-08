"use client";

import { useLang } from "@/app/components/providers/lang-provider";
import { Reveal } from "@/app/components/shared/reveal";
import { AccuracyChart } from "./accuracy-chart";

export default function About() {
  const { t } = useLang();
  return (
    <Reveal
      id="about"
      aria-labelledby="about-label"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-14 px-[clamp(20px,4vw,40px)] py-[104px]"
    >
      <div className="flex flex-col gap-6">
        <h2
          id="about-label"
          className="m-0 font-mono text-xs leading-none font-normal tracking-[.12em] text-graphite uppercase"
        >
          {t.aboutLbl}
        </h2>
        <p className="m-0 text-[clamp(24px,2.6vw,32px)] leading-[1.3] font-semibold tracking-[-.02em] text-pretty">
          {t.about}
        </p>
        <p className="m-0 text-[17px] leading-[1.7] text-pretty text-slate">
          {t.about2}
        </p>
        <p className="m-0 text-[17px] leading-[1.7] text-pretty text-slate">
          {t.about3}
        </p>
      </div>
      <AccuracyChart />
    </Reveal>
  );
}
