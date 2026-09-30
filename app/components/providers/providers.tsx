"use client";

import { ThemeProvider } from "next-themes";
import { LangProvider } from "./lang-provider";
import { UIProvider } from "./ui-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      storageKey="sg-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <LangProvider>
        <UIProvider>{children}</UIProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
