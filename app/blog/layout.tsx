import type { Metadata } from "next";
import { BlogTopBar } from "@/app/components/blog/blog-top-bar";
import { LangNote } from "@/app/components/blog/lang-note";
import { blogSocialMetadata } from "@/lib/blog/metadata";

export const metadata: Metadata = {
  title: { default: "Blog", template: "%s | Blog de Sebastián Gómez" },
  ...blogSocialMetadata(),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className="min-h-svh bg-bg text-ink">
      <a
        href="#contenido"
        className="sr-only z-[70] rounded-lg bg-paper px-4 py-3 text-sm font-semibold text-hero focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <BlogTopBar />
      <LangNote />
      {children}
    </div>
  );
}
