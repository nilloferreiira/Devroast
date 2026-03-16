import { getHomepageShameLeaderboardSummary } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const homepageLeaderboardRouter = createTRPCRouter({
  summary: baseProcedure.query(async () => {
    return getHomepageShameLeaderboardSummary(3);
  }),
});
