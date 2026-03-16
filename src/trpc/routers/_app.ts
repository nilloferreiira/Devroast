import { createTRPCRouter } from "@/trpc/init";
import { homepageMetricsRouter } from "@/trpc/routers/metrics";

export const appRouter = createTRPCRouter({
  homepageMetrics: homepageMetricsRouter,
});

export type AppRouter = typeof appRouter;
