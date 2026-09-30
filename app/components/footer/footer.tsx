"use client";

import { Fragment } from "react";
import { NewTab, useLang } from "@/app/components/providers/lang-provider";
import { useUI } from "@/app/components/providers/ui-provider";
import { site } from "@/app/data/site";

export default function Footer() {
  const { t } = useLang();
  const { replayIntro } = useUI();

  const links = [
    { href: site.socials.linkedin, label: "LinkedIn" },
    { href: site.socials.github, label: "GitHub" },
    { href: site.resumeUrl, label: t.cv },
  ];

  return (
    <footer
      id="contact"
      className="surface-dark bg-footer text-paper transition-[background] duration-400"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-[clamp(20px,4vw,40px)] pt-[104px] pb-10">
        <h2 className="m-0 font-mono text-xs leading-none font-normal tracking-[.12em] text-hero-meta uppercase">
          {t.contact}
        </h2>
        <p className="m-0 text-[clamp(48px,7vw,104px)] leading-[.95] font-extrabold tracking-[-.05em] text-balance">
          {t.cta1}
          <span className="text-tangerine">.</span>
        </p>
        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-footer-line pt-7">
          <div className="flex flex-wrap items-center gap-3.5 text-xl leading-none font-semibold">
            {links.map((l, i) => (
              <Fragment key={l.label}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-footer-sep">
                    •
                  </span>
                )}
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-haze"
                >
                  {l.label}
                  <NewTab />
                </a>
              </Fragment>
            ))}
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] leading-none tracking-[.1em] text-hero-meta uppercase">
            <button
              type="button"
              onClick={replayIntro}
              className="rounded-lg border border-footer-line px-2.5 py-2 uppercase hover:border-[#5E6070] hover:text-paper"
            >
              ↻ {t.replay}
            </button>
            <span>{t.sign}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
