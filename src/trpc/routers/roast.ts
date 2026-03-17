import { TRPCError } from "@trpc/server";
import {
  completeRoastWithDetails,
  createProcessingRoastRecord,
  createSubmissionRecord,
  markRoastAsFailed,
} from "@/db/queries";
import {
  generateRoastAnalysis,
  RoastAdapterError,
} from "@/lib/ai/gemini-roast";
import { roastCreateInputSchema } from "@/lib/roast-contract";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const INTERNAL_RETRY_SAFE_MESSAGE =
  "Unable to create roast right now. Please retry.";

const logRoastCreate = (
  event:
    | "roast.create.started"
    | "roast.create.completed"
    | "roast.create.db_commit_error"
    | "roast.create.provider_timeout"
    | "roast.create.provider_error"
    | "roast.create.parse_error",
  metadata: Record<string, string>,
) => {
  console.info(event, metadata);
};

const safeMarkRoastAsFailed = async (input: {
  roastId: string;
  errorMessage: string;
  category: "db_commit" | "adapter_error" | "unexpected_error";
}) => {
  try {
    await markRoastAsFailed(input.roastId, input.errorMessage);
  } catch {
    console.warn("roast.create.failure_persist_warning", {
      roastId: input.roastId,
      category: input.category,
    });
  }
};

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(roastCreateInputSchema)
    .mutation(async ({ input }) => {
      let roastId: string | null = null;

      try {
        const submission = await createSubmissionRecord({
          sourceCode: input.code,
          language: input.language,
          roastMode: input.roastMode,
        });

        const roast = await createProcessingRoastRecord({
          submissionId: submission.id,
        });

        roastId = roast.id;
        logRoastCreate("roast.create.started", {
          submissionId: submission.id,
          roastId,
        });

        const analysis = await generateRoastAnalysis({
          code: input.code,
          roastMode: input.roastMode,
          language: input.language,
        });

        try {
          await completeRoastWithDetails({
            roastId,
            score: analysis.score,
            verdict: analysis.verdict,
            summaryQuote: analysis.summaryQuote,
            analysisSummary: analysis.analysisSummary,
            issues: analysis.issues,
            diffLines: analysis.diffLines,
          });
        } catch (error) {
          logRoastCreate("roast.create.db_commit_error", {
            roastId,
          });

          await safeMarkRoastAsFailed({
            roastId,
            errorMessage: INTERNAL_RETRY_SAFE_MESSAGE,
            category: "db_commit",
          });
          throw error;
        }

        logRoastCreate("roast.create.completed", {
          roastId,
        });

        return { roastId };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof RoastAdapterError) {
          if (roastId) {
            await safeMarkRoastAsFailed({
              roastId,
              errorMessage: INTERNAL_RETRY_SAFE_MESSAGE,
              category: "adapter_error",
            });
          }

          const adapterEvent =
            error.category === "provider_timeout"
              ? "roast.create.provider_timeout"
              : error.category === "provider_error"
                ? "roast.create.provider_error"
                : "roast.create.parse_error";

          logRoastCreate(adapterEvent, {
            roastId: roastId ?? "none",
            category: error.category,
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: INTERNAL_RETRY_SAFE_MESSAGE,
          });
        }

        if (error instanceof Error && error.name === "ZodError") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid code payload",
          });
        }

        if (roastId) {
          await safeMarkRoastAsFailed({
            roastId,
            errorMessage: INTERNAL_RETRY_SAFE_MESSAGE,
            category: "unexpected_error",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: INTERNAL_RETRY_SAFE_MESSAGE,
        });
      }
    }),
});
