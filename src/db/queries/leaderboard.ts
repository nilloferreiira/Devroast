import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { roasts, submissions } from "@/db/schema";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";

export type LeaderboardRow = {
  rank: string;
  score: string;
  preview: string;
  code: string;
  lang: CodeLanguageOrPlaintext;
};

export type HomepageShameLeaderboardSummary = {
  rows: LeaderboardRow[];
  totalRoasts: number;
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
      code: row.sourceCode,
      lang: row.language,
    };
  });
};

export const getHomepageShameLeaderboardSummary = async (
  limit = 3,
): Promise<HomepageShameLeaderboardSummary> => {
  const db = getDb();

  const [rows, countRows] = await Promise.all([
    getLeaderboardRows(limit),
    db
      .select({
        totalRoasts: sql<string>`count(*)::text`,
      })
      .from(roasts)
      .where(eq(roasts.status, "completed")),
  ]);

  const totalRoastsRaw = Number.parseInt(countRows[0]?.totalRoasts ?? "0", 10);

  return {
    rows,
    totalRoasts: Number.isNaN(totalRoastsRaw) ? 0 : totalRoastsRaw,
  };
};
