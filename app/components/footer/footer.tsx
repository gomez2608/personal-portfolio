import { site } from "@/app/data/site";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-border mt-32 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <p className="font-mono text-xs text-muted">
        © {new Date().getFullYear()} {site.name} · Built with Next.js
      </p>
      <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
        <a
          href={site.socials.githubRepo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-brand transition-colors"
        >
          Source
        </a>
        <a
          href="#about"
          className="text-muted-foreground hover:text-brand transition-colors"
        >
          Back to top
        </a>
      </div>
    </footer>
  );
}
