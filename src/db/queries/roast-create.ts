import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { roastDiffLines, roastIssues, roasts, submissions } from "@/db/schema";
import type {
  CodeLanguage,
  DiffLineType,
  IssueSeverity,
  RoastMode,
  RoastVerdict,
} from "@/db/schema/enums";

const ROAST_OPERATIONAL_FAILURE_MESSAGE =
  "Roast generation failed. Please retry.";
const MAX_OPERATIONAL_ERROR_MESSAGE_CHARS = 300;

const sanitizeOperationalErrorMessage = (message: string): string => {
  const sanitized = message
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_OPERATIONAL_ERROR_MESSAGE_CHARS);

  return sanitized.length > 0 ? sanitized : ROAST_OPERATIONAL_FAILURE_MESSAGE;
};

const toLineCount = (sourceCode: string): number => {
  if (sourceCode.length === 0) {
    return 0;
  }

  return sourceCode.split(/\r\n|\r|\n/).length;
};

export const createSubmissionRecord = async (input: {
  sourceCode: string;
  language: CodeLanguage;
  roastMode: RoastMode;
}) => {
  const db = getDb();

  const [createdSubmission] = await db
    .insert(submissions)
    .values({
      sourceCode: input.sourceCode,
      language: input.language,
      roastMode: input.roastMode,
      lineCount: toLineCount(input.sourceCode),
    })
    .returning({
      id: submissions.id,
    });

  if (!createdSubmission) {
    throw new Error("Failed to create submission record");
  }

  return createdSubmission;
};

export const createProcessingRoastRecord = async (input: {
  submissionId: string;
}) => {
  const db = getDb();

  const [createdRoast] = await db
    .insert(roasts)
    .values({
      submissionId: input.submissionId,
      status: "processing",
    })
    .returning({
      id: roasts.id,
    });

  if (!createdRoast) {
    throw new Error("Failed to create processing roast record");
  }

  return createdRoast;
};

export const completeRoastWithDetails = async (input: {
  roastId: string;
  score: number;
  verdict: RoastVerdict;
  summaryQuote: string;
  analysisSummary: string;
  issues: ReadonlyArray<{
    severity: IssueSeverity;
    title: string;
    description: string;
  }>;
  diffLines: ReadonlyArray<{
    lineType: DiffLineType;
    content: string;
  }>;
}) => {
  const db = getDb();

  await db.transaction(async (tx) => {
    const [updatedRoast] = await tx
      .update(roasts)
      .set({
        status: "completed",
        score: input.score.toFixed(1),
        verdict: input.verdict,
        summaryQuote: input.summaryQuote,
        analysisSummary: input.analysisSummary,
        errorMessage: null,
        completedAt: new Date(),
      })
      .where(and(eq(roasts.id, input.roastId), eq(roasts.status, "processing")))
      .returning({
        id: roasts.id,
      });

    if (!updatedRoast) {
      throw new Error("Roast was not in processing state");
    }

    if (input.issues.length > 0) {
      await tx.insert(roastIssues).values(
        input.issues.map((issue, index) => ({
          roastId: input.roastId,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          displayOrder: index + 1,
        })),
      );
    }

    if (input.diffLines.length > 0) {
      await tx.insert(roastDiffLines).values(
        input.diffLines.map((diffLine, index) => ({
          roastId: input.roastId,
          lineType: diffLine.lineType,
          content: diffLine.content,
          displayOrder: index + 1,
        })),
      );
    }
  });
};

export const markRoastAsFailed = async (
  roastId: string,
  errorMessage: string,
) => {
  const db = getDb();

  const [failedRoast] = await db
    .update(roasts)
    .set({
      status: "failed",
      errorMessage: sanitizeOperationalErrorMessage(errorMessage),
      completedAt: null,
    })
    .where(and(eq(roasts.id, roastId), eq(roasts.status, "processing")))
    .returning({
      id: roasts.id,
    });

  return failedRoast ?? null;
};
