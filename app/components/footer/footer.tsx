"use client";

import { Fragment } from "react";
import { NewTab, useLang } from "@/app/components/providers/lang-provider";
import { useUI } from "@/app/components/providers/ui-provider";
import { site } from "@/app/data/site";
import { ContactForm } from "./contact-form";

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
      className="bg-footer text-f-fg transition-[background] duration-400"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-[clamp(20px,4vw,40px)] pt-[104px] pb-10">
        <h2 className="m-0 font-mono text-xs leading-none font-normal tracking-[.12em] text-f-meta uppercase">
          {t.contact}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-[72px] gap-y-12">
          <p className="m-0 text-[clamp(48px,7vw,104px)] leading-[.95] font-extrabold tracking-[-.05em] text-balance">
            {t.cta1}
            <span className="text-tangerine">.</span>
          </p>
          {/* Scroll target for the "Get in touch" buttons; stays put when the form swaps to the thank-you card. */}
          <div id="contact-form" className="scroll-mt-[88px]">
            <ContactForm />
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-f-line pt-7">
          <div className="flex flex-wrap items-center gap-3.5 text-xl leading-none font-semibold">
            {links.map((l, i) => (
              <Fragment key={l.label}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-f-sep">
                    •
                  </span>
                )}
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-f-hover"
                >
                  {l.label}
                  <NewTab />
                </a>
              </Fragment>
            ))}
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] leading-none tracking-[.1em] text-f-meta uppercase">
            <button
              type="button"
              onClick={replayIntro}
              className="rounded-lg border border-f-line px-2.5 py-2 uppercase hover:border-f-hover-line hover:text-f-fg"
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
