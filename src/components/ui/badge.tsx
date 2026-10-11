import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        green: "bg-brand-green/15 text-brand-green",
        amber: "bg-brand-amber/15 text-brand-amber",
        red: "bg-brand-red/15 text-brand-red",
        cyan: "bg-brand-cyan/15 text-brand-cyan",
        violet: "bg-brand-violet/15 text-brand-violet",
        pink: "bg-brand-pink/15 text-brand-pink",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
