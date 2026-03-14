import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const tableRowVariants = tv({
  base: "flex w-full items-center gap-6 border-b border-border-primary px-5 py-4",
});

const tableCellVariants = tv({
  base: "font-mono text-xs",
  variants: {
    width: {
      rank: "w-10 text-text-tertiary",
      score: "w-[60px] text-accent-red font-bold",
      code: "flex-1 text-text-secondary",
      lang: "w-[100px] text-text-tertiary",
    },
  },
  defaultVariants: {
    width: "code",
  },
});

export type TableRowProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof tableRowVariants>;

export type TableCellProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof tableCellVariants>;

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return <div className={tableRowVariants({ className })} {...props} />;
};

export const TableCell = ({ className, width, ...props }: TableCellProps) => {
  return <div className={tableCellVariants({ width, className })} {...props} />;
};

export { tableCellVariants, tableRowVariants };
