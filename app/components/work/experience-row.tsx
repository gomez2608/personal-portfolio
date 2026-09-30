"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/app/components/providers/lang-provider";
import { LogoTagList } from "@/app/components/shared/logo-tag";
import type { ExperienceCopy } from "@/app/data/content";

type Props = {
  id: string;
  exp: ExperienceCopy;
  open: boolean;
  onToggle: () => void;
  className: string;
  dateClassName: string;
  titleClassName: string;
  metaClassName: string;
};

/**
 * Experience row: summary and tags always visible; bullets and reference expand.
 * The toggle button is stretched over the whole row, so clicking anywhere toggles it.
 */
export function ExperienceRow({
  id,
  exp,
  open,
  onToggle,
  className,
  dateClassName,
  titleClassName,
  metaClassName,
}: Props) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const detailsId = `${id}-details`;

  return (
    <div className={`${className} cursor-pointer`}>
      <span className={dateClassName}>{exp.date}</span>
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
          <h3 className={titleClassName}>{exp.title}</h3>
          <span className={metaClassName}>{exp.location}</span>
        </div>
        <p className="m-0 max-w-[760px] text-base leading-[1.65] text-pretty text-slate">
          {exp.summary}
        </p>
        <LogoTagList names={exp.tags} />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={onToggle}
          className="self-start font-mono text-xs leading-none font-medium tracking-[.06em] text-graphite uppercase after:absolute after:inset-0 after:content-['']"
        >
          {open ? t.experienceToggle.less : t.experienceToggle.more}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={detailsId}
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: reduce ? 0 : 0.3,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3.5 pt-1.5">
                <ul className="m-0 flex max-w-[760px] list-none flex-col gap-3 p-0">
                  {exp.bullets.map((b) => (
                    <li
                      key={b}
                      className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 text-base leading-[1.65] text-pretty text-slate"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 rounded-full bg-navy"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {exp.reference && (
                  <span className="font-mono text-xs leading-[1.6] text-graphite">
                    {exp.reference}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
