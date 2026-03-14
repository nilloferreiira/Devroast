import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      submit: "bg-primary text-primary-foreground hover:bg-accent-green/90",
      secondary:
        "border border-border-primary bg-bg-surface text-text-primary hover:border-border-secondary hover:bg-bg-elevated",
      ghost: "bg-transparent text-text-primary hover:bg-bg-surface",
    },
    size: {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-2.5 text-[13px]",
      lg: "px-8 py-3 text-sm",
    },
  },
  defaultVariants: {
    variant: "submit",
    size: "md",
  },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  className,
  variant,
  size,
  type,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type ?? "button"}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
};

export { buttonVariants };
