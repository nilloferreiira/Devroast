# UI Components Patterns

Use this guide for all generic UI components under `src/components/ui`.

## Core Rules

- Use named exports only. Never use default exports.
- Prefer `tailwind-variants` (`tv`) for component styling and variants.
- When using `tv`, pass `className` directly to the variant function:
  - `className={componentVariants({ variant, size, className })}`
- Do not use `cn`/`twMerge` together with `tv` for the final component class string.
- Do not use string interpolation to append Tailwind classes.
- For interactive components, use primitives from `@base-ui/react`.
- For syntax highlight components, keep rendering on the server side only.
- Prefer composition pattern for UI with internal pieces (header/title/description/prefix/content).
- Avoid content props like `title`, `description`, `label`, `fileName` when composition is viable.
- Export each piece as an individual named export (no dot notation API).
- Keep implementation pragmatic: simple components can keep a single API with `children` instead of forced composition.

## TypeScript Patterns

- Extend native HTML props from the target element.
- Keep the native element generic (`<Element>HTMLAttributes<HTMLElementType>`).
- Merge native props with `VariantProps<typeof componentVariants>`.
- Keep variant types exported for reuse.

## File Structure

- Keep one main component per file when possible.
- Export the variant generator (e.g. `componentVariants`) when reusable.
- Keep imports simple and consistent.
- Prefer direct imports from each component file (avoid barrel files).

## Composition Pattern

- Split compound UI into small pieces, for example:
  - `SomethingRoot`
  - `SomethingPrefix`
  - `SomethingText`
  - `SomethingContent`
- Keep each piece stylable with its own `tv` variant function when needed.
- Use direct named imports for pieces instead of `Component.Part` dot notation.

## Behavior Components

- Use Base UI primitives for behavior (`Switch`, `Dialog`, etc).
- Keep the public wrapper generic and small, then style with `tv`.
- Prefer controlled + uncontrolled support for form-like components.

## Server-only Components

- Components that call syntax highlighters (`shiki`) must be server components.
- Do not add `"use client"` in these files.
- Accept plain data (`code`, `lang`) and render deterministic output.

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
