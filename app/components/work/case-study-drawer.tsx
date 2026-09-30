"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NewTab, useLang } from "@/app/components/providers/lang-provider";
import { LogoTagList } from "@/app/components/shared/logo-tag";
import { projectTags } from "@/app/data/content";

type Props = {
  /** Index into t.proj, or -1 when closed. */
  index: number;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CaseStudyDrawer({ index, onClose }: Props) {
  const { t } = useLang();
  const open = index >= 0;
  const project = open ? t.proj[index] : null;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Portaled to <body> so `position: fixed` isn't trapped by the section's reveal transform.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex justify-end bg-[rgba(15,18,32,.55)] backdrop-blur-[4px]"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex h-full w-[min(720px,100%)] flex-col overflow-y-auto bg-bg"
          >
            <div className="surface-dark flex flex-col gap-7 bg-hero px-[clamp(24px,4vw,48px)] pt-8 pb-10 text-paper">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs leading-none tracking-[.12em] text-haze uppercase">
                  {project.tag}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-hero-line-strong px-3 py-[9px] font-mono text-[13px] leading-none font-medium hover:border-haze"
                >
                  {t.close} ✕
                </button>
              </div>
              <h2
                id="case-study-title"
                className="m-0 text-[clamp(32px,4vw,44px)] leading-[1.05] font-extrabold tracking-[-.04em] text-balance"
              >
                {project.title}
              </h2>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-[72px] leading-[.9] font-extrabold tracking-[-.05em] text-tangerine">
                  {project.k1}
                </span>
                <span className="max-w-[280px] text-[17px] leading-[1.4] font-semibold text-haze">
                  {project.k1l}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-8 px-[clamp(24px,4vw,48px)] pt-10 pb-14">
              <dl className="m-0 flex flex-col gap-8">
                {t.bk.map((label, i) => (
                  <div
                    key={label}
                    className="grid grid-cols-[120px_minmax(0,1fr)] gap-5 border-b border-line pb-7"
                  >
                    <dt className="font-mono text-[11px] leading-[1.8] tracking-[.1em] text-graphite uppercase">
                      {label}
                    </dt>
                    <dd className="m-0 text-[17px] leading-[1.7] text-pretty text-ink">
                      {project.b[i]}
                    </dd>
                  </div>
                ))}
              </dl>
              <LogoTagList
                names={projectTags[index]}
                tagClassName="px-[11px] py-[7px]"
              />
              {project.code && (
                <a
                  href={project.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start rounded-lg bg-hero px-[18px] py-3.5 text-sm leading-none font-semibold text-paper hover:bg-ink-fixed"
                >
                  {t.code} ↗
                  <NewTab />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
