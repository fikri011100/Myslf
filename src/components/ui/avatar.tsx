import { cn, initials } from "@/lib/utils";

const COLORS = [
  "bg-brand-indigo",
  "bg-brand-violet",
  "bg-brand-pink",
  "bg-brand-green",
  "bg-brand-amber",
  "bg-brand-cyan",
];

function colorFor(name: string) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white",
        colorFor(name),
        className
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
