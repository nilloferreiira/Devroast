import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const sectionLabelRootVariants = tv({
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

const sectionLabelPrefixVariants = tv({
  base: "text-accent-green",
});

const sectionLabelTextVariants = tv({
  base: "text-inherit",
});

export type SectionLabelRootProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof sectionLabelRootVariants>;

export type SectionLabelPrefixProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof sectionLabelPrefixVariants>;

export type SectionLabelTextProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof sectionLabelTextVariants>;

export const SectionLabelRoot = ({
  className,
  tone,
  ...props
}: SectionLabelRootProps) => {
  return (
    <div className={sectionLabelRootVariants({ tone, className })} {...props} />
  );
};

export const SectionLabelPrefix = ({
  className,
  children,
  ...props
}: SectionLabelPrefixProps) => {
  return (
    <span className={sectionLabelPrefixVariants({ className })} {...props}>
      {children ?? "//"}
    </span>
  );
};

export const SectionLabelText = ({
  className,
  ...props
}: SectionLabelTextProps) => {
  return (
    <span className={sectionLabelTextVariants({ className })} {...props} />
  );
};

export {
  sectionLabelPrefixVariants,
  sectionLabelRootVariants,
  sectionLabelTextVariants,
};
