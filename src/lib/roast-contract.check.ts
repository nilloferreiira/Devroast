import { z } from "zod";
import {
  MAX_CODE_CHARS,
  MAX_DIFF_LINE_CONTENT_CHARS,
  MAX_DIFF_LINES,
  MAX_ISSUE_DESCRIPTION_CHARS,
  MAX_ISSUE_TITLE_CHARS,
  MAX_ISSUES,
  normalizeDiffLineList,
  normalizeIssueList,
  normalizeLanguageOrPlaintext,
  normalizeRoastAiOutput,
  normalizeScore,
  roastCreateInputSchema,
  roastCreateOutputSchema,
  truncateToMaxLength,
} from "./roast-contract";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertThrows = (fn: () => unknown, message: string) => {
  let hasThrown = false;

  try {
    fn();
  } catch {
    hasThrown = true;
  }

  assert(hasThrown, message);
};

const run = () => {
  assert(
    normalizeLanguageOrPlaintext("made-up") === "plaintext",
    "invalid language maps to plaintext",
  );
  assert(
    normalizeLanguageOrPlaintext(undefined) === "plaintext",
    "missing language maps to plaintext",
  );
  assert(
    normalizeLanguageOrPlaintext(" typescript ") === "typescript",
    "language normalization trims before lowercase",
  );

  assertThrows(
    () =>
      roastCreateInputSchema.parse({
        code: "",
        roastMode: "roast",
        language: "typescript",
      }),
    "empty code is rejected",
  );

  assertThrows(
    () =>
      roastCreateInputSchema.parse({
        code: "\n  \t ",
        roastMode: "roast",
        language: "typescript",
      }),
    "whitespace-only code is rejected",
  );

  assertThrows(
    () =>
      roastCreateInputSchema.parse({
        code: "a".repeat(MAX_CODE_CHARS + 1),
        roastMode: "roast",
        language: "typescript",
      }),
    "too-long code is rejected",
  );

  const codeWithSpaces = "  const x = 1;  ";
  const parsedInput = roastCreateInputSchema.parse({
    code: codeWithSpaces,
    roastMode: "normal",
    language: "invalid",
  });
  assert(
    parsedInput.code === codeWithSpaces,
    "validated code is preserved byte-for-byte",
  );
  assert(
    parsedInput.language === "plaintext",
    "input parser normalizes invalid language to plaintext",
  );
  const parsedInputWithNullLanguage = roastCreateInputSchema.parse({
    code: codeWithSpaces,
    roastMode: "normal",
    language: null,
  });
  assert(
    parsedInputWithNullLanguage.language === "plaintext",
    "input parser normalizes null language to plaintext",
  );

  assert(normalizeScore(-3) === 0, "score clamps to min");
  assert(normalizeScore(99) === 10, "score clamps to max");
  assert(normalizeScore(7.36) === 7.4, "score rounds to one decimal");
  assert(normalizeScore(7.34) === 7.3, "score rounds down to one decimal");

  assert(
    truncateToMaxLength("abcdef", 3) === "abc",
    "truncate helper trims content to max length",
  );

  const issueList = normalizeIssueList(
    Array.from({ length: MAX_ISSUES + 2 }, (_, index) => ({
      severity: index % 2 === 0 ? "warning" : "critical",
      title: `title-${index}-`.repeat(40),
      description: `description-${index}-`.repeat(300),
      order: 1,
    })),
  );

  assert(issueList.length === MAX_ISSUES, "issue list is truncated");
  assert(
    issueList[0]?.title.length === MAX_ISSUE_TITLE_CHARS,
    "issue title is truncated",
  );
  assert(
    issueList[0]?.description.length === MAX_ISSUE_DESCRIPTION_CHARS,
    "issue description is truncated",
  );
  assert(
    issueList.every((issue, index) => issue.order === index + 1),
    "issue order is deterministic and unique",
  );

  const diffLineList = normalizeDiffLineList(
    Array.from({ length: MAX_DIFF_LINES + 4 }, (_, index) => ({
      lineType: index % 2 === 0 ? "removed" : "added",
      content: `line-${index}-`.repeat(100),
      order: 1,
    })),
  );

  assert(diffLineList.length === MAX_DIFF_LINES, "diff line list is truncated");
  assert(
    diffLineList[0]?.content.length === MAX_DIFF_LINE_CONTENT_CHARS,
    "diff line content is truncated",
  );
  assert(
    diffLineList.every((line, index) => line.order === index + 1),
    "diff line order is deterministic and unique",
  );

  const issueSchemaCheck = z.array(
    z.object({
      severity: z.enum(["critical", "warning", "good"]),
      title: z.string(),
      description: z.string(),
      order: z.number().int(),
    }),
  );
  issueSchemaCheck.parse(issueList);

  const normalizedOutput = normalizeRoastAiOutput({
    score: 11.25,
    verdict: "needs_work",
    summaryQuote: "Q".repeat(500),
    analysisSummary: "S".repeat(2600),
    issues: [
      {
        severity: "critical",
        title: "T".repeat(200),
        description: "D".repeat(2600),
      },
      {
        severity: "good",
        title: "Looks good",
        description: "Keep this pattern.",
        order: 99,
      },
    ],
    diffLines: [
      {
        lineType: "removed",
        content: "-".repeat(700),
      },
      {
        lineType: "added",
        content: "+ const improved = true;",
        order: 4,
      },
    ],
  });
  roastCreateOutputSchema.parse(normalizedOutput);

  console.log("PASS roast-contract checks");
};

run();
