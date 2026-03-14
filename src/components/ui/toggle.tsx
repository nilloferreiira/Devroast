"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import { useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toggleRootVariants = tv({
  base: "inline-flex items-center gap-3",
});

const toggleTrackVariants = tv({
  base: "inline-flex h-[22px] w-10 items-center rounded-full p-[3px] transition-colors data-[checked]:bg-accent-green data-[unchecked]:bg-border-primary",
});

const toggleThumbVariants = tv({
  base: "block h-4 w-4 rounded-full bg-text-primary transition-transform data-[checked]:translate-x-[18px] data-[unchecked]:translate-x-0",
});

const toggleLabelVariants = tv({
  base: "font-mono text-xs",
  variants: {
    checked: {
      true: "text-accent-green",
      false: "text-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

export type ToggleProps = ComponentPropsWithoutRef<typeof Switch.Root> &
  VariantProps<typeof toggleRootVariants> & {
    label?: string;
    containerProps?: HTMLAttributes<HTMLDivElement>;
  };

type ToggleBehaviorProps = Omit<ToggleProps, "className"> & {
  className?: string;
};

export const Toggle = ({
  className,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  containerProps,
  ...props
}: ToggleBehaviorProps) => {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    Boolean(defaultChecked),
  );

  const currentChecked = isControlled ? Boolean(checked) : internalChecked;

  return (
    <div className={toggleRootVariants({ className })} {...containerProps}>
      <Switch.Root
        className={toggleTrackVariants()}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(nextChecked, eventDetails) => {
          if (!isControlled) {
            setInternalChecked(nextChecked);
          }

          onCheckedChange?.(nextChecked, eventDetails);
        }}
        {...props}
      >
        <Switch.Thumb className={toggleThumbVariants()} />
      </Switch.Root>

      {label ? (
        <span className={toggleLabelVariants({ checked: currentChecked })}>
          {label}
        </span>
      ) : null}
    </div>
  );
};

export {
  toggleLabelVariants,
  toggleRootVariants,
  toggleThumbVariants,
  toggleTrackVariants,
};
