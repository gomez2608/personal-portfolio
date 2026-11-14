"use client";

import { useEffect, useState } from "react";
import { LANG_STORAGE_KEY } from "@/app/components/providers/lang-provider";

/**
 * Shown only to visitors who explicitly chose English on the site. It renders after mount,
 * so visitors with Spanish or no stored preference never see it flash in.
 */
export function LangNote() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(LANG_STORAGE_KEY) === "en");
    } catch {}
  }, []);
  if (!show) return null;
  return (
    <p className="bg-fog px-[clamp(16px,4vw,40px)] py-2 text-center text-sm text-graphite">
      <span lang="en">This blog is written in Spanish.</span> <span lang="es">Este blog está en español.</span>
    </p>
  );
}
