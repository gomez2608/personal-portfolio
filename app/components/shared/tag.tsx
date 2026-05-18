import { cn } from "@/lib/utils";

type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-xs text-muted-foreground border border-border rounded-md px-2 py-1 leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
