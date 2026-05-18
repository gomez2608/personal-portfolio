"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { site } from "@/app/data/site";
import { cn } from "@/lib/utils";

const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certificates", label: "Credentials" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("about");
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 150);
    setScrolled(latest > 100);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled && "backdrop-blur-md bg-background/70 border-b border-border"
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6 md:px-8">
        <Link
          href="#about"
          className="font-mono text-base tracking-wider text-foreground hover:text-brand transition-colors"
        >
          {site.initials}
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "font-mono text-xs uppercase tracking-widest transition-colors",
                  active === s.id
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-brand mr-1">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 text-foreground hover:text-brand transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background border-t border-border overflow-hidden"
        >
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-3 font-mono text-sm uppercase tracking-widest transition-colors border-b border-border",
                  active === s.id ? "text-brand" : "text-muted-foreground"
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.nav>
  );
}
