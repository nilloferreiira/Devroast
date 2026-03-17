import { TRPCError } from "@trpc/server";
import { RoastAdapterError } from "@/lib/ai/gemini-roast";
import type { RoastCreateInput } from "@/lib/roast-contract";
import {
  createRoastCreateMutationHandler,
  INTERNAL_RETRY_SAFE_MESSAGE,
} from "./roast";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertInternalServerError = (error: unknown, message: string) => {
  assert(error instanceof TRPCError, `${message}: expected TRPCError`);
  assert(
    (error as TRPCError).code === "INTERNAL_SERVER_ERROR",
    `${message}: expected INTERNAL_SERVER_ERROR`,
  );
  assert(
    (error as TRPCError).message === INTERNAL_RETRY_SAFE_MESSAGE,
    `${message}: expected retry-safe message`,
  );
};

const baseInput: RoastCreateInput = {
  code: "const answer = 42;",
  roastMode: "roast",
  language: "typescript",
};

const run = async () => {
  {
    const completionCalls: Array<{ roastId: string }> = [];
    const events: string[] = [];

    const handler = createRoastCreateMutationHandler({
      createSubmissionWithProcessingRoast: async () => ({
        submissionId: "sub-1",
        roastId: "roast-1",
      }),
      generateRoastAnalysis: async () => ({
        score: 8.1,
        verdict: "clean",
        summaryQuote: "Looks good.",
        analysisSummary: "Readable and maintainable.",
        issues: [],
        diffLines: [],
      }),
      completeRoastWithDetails: async (input) => {
        completionCalls.push({ roastId: input.roastId });
      },
      markRoastAsFailed: async () => null,
      logEvent: (event) => {
        events.push(event);
      },
      logWarning: () => {
        throw new Error("warning should not be emitted in happy path");
      },
    });

    const result = await handler(baseInput);
    assert(result.roastId === "roast-1", "happy path returns roastId");
    assert(completionCalls.length === 1, "happy path calls completion once");
    assert(
      events.includes("roast.create.completed"),
      "happy path logs completion",
    );
  }

  {
    let markAttemptCount = 0;

    const handler = createRoastCreateMutationHandler({
      createSubmissionWithProcessingRoast: async () => ({
        submissionId: "sub-2",
        roastId: "roast-2",
      }),
      generateRoastAnalysis: async () => {
        throw new RoastAdapterError("provider_error", "provider failed");
      },
      completeRoastWithDetails: async () => undefined,
      markRoastAsFailed: async () => {
        markAttemptCount += 1;
        return { id: "roast-2" };
      },
      logEvent: () => undefined,
      logWarning: () => undefined,
    });

    let captured: unknown;
    try {
      await handler(baseInput);
    } catch (error) {
      captured = error;
    }

    assertInternalServerError(captured, "adapter error path");
    assert(
      markAttemptCount === 1,
      "adapter error path attempts failure persistence",
    );
  }

  {
    const events: string[] = [];

    const handler = createRoastCreateMutationHandler({
      createSubmissionWithProcessingRoast: async () => ({
        submissionId: "sub-3",
        roastId: "roast-3",
      }),
      generateRoastAnalysis: async () => ({
        score: 6,
        verdict: "needs_work",
        summaryQuote: "Could improve.",
        analysisSummary: "Several quality issues.",
        issues: [],
        diffLines: [],
      }),
      completeRoastWithDetails: async () => {
        throw new Error("commit failed");
      },
      markRoastAsFailed: async () => ({ id: "roast-3" }),
      logEvent: (event) => {
        events.push(event);
      },
      logWarning: () => undefined,
    });

    let captured: unknown;
    try {
      await handler(baseInput);
    } catch (error) {
      captured = error;
    }

    assertInternalServerError(captured, "db commit failure path");
    assert(
      events.includes("roast.create.db_commit_error"),
      "db commit failure emits db_commit_error log",
    );
  }

  {
    const warnings: string[] = [];

    const handler = createRoastCreateMutationHandler({
      createSubmissionWithProcessingRoast: async () => ({
        submissionId: "sub-4",
        roastId: "roast-4",
      }),
      generateRoastAnalysis: async () => {
        throw new RoastAdapterError("parse_error", "invalid payload");
      },
      completeRoastWithDetails: async () => undefined,
      markRoastAsFailed: async () => {
        throw new Error("persist failed");
      },
      logEvent: () => undefined,
      logWarning: (event) => {
        warnings.push(event);
      },
    });

    let captured: unknown;
    try {
      await handler(baseInput);
    } catch (error) {
      captured = error;
    }

    assertInternalServerError(captured, "failure persist warning path");
    assert(
      warnings.includes("roast.create.failure_persist_warning"),
      "failure persist warning event is emitted",
    );
  }

  console.log("PASS roast router checks");
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
