import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineRootVariants = tv({
  base: "flex items-center gap-2 px-4 py-2 font-mono text-[13px]",
  variants: {
    tone: {
      added: "bg-diff-added text-text-primary",
      removed: "bg-diff-removed text-text-secondary",
      context: "text-text-secondary",
    },
  },
  defaultVariants: {
    tone: "context",
  },
});

const diffLinePrefixVariants = tv({
  base: "w-3 text-center",
  variants: {
    tone: {
      added: "text-accent-green",
      removed: "text-accent-red",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    tone: "context",
  },
});

const prefixByTone = {
  added: "+",
  removed: "-",
  context: " ",
} as const;

const diffLineCodeVariants = tv({
  base: "text-inherit",
});

export type DiffLineRootProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof diffLineRootVariants>;

export type DiffLinePrefixProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof diffLinePrefixVariants> & {
    symbol?: string;
  };

export type DiffLineCodeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof diffLineCodeVariants>;

export const DiffLineRoot = ({
  className,
  tone,
  ...props
}: DiffLineRootProps) => {
  return (
    <div className={diffLineRootVariants({ tone, className })} {...props} />
  );
};

export const DiffLinePrefix = ({
  className,
  tone,
  symbol,
  ...props
}: DiffLinePrefixProps) => {
  const resolvedTone = tone ?? "context";
  const resolvedSymbol = symbol ?? prefixByTone[resolvedTone];

  return (
    <span
      className={diffLinePrefixVariants({ tone: resolvedTone, className })}
      {...props}
    >
      {resolvedSymbol}
    </span>
  );
};

export const DiffLineCode = ({ className, ...props }: DiffLineCodeProps) => {
  return <span className={diffLineCodeVariants({ className })} {...props} />;
};

export type DiffLineProps = {
  tone?: VariantProps<typeof diffLineRootVariants>["tone"];
  code: string;
  prefix?: string;
} & Omit<DiffLineRootProps, "tone">;

export const DiffLine = ({ tone, code, prefix, ...props }: DiffLineProps) => {
  return (
    <DiffLineRoot tone={tone} {...props}>
      <DiffLinePrefix tone={tone} symbol={prefix} />
      <DiffLineCode>{code}</DiffLineCode>
    </DiffLineRoot>
  );
};

export { diffLineCodeVariants, diffLinePrefixVariants, diffLineRootVariants };
