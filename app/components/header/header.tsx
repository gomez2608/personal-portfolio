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

/** Floating = scrolled past 40px; onHero = the header still overlaps the hero. */
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
        "flex size-8 shrink-0 items-center justify-center rounded-lg border hover:border-current",
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
    </button>
  );
}

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { navOn, setNavOn, setTab, introActive } = useUI();
  const { floating, onHero, scrollYProgress } = useHeaderScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  // About → #about; Experience/Projects/Writing → Work tab 0–2; Credentials → #certificates.
  const goNav = (i: number) => {
    setNavOn(i);
    setMenuOpen(false);
    if (i === 0) {
      scrollToId("about");
    } else if (i === t.nav.length - 1) {
      scrollToId("certificates");
    } else {
      setTab(i - 1);
      scrollToId("work");
    }
  };

  const toContact = () => {
    setMenuOpen(false);
    scrollToId("contact-form");
  };

  // The menu closes on Escape and when the viewport grows past the menu breakpoint.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 1180px)");
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    const onWide = () => mq.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const toTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const barStyle: React.CSSProperties = {
    maxWidth: floating ? 1120 : 1280,
    padding: floating ? "10px 10px 10px 16px" : "14px clamp(20px,4vw,40px)",
    borderRadius: floating ? 14 : 0,
    // Over the hero the bar uses --hh-* tokens (navy in dark mode, Paper in light).
    background: onHero
      ? floating
        ? "var(--hh-bg-float)"
        : "var(--hh-bg-top)"
      : "var(--pill)",
    color: onHero ? "var(--hh-fg)" : "var(--emph)",
    borderColor: onHero
      ? floating
        ? "var(--hh-line-float)"
        : "var(--hh-line-top)"
      : "var(--line)",
    boxShadow: floating
      ? onHero
        ? "var(--hh-shadow)"
        : "0 12px 32px rgba(15,18,32,.10)"
      : "none",
    transition: `max-width .45s ${EASE}, padding .45s ${EASE}, border-radius .45s, background .35s, color .35s, border-color .35s, box-shadow .45s`,
  };

  const lineClass = onHero ? "border-s-line-strong" : "border-line";

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
          "pointer-events-auto relative mx-auto flex flex-nowrap items-center justify-between gap-x-8 overflow-hidden border backdrop-blur-[14px]",
        )}
        style={barStyle}
      >
        <a
          href="#top"
          onClick={toTop}
          className="flex shrink-0 items-center gap-3"
          aria-label={`${site.name} — top`}
        >
          <span
            data-header-mark
            aria-hidden="true"
            className={cn(
              "relative size-9 shrink-0 rounded-lg bg-emph transition-[background] duration-[350ms]",
            )}
            style={{ opacity: introActive ? 0 : 1 }}
          >
            <span
              className={cn(
                "absolute top-1 left-1.5 text-sm leading-none font-bold tracking-[-.05em] text-emph-contrast transition-colors duration-[350ms]",
              )}
            >
              sg
            </span>
            <span
              data-mark-dot
              className="absolute right-1.5 bottom-1.5 size-[9px] rounded-full bg-tangerine transition-opacity duration-200"
            />
          </span>
          <span className="text-[15px] leading-none font-bold tracking-[-.01em] whitespace-nowrap max-[520px]:hidden">
            {site.name}
          </span>
        </a>

        <nav
          aria-label={lang === "es" ? "Principal" : "Primary"}
          className="flex gap-[22px] max-[1180px]:hidden"
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
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "rounded-lg border px-[11px] py-[9px] font-mono text-xs leading-none font-medium tracking-[.06em] uppercase hover:border-current min-[1180px]:hidden",
              lineClass,
            )}
          >
            {menuOpen ? t.menu[1] : t.menu[0]}
          </button>
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
                      ? "bg-emph text-emph-contrast"
                      : onHero
                        ? "text-s-2"
                        : "text-graphite",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={toContact}
            className="flex items-center gap-2 rounded-lg bg-emph px-3.5 py-2.5 text-[13px] leading-none font-semibold whitespace-nowrap text-emph-contrast transition-colors duration-[350ms] max-sm:hidden"
          >
            {t.cta}
            <span
              aria-hidden="true"
              className="size-[7px] rounded-full bg-tangerine"
            />
          </button>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-current"
          style={{ scaleX: scrollYProgress, opacity: floating ? 0.9 : 0 }}
        />
      </div>

      {/* Narrow-screen menu. Lives outside the blurred bar, which would otherwise be its containing block. */}
      {menuOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-[-1] min-[1180px]:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            id="site-menu"
            aria-label={lang === "es" ? "Menú" : "Menu"}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-[clamp(12px,3vw,24px)] flex w-[min(280px,calc(100%-24px))] flex-col rounded-xl border border-line bg-card p-2 shadow-[0_18px_40px_rgba(15,18,32,.16)]"
            style={{ top: floating ? 84 : 70 }}
          >
            {t.nav.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goNav(i)}
                aria-current={navOn === i ? "true" : undefined}
                className="rounded-lg px-3 py-3.5 text-left text-base leading-none font-semibold text-navy hover:bg-fog"
              >
                {label}
              </button>
            ))}
            {/* On phones the header CTA doesn't fit in the bar, so it lives here. */}
            <button
              type="button"
              onClick={toContact}
              className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-emph px-3 py-3.5 text-left text-base leading-none font-semibold text-emph-contrast sm:hidden"
            >
              {t.cta}
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-tangerine"
              />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
