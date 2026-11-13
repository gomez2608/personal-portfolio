import type { MDXComponents } from "mdx/types";
import { MiOpinion } from "@/app/components/blog/mdx/mi-opinion";
import { Profundizar } from "@/app/components/blog/mdx/profundizar";
import { Destacado } from "@/app/components/blog/mdx/destacado";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (p) => <h2 className="mt-12 mb-4 text-[clamp(1.4rem,3vw,1.75rem)] font-bold leading-snug text-ink" {...p} />,
    h3: (p) => <h3 className="mt-8 mb-3 text-xl font-bold leading-snug text-ink" {...p} />,
    p: (p) => <p className="my-5 text-[1.0625rem] leading-[1.75] text-graphite" {...p} />,
    a: (p) => (
      <a
        className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 hover:decoration-ink"
        {...p}
      />
    ),
    ul: (p) => <ul className="my-5 list-disc space-y-2 pl-6 text-graphite marker:text-muted-text" {...p} />,
    ol: (p) => <ol className="my-5 list-decimal space-y-2 pl-6 text-graphite marker:text-muted-text" {...p} />,
    li: (p) => <li className="text-[1.0625rem] leading-[1.7]" {...p} />,
    strong: (p) => <strong className="font-semibold text-ink" {...p} />,
    code: (p) => <code className="rounded bg-fog px-1.5 py-0.5 font-mono text-[0.9em] text-ink" {...p} />,
    blockquote: (p) => (
      <blockquote className="my-6 border-l-2 border-line pl-5 italic text-slate" {...p} />
    ),
    MiOpinion,
    Profundizar,
    Destacado,
    ...components,
  };
}
