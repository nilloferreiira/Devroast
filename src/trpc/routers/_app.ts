import { createTRPCRouter } from "@/trpc/init";
import { homepageLeaderboardRouter } from "@/trpc/routers/homepage-leaderboard";
import { leaderboardRouter } from "@/trpc/routers/leaderboard";
import { homepageMetricsRouter } from "@/trpc/routers/metrics";

export const appRouter = createTRPCRouter({
  homepageLeaderboard: homepageLeaderboardRouter,
  homepageMetrics: homepageMetricsRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
