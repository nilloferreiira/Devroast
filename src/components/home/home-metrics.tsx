import { Suspense } from "react";
import { HomeMetricsClient } from "@/components/home/home-metrics-client";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

const HomeMetricsFallback = () => {
  return (
    <section className="flex items-center justify-center gap-6 py-1 text-xs text-text-tertiary">
      <span>loading metrics...</span>
    </section>
  );
};

const HomeMetricsPrefetch = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(trpc.homepageMetrics.summary.queryOptions());

  return <HomeMetricsClient />;
};

export const HomeMetrics = () => {
  return (
    <HydrateClient>
      <Suspense fallback={<HomeMetricsFallback />}>
        <HomeMetricsPrefetch />
      </Suspense>
    </HydrateClient>
  );
};
