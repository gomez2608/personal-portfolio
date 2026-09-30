"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useTheme } from "next-themes";
import { useLang } from "@/app/components/providers/lang-provider";
import { scrollToId, useUI } from "@/app/components/providers/ui-provider";
import { LANGS } from "@/app/data/content";
import { site } from "@/app/data/site";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(.2,.7,.2,1)";

/** Floating = scrolled past 40px; onHero = the header still overlaps the navy hero. */
function useHeaderScroll() {
  const { scrollY, scrollYProgress } = useScroll();
  const [floating, setFloating] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const heroH = useRef(800);

  const update = (y: number) => {
    setFloating(y > 40);
    setOnHero(y < heroH.current - 70);
  };
  useMotionValueEvent(scrollY, "change", update);

  // Cache the hero height instead of reading layout on every scroll event.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const ro = new ResizeObserver(() => {
      heroH.current = hero.offsetHeight;
      update(window.scrollY);
    });
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  return { floating, onHero, scrollYProgress };
}

function ThemeToggle({ lineClass }: { lineClass: string }) {
  const { lang } = useLang();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  const label = dark
    ? lang === "es"
      ? "Claro"
      : "Light"
    : lang === "es"
      ? "Oscuro"
      : "Dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      title={label}
      aria-label={
        lang === "es"
          ? `Cambiar a tema ${label.toLowerCase()}`
          : `Switch to ${label.toLowerCase()} theme`
      }
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-[7px] font-mono text-xs leading-none font-medium hover:border-current",
        lineClass,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-3 rounded-full border-[1.5px] border-current",
          dark ? "bg-transparent" : "bg-current",
        )}
      />
      {label}
    </button>
  );
}

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { navOn, setNavOn, setTab, introActive } = useUI();
  const { floating, onHero, scrollYProgress } = useHeaderScroll();

  const goNav = (i: number) => {
    setNavOn(i);
    if (i === 0) {
      scrollToId("about");
    } else {
      setTab(i - 1);
      scrollToId("work");
    }
  };

  const toTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const barStyle: React.CSSProperties = {
    maxWidth: floating ? 1120 : 1280,
    padding: floating ? "10px 10px 10px 16px" : "14px clamp(20px,4vw,40px)",
    borderRadius: floating ? 14 : 0,
    background: onHero
      ? floating
        ? "rgba(27,34,56,.72)"
        : "rgba(27,34,56,0)"
      : "var(--pill)",
    color: onHero ? "#F7F5F0" : "var(--emph)",
    borderColor: onHero
      ? floating
        ? "rgba(58,66,98,.9)"
        : "rgba(58,66,98,0)"
      : "var(--line)",
    boxShadow: floating
      ? onHero
        ? "0 10px 30px rgba(0,0,0,.25)"
        : "0 12px 32px rgba(15,18,32,.10)"
      : "none",
    transition: `max-width .45s ${EASE}, padding .45s ${EASE}, border-radius .45s, background .35s, color .35s, border-color .35s, box-shadow .45s`,
  };

  const lineClass = onHero ? "border-hero-line-strong" : "border-line";

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-20"
      style={{
        padding: floating ? "12px clamp(12px,3vw,24px)" : 0,
        transition: `padding .45s ${EASE}`,
      }}
    >
      <div
        className={cn(
          "pointer-events-auto relative mx-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-3 overflow-hidden border backdrop-blur-[14px]",
          onHero && "surface-dark",
        )}
        style={barStyle}
      >
        <a
          href="#top"
          onClick={toTop}
          className="flex items-center gap-3"
          aria-label={`${site.name} — top`}
        >
          <span
            data-header-mark
            aria-hidden="true"
            className={cn(
              "relative size-9 shrink-0 rounded-lg transition-[background] duration-[350ms]",
              onHero ? "bg-paper" : "bg-emph",
            )}
            style={{ opacity: introActive ? 0 : 1 }}
          >
            <span
              className={cn(
                "absolute top-1 left-1.5 text-sm leading-none font-bold tracking-[-.05em] transition-colors duration-[350ms]",
                onHero ? "text-hero" : "text-emph-contrast",
              )}
            >
              sg
            </span>
            <span
              data-mark-dot
              className="absolute right-1.5 bottom-1.5 size-[9px] rounded-full bg-tangerine transition-opacity duration-200"
            />
          </span>
          <span className="text-[15px] leading-none font-bold tracking-[-.01em]">
            {site.name}
          </span>
        </a>

        <nav
          aria-label={lang === "es" ? "Principal" : "Primary"}
          className="flex flex-wrap gap-[26px]"
        >
          {t.nav.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goNav(i)}
              aria-current={navOn === i ? "true" : undefined}
              className="py-1.5 text-sm leading-none font-medium whitespace-nowrap hover:opacity-100"
              style={{ opacity: navOn === i ? 1 : 0.62 }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle lineClass={lineClass} />
          <div
            role="group"
            aria-label={lang === "es" ? "Idioma" : "Language"}
            className={cn("flex overflow-hidden rounded-lg border", lineClass)}
          >
            {LANGS.map((l) => {
              const on = lang === l;
              return (
                <button
                  key={l}
                  type="button"
                  lang={l}
                  aria-pressed={on}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2.5 py-[7px] font-mono text-xs leading-none font-medium uppercase",
                    on
                      ? onHero
                        ? "bg-paper text-hero"
                        : "bg-emph text-emph-contrast"
                      : onHero
                        ? "text-haze"
                        : "text-graphite",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-current"
          style={{ scaleX: scrollYProgress, opacity: floating ? 0.9 : 0 }}
        />
      </div>
    </header>
  );
}
