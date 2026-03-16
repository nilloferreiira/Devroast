import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { roasts } from "@/db/schema";

export type HomepageMetrics = {
  totalRoasted: number;
  avgScore: number;
};

export const getHomepageMetrics = async (): Promise<HomepageMetrics> => {
  const db = getDb();

  const rows = await db
    .select({
      totalRoasted: sql<string>`count(*)::text`,
      avgScore: sql<string | null>`avg(${roasts.score})::text`,
    })
    .from(roasts)
    .where(eq(roasts.status, "completed"));

  const row = rows[0];

  if (!row) {
    return {
      totalRoasted: 0,
      avgScore: 0,
    };
  }

  const totalRoasted = Number.parseInt(row.totalRoasted, 10);
  const avgScoreRaw = row.avgScore ? Number.parseFloat(row.avgScore) : 0;

  return {
    totalRoasted: Number.isNaN(totalRoasted) ? 0 : totalRoasted,
    avgScore: Number.isNaN(avgScoreRaw) ? 0 : Number(avgScoreRaw.toFixed(1)),
  };
};
