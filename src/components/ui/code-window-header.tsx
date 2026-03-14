import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const codeWindowHeaderVariants = tv({
  base: "flex h-10 w-full items-center gap-3 border-b border-border-primary px-4",
});

const codeWindowDotVariants = tv({
  base: "h-2.5 w-2.5 rounded-full",
  variants: {
    tone: {
      danger: "bg-accent-red",
      warning: "bg-accent-amber",
      success: "bg-accent-green",
    },
  },
  defaultVariants: {
    tone: "danger",
  },
});

export type CodeWindowHeaderProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof codeWindowHeaderVariants> & {
    fileName: string;
  };

type CodeWindowDotProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof codeWindowDotVariants>;

const CodeWindowDot = ({ className, tone, ...props }: CodeWindowDotProps) => {
  return (
    <span className={codeWindowDotVariants({ tone, className })} {...props} />
  );
};

export const CodeWindowHeader = ({
  className,
  fileName,
  ...props
}: CodeWindowHeaderProps) => {
  return (
    <div className={codeWindowHeaderVariants({ className })} {...props}>
      <CodeWindowDot tone="danger" />
      <CodeWindowDot tone="warning" />
      <CodeWindowDot tone="success" />
      <span className="h-px flex-1 bg-transparent" />
      <span className="font-mono text-xs text-text-tertiary">{fileName}</span>
    </div>
  );
};

export { codeWindowDotVariants, codeWindowHeaderVariants };
