import { ArrowUpRight } from "lucide-react";
import { certifications, type Certification } from "@/app/data/certifications";
import { AnimatedSection } from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { CredlyBadge } from "@/app/components/shared/credly-badge";

function CertRow({ data }: { data: Certification }) {
  const content = (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3 border-b border-border group">
      <div>
        <p className="text-foreground group-hover:text-brand transition-colors">
          {data.name}
        </p>
        <p className="text-sm text-muted-foreground">{data.issuer}</p>
      </div>
      <p className="font-mono text-xs text-muted whitespace-nowrap">
        {data.date}
      </p>
    </div>
  );
  return data.hyperlink ? (
    <a
      href={data.hyperlink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verify ${data.name}`}
      className="block"
    >
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}

export default function Certificates() {
  const visible = certifications.slice(0, 5);
  const rest = certifications.slice(5);
  return (
    <AnimatedSection id="certificates">
      <SectionHeading eyebrow="CREDENTIALS" title="Certificates" />
      <div className="flex flex-col sm:flex-row-reverse sm:items-start gap-8">
        <div className="shrink-0 flex flex-col items-center gap-2 sm:pt-1">
          <CredlyBadge badgeId="207a3d56-5139-4e97-a6fa-e66e164e11f6" />
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            Verified via Credly
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {visible.map((c, i) => (
            <CertRow key={i} data={c} />
          ))}
          {rest.length > 0 && (
            <details className="group mt-4">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-brand list-none inline-flex items-center gap-2 select-none">
                Show all ({certifications.length}){" "}
                <ArrowUpRight className="size-3 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2">
                {rest.map((c, i) => (
                  <CertRow key={i + visible.length} data={c} />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
