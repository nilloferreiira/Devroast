import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
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

const diffPrefixVariants = tv({
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

export type DiffLineProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof diffLineVariants> & {
    code: string;
    prefix?: string;
  };

export const DiffLine = ({
  className,
  tone,
  code,
  prefix,
  ...props
}: DiffLineProps) => {
  const resolvedTone = tone ?? "context";
  const resolvedPrefix = prefix ?? prefixByTone[resolvedTone];

  return (
    <div
      className={diffLineVariants({ tone: resolvedTone, className })}
      {...props}
    >
      <span className={diffPrefixVariants({ tone: resolvedTone })}>
        {resolvedPrefix}
      </span>
      <span>{code}</span>
    </div>
  );
};

export { diffLineVariants, diffPrefixVariants };
