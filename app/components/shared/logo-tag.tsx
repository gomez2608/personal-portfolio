import { cn } from "@/lib/utils";
import { TechLogo } from "./tech-logo";

export function LogoTag({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-lg border border-line bg-card px-2.5 py-1.5 text-[13px] leading-none font-semibold text-navy",
        className,
      )}
    >
      <TechLogo name={name} className="size-3.5" />
      {name}
    </span>
  );
}

type LogoTagListProps = {
  names: string[];
  className?: string;
  tagClassName?: string;
};

export function LogoTagList({
  names,
  className,
  tagClassName,
}: LogoTagListProps) {
  if (!names.length) return null;
  return (
    <ul className={cn("m-0 flex list-none flex-wrap gap-1.5 p-0", className)}>
      {names.map((n) => (
        <li key={n} className="flex">
          <LogoTag name={n} className={tagClassName} />
        </li>
      ))}
    </ul>
  );
}
