"use client";

import { useLang } from "@/app/components/providers/lang-provider";

/** Shown only to visitors whose site language is English. */
export function LangNote() {
  const { lang } = useLang();
  if (lang !== "en") return null;
  return (
    <p className="bg-fog px-[clamp(16px,4vw,40px)] py-2 text-center text-sm text-muted-text">
      Este blog está en español.
    </p>
  );
}
