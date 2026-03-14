import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap font-[JetBrains_Mono] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      submit: "bg-emerald-500 text-[#0A0A0A] hover:bg-emerald-400",
      secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
      ghost: "bg-transparent text-zinc-100 hover:bg-zinc-800",
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
