import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const statusDotVariants = tv({
  base: "inline-block h-2 w-2 rounded-full",
  variants: {
    tone: {
      critical: "bg-accent-red",
      warning: "bg-accent-amber",
      good: "bg-accent-green",
      neutral: "bg-text-secondary",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export type StatusDotProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusDotVariants>;

export const StatusDot = ({ className, tone, ...props }: StatusDotProps) => {
  return <span className={statusDotVariants({ tone, className })} {...props} />;
};

export { statusDotVariants };
