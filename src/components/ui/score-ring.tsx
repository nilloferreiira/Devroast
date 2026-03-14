import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const scoreRingVariants = tv({
  base: "relative h-[180px] w-[180px]",
  variants: {
    size: {
      md: "h-[180px] w-[180px]",
      sm: "h-[120px] w-[120px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const scoreValueVariants = tv({
  base: "font-mono",
  variants: {
    size: {
      md: "text-5xl",
      sm: "text-3xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const scoreDenomVariants = tv({
  base: "font-mono text-text-tertiary",
  variants: {
    size: {
      md: "text-base",
      sm: "text-xs",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const sizeConfig = {
  sm: {
    radius: 52,
    stroke: 4,
    viewBox: 120,
  },
  md: {
    radius: 80,
    stroke: 4,
    viewBox: 180,
  },
} as const;

export type ScoreRingProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof scoreRingVariants> & {
    score: number;
    max?: number;
  };

export const ScoreRing = ({
  className,
  size = "md",
  score,
  max = 10,
  ...props
}: ScoreRingProps) => {
  const cfg = sizeConfig[size];
  const clamped = Math.max(0, Math.min(score, max));
  const progress = clamped / max;
  const circumference = 2 * Math.PI * cfg.radius;
  const dashOffset = circumference * (1 - progress);
  const half = cfg.viewBox / 2;

  return (
    <div className={scoreRingVariants({ size, className })} {...props}>
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${cfg.viewBox} ${cfg.viewBox}`}
        role="img"
        aria-label={`Score ${clamped}/${max}`}
      >
        <circle
          cx={half}
          cy={half}
          r={cfg.radius}
          fill="none"
          stroke="var(--color-border-primary)"
          strokeWidth={cfg.stroke}
        />

        <circle
          cx={half}
          cy={half}
          r={cfg.radius}
          fill="none"
          stroke="url(#scoreRingGradient)"
          strokeWidth={cfg.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${half} ${half})`}
        />

        <defs>
          <linearGradient
            id="scoreRingGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--color-accent-green)" />
            <stop offset="65%" stopColor="var(--color-accent-amber)" />
            <stop offset="100%" stopColor="var(--color-accent-red)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={scoreValueVariants({ size })}>
          {clamped.toFixed(1)}
        </span>
        <span className={scoreDenomVariants({ size })}>{`/${max}`}</span>
      </div>
    </div>
  );
};

export { scoreDenomVariants, scoreRingVariants, scoreValueVariants };
