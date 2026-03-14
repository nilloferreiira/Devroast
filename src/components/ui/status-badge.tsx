import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { StatusDot } from "@/components/ui/status-dot";

const statusBadgeVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-xs",
  variants: {
    tone: {
      critical: "text-accent-red",
      warning: "text-accent-amber",
      good: "text-accent-green",
      neutral: "text-text-secondary",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusBadgeVariants> & {
    label: string;
  };

export const StatusBadge = ({
  className,
  tone,
  label,
  ...props
}: StatusBadgeProps) => {
  return (
    <span className={statusBadgeVariants({ tone, className })} {...props}>
      <StatusDot tone={tone} />
      <span>{label}</span>
    </span>
  );
};

export { statusBadgeVariants };
