import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { roastDiffLines, roastIssues, roasts, submissions } from "@/db/schema";

export const getRoastBySubmissionId = async (submissionId: string) => {
  const db = getDb();

  const rows = await db
    .select({
      roastId: roasts.id,
      submissionId: submissions.id,
      sourceCode: submissions.sourceCode,
      language: submissions.language,
      roastMode: submissions.roastMode,
      status: roasts.status,
      score: roasts.score,
      verdict: roasts.verdict,
      summaryQuote: roasts.summaryQuote,
      analysisSummary: roasts.analysisSummary,
      errorMessage: roasts.errorMessage,
      completedAt: roasts.completedAt,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  return rows[0] ?? null;
};

export const getRoastIssues = async (roastId: string) => {
  const db = getDb();

  return db
    .select({
      id: roastIssues.id,
      severity: roastIssues.severity,
      title: roastIssues.title,
      description: roastIssues.description,
      displayOrder: roastIssues.displayOrder,
    })
    .from(roastIssues)
    .where(eq(roastIssues.roastId, roastId))
    .orderBy(asc(roastIssues.displayOrder));
};

export const getRoastDiffLines = async (roastId: string) => {
  const db = getDb();

  return db
    .select({
      id: roastDiffLines.id,
      lineType: roastDiffLines.lineType,
      content: roastDiffLines.content,
      displayOrder: roastDiffLines.displayOrder,
    })
    .from(roastDiffLines)
    .where(eq(roastDiffLines.roastId, roastId))
    .orderBy(asc(roastDiffLines.displayOrder));
};

export const getCompletedRoastBundleBySubmissionId = async (
  submissionId: string,
) => {
  const roast = await getRoastBySubmissionId(submissionId);

  if (!roast || roast.status !== "completed") {
    return null;
  }

  const [issues, diffLines] = await Promise.all([
    getRoastIssues(roast.roastId),
    getRoastDiffLines(roast.roastId),
  ]);

  return {
    roast,
    issues,
    diffLines,
  };
};

export const getRoastById = cache(async (roastId: string) => {
  const db = getDb();

  const rows = await db
    .select({
      roastId: roasts.id,
      submissionId: submissions.id,
      sourceCode: submissions.sourceCode,
      language: submissions.language,
      roastMode: submissions.roastMode,
      status: roasts.status,
      score: roasts.score,
      verdict: roasts.verdict,
      summaryQuote: roasts.summaryQuote,
      analysisSummary: roasts.analysisSummary,
      errorMessage: roasts.errorMessage,
      completedAt: roasts.completedAt,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .where(eq(roasts.id, roastId))
    .limit(1);

  return rows[0] ?? null;
});
