import { createTRPCRouter } from "@/trpc/init";
import { homepageLeaderboardRouter } from "@/trpc/routers/homepage-leaderboard";
import { leaderboardRouter } from "@/trpc/routers/leaderboard";
import { homepageMetricsRouter } from "@/trpc/routers/metrics";
import { roastRouter } from "@/trpc/routers/roast";

export const appRouter = createTRPCRouter({
  homepageLeaderboard: homepageLeaderboardRouter,
  homepageMetrics: homepageMetricsRouter,
  leaderboard: leaderboardRouter,
  roast: roastRouter,
});

export type AppRouter = typeof appRouter;
