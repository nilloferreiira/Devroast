# UI Components Patterns

Use this guide for all generic UI components under `src/components/ui`.

## Core Rules

- Use named exports only. Never use default exports.
- Prefer `tailwind-variants` (`tv`) for component styling and variants.
- When using `tv`, pass `className` directly to the variant function:
  - `className={componentVariants({ variant, size, className })}`
- Do not use `cn`/`twMerge` together with `tv` for the final component class string.
- Do not use string interpolation to append Tailwind classes.

## TypeScript Patterns

- Extend native HTML props from the target element.
- Keep the native element generic (`<Element>HTMLAttributes<HTMLElementType>`).
- Merge native props with `VariantProps<typeof componentVariants>`.
- Keep variant types exported for reuse.

## File Structure

- Keep one main component per file when possible.
- Export the variant generator (e.g. `componentVariants`) when reusable.
- Keep imports simple and consistent.

## Generic Blueprint

```tsx
import type { ElementHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const componentVariants = tv({
  base: "base utility classes",
  variants: {
    intent: {
      primary: "...",
      secondary: "...",
    },
    size: {
      sm: "...",
      md: "...",
      lg: "...",
    }
  },
  defaultVariants: {
    intent: "primary",
    size: "md"
  }
});

export type ComponentProps = ElementHTMLAttributes<HTMLElementType> &
  VariantProps<typeof componentVariants>;

export const Component = ({
  className,
  intent,
  size,
  ...props
}: ComponentProps) => (
  <element
    className={componentVariants({ intent, size, className })}
    {...props}
  />
);

export { componentVariants };
```

## Practical Notes

- Keep variant names semantic (`intent`, `tone`, `size`, `state`).
- Put visual tokens/classes in variants, not in component logic.
- Keep component logic focused on behavior/props; styling stays in `tv`.
- If a component does not need variants, skip `tv` and keep a simple class list.
