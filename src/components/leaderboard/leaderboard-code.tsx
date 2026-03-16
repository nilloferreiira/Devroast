"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { useState } from "react";
import { tv } from "tailwind-variants";

const codeToggleVariants = tv({
  base: "mt-2 inline-flex items-center font-mono text-[11px] text-accent-cyan transition-colors hover:text-text-primary",
});

const codePanelVariants = tv({
  base: "relative overflow-hidden transition-[max-height] duration-300 ease-out",
  variants: {
    expanded: {
      false: "max-h-[84px]",
      true: "max-h-none",
    },
  },
  defaultVariants: {
    expanded: false,
  },
});

const codeFadeVariants = tv({
  base: "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-surface to-transparent",
});

export type LeaderboardCodeProps = {
  children: React.ReactNode;
  canExpand?: boolean;
};

export const LeaderboardCode = ({
  children,
  canExpand = true,
}: LeaderboardCodeProps) => {
  const [open, setOpen] = useState(false);

  if (!canExpand) {
    return <div className="pb-3">{children}</div>;
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className={codePanelVariants({ expanded: open })}>
        {children}
        {!open ? <div className={codeFadeVariants()} /> : null}
      </div>

      <div className="px-5 pb-3">
        <Collapsible.Trigger className={codeToggleVariants()}>
          {open ? "show less" : "show more"}
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
};
