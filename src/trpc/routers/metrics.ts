import { getHomepageMetrics } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const homepageMetricsRouter = createTRPCRouter({
  summary: baseProcedure.query(async () => {
    return getHomepageMetrics();
  }),
});
