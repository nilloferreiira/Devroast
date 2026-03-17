import { TRPCError } from "@trpc/server";
import {
  completeRoastWithDetails,
  createSubmissionWithProcessingRoast,
  markRoastAsFailed,
} from "@/db/queries";
import {
  generateRoastAnalysis,
  RoastAdapterError,
  type RoastAdapterErrorCategory,
} from "@/lib/ai/gemini-roast";
import type {
  NormalizedRoastOutput,
  RoastCreateInput,
} from "@/lib/roast-contract";
import { roastCreateInputSchema } from "@/lib/roast-contract";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const INTERNAL_RETRY_SAFE_MESSAGE =
  "Unable to create roast right now. Please retry.";

type RoastCreateEvent =
  | "roast.create.started"
  | "roast.create.completed"
  | "roast.create.db_commit_error"
  | "roast.create.provider_timeout"
  | "roast.create.provider_error"
  | "roast.create.parse_error"
  | "roast.create.unexpected_error";

type RoastCreateWarningEvent = "roast.create.failure_persist_warning";

const logRoastCreate = (
  event: RoastCreateEvent,
  metadata: Record<string, string>,
) => {
  console.info(event, metadata);
};

const logRoastCreateWarning = (
  event: RoastCreateWarningEvent,
  metadata: Record<string, string>,
) => {
  console.warn(event, metadata);
};

const mapAdapterCategoryToEvent = (
  category: RoastAdapterErrorCategory,
): Extract<
  RoastCreateEvent,
  | "roast.create.provider_timeout"
  | "roast.create.provider_error"
  | "roast.create.parse_error"
> => {
  return category === "provider_timeout"
    ? "roast.create.provider_timeout"
    : category === "provider_error"
      ? "roast.create.provider_error"
      : "roast.create.parse_error";
};

type RoastCreateDeps = {
  createSubmissionWithProcessingRoast: (input: {
    sourceCode: string;
    language: RoastCreateInput["language"];
    roastMode: RoastCreateInput["roastMode"];
  }) => Promise<{ submissionId: string; roastId: string }>;
  generateRoastAnalysis: (input: {
    code: string;
    roastMode: RoastCreateInput["roastMode"];
    language: RoastCreateInput["language"];
  }) => Promise<NormalizedRoastOutput>;
  completeRoastWithDetails: (input: {
    roastId: string;
    score: number;
    verdict: NormalizedRoastOutput["verdict"];
    summaryQuote: string;
    analysisSummary: string;
    issues: NormalizedRoastOutput["issues"];
    diffLines: NormalizedRoastOutput["diffLines"];
  }) => Promise<void>;
  markRoastAsFailed: (
    roastId: string,
    errorMessage: string,
  ) => Promise<unknown>;
  logEvent: (event: RoastCreateEvent, metadata: Record<string, string>) => void;
  logWarning: (
    event: RoastCreateWarningEvent,
    metadata: Record<string, string>,
  ) => void;
};

const defaultRoastCreateDeps: RoastCreateDeps = {
  createSubmissionWithProcessingRoast,
  generateRoastAnalysis,
  completeRoastWithDetails,
  markRoastAsFailed,
  logEvent: logRoastCreate,
  logWarning: logRoastCreateWarning,
};

export const createRoastCreateMutationHandler = (
  deps?: Partial<RoastCreateDeps>,
) => {
  const resolvedDeps: RoastCreateDeps = {
    ...defaultRoastCreateDeps,
    ...deps,
  };

  const safeMarkRoastAsFailed = async (input: {
    roastId: string;
    errorMessage: string;
    category: "db_commit" | "adapter_error" | "unexpected_error";
  }) => {
    try {
      await resolvedDeps.markRoastAsFailed(input.roastId, input.errorMessage);
    } catch {
      resolvedDeps.logWarning("roast.create.failure_persist_warning", {
        roastId: input.roastId,
        category: input.category,
      });
    }
  };

  return async (input: RoastCreateInput) => {
    let roastId: string | null = null;
    let submissionId: string | null = null;

    try {
      const created = await resolvedDeps.createSubmissionWithProcessingRoast({
        sourceCode: input.code,
        language: input.language,
        roastMode: input.roastMode,
      });

      roastId = created.roastId;
      submissionId = created.submissionId;
      resolvedDeps.logEvent("roast.create.started", {
        submissionId,
        roastId,
      });

      const analysis = await resolvedDeps.generateRoastAnalysis({
        code: input.code,
        roastMode: input.roastMode,
        language: input.language,
      });

      try {
        await resolvedDeps.completeRoastWithDetails({
          roastId,
          score: analysis.score,
          verdict: analysis.verdict,
          summaryQuote: analysis.summaryQuote,
          analysisSummary: analysis.analysisSummary,
          issues: analysis.issues,
          diffLines: analysis.diffLines,
        });
      } catch {
        resolvedDeps.logEvent("roast.create.db_commit_error", {
          roastId,
          submissionId,
        });

        await safeMarkRoastAsFailed({
          roastId,
          errorMessage: INTERNAL_RETRY_SAFE_MESSAGE,
          category: "db_commit",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: INTERNAL_RETRY_SAFE_MESSAGE,
        });
      }

      resolvedDeps.logEvent("roast.create.completed", {
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

        resolvedDeps.logEvent(mapAdapterCategoryToEvent(error.category), {
          roastId: roastId ?? "none",
          submissionId: submissionId ?? "none",
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

      resolvedDeps.logEvent("roast.create.unexpected_error", {
        roastId: roastId ?? "none",
        submissionId: submissionId ?? "none",
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: INTERNAL_RETRY_SAFE_MESSAGE,
      });
    }
  };
};

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(roastCreateInputSchema)
    .mutation(async ({ input }) => {
      const handler = createRoastCreateMutationHandler();
      return handler(input);
    }),
});
