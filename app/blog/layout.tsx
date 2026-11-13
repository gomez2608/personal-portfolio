import type { Metadata } from "next";
import { BlogTopBar } from "@/app/components/blog/blog-top-bar";
import { LangNote } from "@/app/components/blog/lang-note";

export const metadata: Metadata = {
  title: { default: "Blog", template: "%s | Blog de Sebastián Gómez" },
  openGraph: { locale: "es_CO" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className="min-h-svh bg-bg text-ink">
      <BlogTopBar />
      <LangNote />
      {children}
    </div>
  );
}
