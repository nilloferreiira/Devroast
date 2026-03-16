"use client";

import NumberFlow from "@number-flow/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

export const HomeMetricsClient = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.homepageMetrics.summary.queryOptions(),
  );

  const [totalRoasted, setTotalRoasted] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    setTotalRoasted(data.totalRoasted);
    setAvgScore(data.avgScore);
  }, [data.avgScore, data.totalRoasted]);

  return (
    <section className="flex items-center justify-center gap-6 py-1 text-xs text-text-tertiary">
      <span className="inline-flex items-center gap-1">
        <NumberFlow
          value={totalRoasted}
          format={{ useGrouping: true, maximumFractionDigits: 0 }}
          className="font-mono tabular-nums"
        />
        <span>codes roasted</span>
      </span>

      <span className="font-mono">·</span>

      <span className="inline-flex items-center gap-1">
        <span>avg score:</span>
        <NumberFlow
          value={avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          className="font-mono tabular-nums"
        />
        <span>/10</span>
      </span>
    </section>
  );
};
