import { Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "../shared/animated-section";
import { site } from "../../data/site";

export default function Profile() {
  const eyebrow = `${site.role.toUpperCase()} · ${site.location.toUpperCase()}`;

  return (
    <AnimatedSection id="about" className="mt-20 md:mt-32">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">
        {eyebrow}
      </p>

      <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
        {site.name}
      </h1>

      <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
        {site.tagline}
      </p>

      <p className="mt-8 max-w-2xl text-base text-foreground/85">
        {site.bioParagraphs[0]}
      </p>

      <p className="mt-4 max-w-2xl text-base text-foreground/85">
        {site.bioParagraphs[1]}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open resume in a new tab"
          >
            Résumé <Download />
          </a>
        </Button>

        <Button asChild variant="outline">
          <a
            href={site.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open LinkedIn profile in a new tab"
          >
            LinkedIn <ArrowUpRight />
          </a>
        </Button>

        <Button asChild variant="outline">
          <a
            href={site.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub profile in a new tab"
          >
            GitHub <ArrowUpRight />
          </a>
        </Button>
      </div>
    </AnimatedSection>
  );
}
