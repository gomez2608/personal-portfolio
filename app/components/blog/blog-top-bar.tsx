import Link from "next/link";
import { site } from "@/app/data/site";
import { ThemeToggle } from "@/app/components/shared/theme-toggle";

/** Slim top bar: the portfolio mark (links home), the Blog link and the theme toggle. */
export function BlogTopBar() {
  return (
    <header className="border-b border-s-line bg-s-bg text-s-fg">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-[clamp(16px,4vw,40px)] py-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} — inicio`}>
          <span aria-hidden="true" className="relative size-9 shrink-0 rounded-lg bg-emph">
            <span className="absolute top-1 left-1.5 text-sm leading-none font-bold tracking-[-.05em] text-emph-contrast">
              sg
            </span>
            <span className="absolute right-1.5 bottom-1.5 size-[9px] rounded-full bg-tangerine" />
          </span>
          <span className="text-[15px] leading-none font-bold tracking-[-.01em] whitespace-nowrap max-[420px]:hidden">
            {site.name}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label="Principal">
            <Link
              href="/blog"
              className="inline-block py-2 font-mono text-xs leading-none tracking-[.06em] uppercase hover:underline"
            >
              Blog
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
