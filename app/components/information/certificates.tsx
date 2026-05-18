import { ArrowUpRight } from "lucide-react";
import { certifications, type Certification } from "@/app/data/certifications";
import { AnimatedSection } from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";

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
      <div>
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
    </AnimatedSection>
  );
}
