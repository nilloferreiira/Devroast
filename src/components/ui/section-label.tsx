import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const sectionLabelVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-sm font-bold",
  variants: {
    tone: {
      default: "text-text-primary",
      accent: "text-accent-green",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export type SectionLabelProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof sectionLabelVariants> & {
    label: string;
  };

export const SectionLabel = ({
  className,
  tone,
  label,
  ...props
}: SectionLabelProps) => {
  return (
    <div className={sectionLabelVariants({ tone, className })} {...props}>
      <span className="text-accent-green">{"//"}</span>
      <span>{label}</span>
    </div>
  );
};

export { sectionLabelVariants };
