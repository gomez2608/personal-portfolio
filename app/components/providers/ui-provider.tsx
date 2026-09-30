"use client";

import { createContext, useCallback, useContext, useState } from "react";

type UIContextValue = {
  /** Active Work tab: 0 Experience, 1 Projects, 2 Writing. */
  tab: number;
  setTab: (tab: number) => void;
  /** Open case-study drawer: index into t.proj, or -1 when closed. */
  openCase: number;
  setOpenCase: (i: number) => void;
  /** Highlighted header nav item (-1 none). */
  navOn: number;
  setNavOn: (i: number) => void;
  /** True while the logo intro overlay is mounted; the header mark stays hidden. */
  introActive: boolean;
  setIntroActive: (active: boolean) => void;
  /** Incremented to ask the intro overlay to play again. */
  replayToken: number;
  replayIntro: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState(0);
  const [navOn, setNavOn] = useState(-1);
  const [openCase, setOpenCase] = useState(-1);
  // Starts true so the server-rendered header mark is hidden until the intro decides.
  const [introActive, setIntroActive] = useState(true);
  const [replayToken, setReplayToken] = useState(0);

  const replayIntro = useCallback(() => {
    window.scrollTo({ top: 0 });
    setReplayToken((n) => n + 1);
  }, []);

  return (
    <UIContext.Provider
      value={{
        tab,
        setTab,
        openCase,
        setOpenCase,
        navOn,
        setNavOn,
        introActive,
        setIntroActive,
        replayToken,
        replayIntro,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}

/** Smooth-scrolls to an element id, leaving room for the floating header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 70,
    behavior: "smooth",
  });
}
