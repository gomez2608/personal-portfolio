"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { copy, type Copy, type Lang } from "@/app/data/content";

const STORAGE_KEY = "sga-lang";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // The server always renders English; a stored preference is applied after hydration.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setLangState(next);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: copy[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

/** Screen-reader suffix for links that open in a new tab. */
export function NewTab() {
  const { lang } = useLang();
  return (
    <span className="sr-only">
      {lang === "es" ? " (abre en una pestaña nueva)" : " (opens in new tab)"}
    </span>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
