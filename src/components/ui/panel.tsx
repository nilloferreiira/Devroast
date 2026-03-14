import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const panelVariants = tv({
  base: "border border-border-primary bg-bg-surface",
  variants: {
    spacing: {
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

export type PanelProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof panelVariants>;

export const Panel = ({ className, spacing, ...props }: PanelProps) => {
  return <div className={panelVariants({ spacing, className })} {...props} />;
};

export { panelVariants };
