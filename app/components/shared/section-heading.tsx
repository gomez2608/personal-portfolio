type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  id?: string;
};

export function SectionHeading({ eyebrow, title, id }: SectionHeadingProps) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-widest text-brand mb-3">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="text-3xl md:text-4xl font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}
