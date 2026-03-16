import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { roasts, submissions } from "@/db/schema";

export type LeaderboardRow = {
  rank: string;
  score: string;
  preview: string;
  lang: string;
};

export const getLeaderboardRows = async (
  limit = 3,
): Promise<LeaderboardRow[]> => {
  const db = getDb();

  const rows = await db
    .select({
      score: roasts.score,
      sourceCode: submissions.sourceCode,
      language: submissions.language,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .where(eq(roasts.status, "completed"))
    .orderBy(asc(roasts.score), desc(roasts.completedAt))
    .limit(limit);

  return rows.map((row, index) => {
    const preview = row.sourceCode.replaceAll("\n", " ").slice(0, 64);
    const score = row.score ?? "0.0";

    return {
      rank: `#${index + 1}`,
      score: `${score}`,
      preview:
        preview.length < row.sourceCode.length ? `${preview} ...` : preview,
      lang: row.language,
    };
  });
};
