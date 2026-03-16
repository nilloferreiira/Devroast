import { createTRPCRouter } from "@/trpc/init";
import { homepageLeaderboardRouter } from "@/trpc/routers/homepage-leaderboard";
import { homepageMetricsRouter } from "@/trpc/routers/metrics";

export const appRouter = createTRPCRouter({
  homepageLeaderboard: homepageLeaderboardRouter,
  homepageMetrics: homepageMetricsRouter,
});

export type AppRouter = typeof appRouter;
