import {
  RoastAdapterError,
  generateRoastAnalysis,
} from "./gemini-roast";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertRejectsAdapterCategory = async (
  fn: () => Promise<unknown>,
  expectedCategory: RoastAdapterError["category"],
  message: string,
) => {
  let captured: unknown;

  try {
    await fn();
  } catch (error) {
    captured = error;
  }

  assert(captured instanceof RoastAdapterError, `${message}: typed error expected`);
  assert(
    (captured as RoastAdapterError).category === expectedCategory,
    `${message}: expected ${expectedCategory}`,
  );
};

const run = async () => {
  const normalCallInputs: { prompt: string; timeoutMs: number }[] = [];
  await generateRoastAnalysis(
    {
      code: "const ok = true;",
      roastMode: "normal",
      language: "typescript",
    },
    {
      callModel: async (input) => {
        normalCallInputs.push(input);
        return JSON.stringify({
          score: 8.2,
          verdict: "clean",
          summaryQuote: "Solid structure.",
          analysisSummary: "Most decisions are clear and maintainable.",
          issues: [],
          diffLines: [],
        });
      },
    },
  );

  assert(normalCallInputs.length === 1, "normal mode should call provider once");
  assert(
    normalCallInputs[0]?.prompt.includes("serious and objective"),
    "normal mode prompt should request serious/objective tone",
  );

  const roastCallInputs: { prompt: string; timeoutMs: number }[] = [];
  await generateRoastAnalysis(
    {
      code: "const noob = 1;",
      roastMode: "roast",
      language: "javascript",
    },
    {
      callModel: async (input) => {
        roastCallInputs.push(input);
        return JSON.stringify({
          score: 2.1,
          verdict: "needs_serious_help",
          summaryQuote: "This code needs intervention.",
          analysisSummary: "The roast is sarcastic, but still actionable.",
          issues: [
            {
              severity: "critical",
              title: "Unclear naming",
              description: "Identifiers hide intent.",
            },
          ],
          diffLines: [
            {
              lineType: "added",
              content: "+ const improvedName = 1;",
            },
          ],
        });
      },
    },
  );

  assert(roastCallInputs.length === 1, "roast mode should call provider once");
  assert(
    roastCallInputs[0]?.prompt.includes("sarcastic"),
    "roast mode prompt should allow sarcastic tone",
  );

  await assertRejectsAdapterCategory(
    () =>
      generateRoastAnalysis(
        {
          code: "const value = 1;",
          roastMode: "normal",
          language: "typescript",
        },
        {
          callModel: async () => "{bad json",
        },
      ),
    "parse_error",
    "malformed provider JSON should be parse_error",
  );

  await assertRejectsAdapterCategory(
    () =>
      generateRoastAnalysis(
        {
          code: "const value = 1;",
          roastMode: "normal",
          language: "typescript",
        },
        {
          callModel: async () => {
            throw new Error("timeout");
          },
        },
      ),
    "provider_timeout",
    "timeout path should map only to provider_timeout",
  );

  console.log("PASS gemini-roast adapter checks");
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
