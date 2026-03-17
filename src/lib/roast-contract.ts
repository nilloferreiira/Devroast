import { z } from "zod";
import {
  codeLanguageEnum,
  diffLineTypeEnum,
  issueSeverityEnum,
  roastModeEnum,
  roastVerdictEnum,
} from "@/db/schema/enums";

export const MAX_CODE_CHARS = 2000;
export const MAX_ISSUES = 8;
export const MAX_DIFF_LINES = 12;
export const MAX_SUMMARY_QUOTE_CHARS = 300;
export const MAX_ANALYSIS_SUMMARY_CHARS = 2000;
export const MAX_ISSUE_TITLE_CHARS = 140;
export const MAX_ISSUE_DESCRIPTION_CHARS = 2000;
export const MAX_DIFF_LINE_CONTENT_CHARS = 500;
export const AI_TIMEOUT_MS = 20_000;

const languageValues = codeLanguageEnum.enumValues;
export const roastModeValues = roastModeEnum.enumValues;
export const roastVerdictValues = roastVerdictEnum.enumValues;
export const issueSeverityValues = issueSeverityEnum.enumValues;
export const diffLineTypeValues = diffLineTypeEnum.enumValues;

export const roastAiRequiredFieldList = [
  "score",
  "verdict",
  "summaryQuote",
  "analysisSummary",
  "issues",
  "diffLines",
] as const;

export const normalizeLanguageOrPlaintext = (
  language: string | null | undefined,
): (typeof languageValues)[number] => {
  if (language == null) {
    return "plaintext";
  }

  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return "plaintext";
  }

  return languageValues.includes(normalized as (typeof languageValues)[number])
    ? (normalized as (typeof languageValues)[number])
    : "plaintext";
};

export const normalizeScore = (score: number): number => {
  const clamped = Math.min(10, Math.max(0, score));
  return Math.round(clamped * 10) / 10;
};

export const truncateToMaxLength = (
  value: string,
  maxLength: number,
): string => {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
};

const issueSchema = z.object({
  severity: z.enum(issueSeverityEnum.enumValues),
  title: z.string(),
  description: z.string(),
  order: z.number().int(),
});

const diffLineSchema = z.object({
  lineType: z.enum(diffLineTypeEnum.enumValues),
  content: z.string(),
  order: z.number().int(),
});

const issueCandidateSchema = z.object({
  severity: z.enum(issueSeverityEnum.enumValues),
  title: z.string(),
  description: z.string(),
  order: z.number().int().optional(),
});

const diffLineCandidateSchema = z.object({
  lineType: z.enum(diffLineTypeEnum.enumValues),
  content: z.string(),
  order: z.number().int().optional(),
});

export const normalizeIssueList = (
  issues: readonly z.input<typeof issueCandidateSchema>[],
): z.infer<typeof issueSchema>[] => {
  return issues.slice(0, MAX_ISSUES).map((issue, index) => ({
    severity: issue.severity,
    title: truncateToMaxLength(issue.title, MAX_ISSUE_TITLE_CHARS),
    description: truncateToMaxLength(
      issue.description,
      MAX_ISSUE_DESCRIPTION_CHARS,
    ),
    order: index + 1,
  }));
};

export const normalizeDiffLineList = (
  diffLines: readonly z.input<typeof diffLineCandidateSchema>[],
): z.infer<typeof diffLineSchema>[] => {
  return diffLines.slice(0, MAX_DIFF_LINES).map((diffLine, index) => ({
    lineType: diffLine.lineType,
    content: truncateToMaxLength(diffLine.content, MAX_DIFF_LINE_CONTENT_CHARS),
    order: index + 1,
  }));
};

export const roastCreateInputSchema = z.object({
  code: z
    .string()
    .refine((value) => value.trim().length > 0, "Code is required")
    .max(MAX_CODE_CHARS),
  roastMode: z.enum(roastModeEnum.enumValues),
  language: z
    .union([z.string(), z.null()])
    .optional()
    .transform((language) => normalizeLanguageOrPlaintext(language)),
});

export const roastAiRawOutputSchema = z.object({
  score: z.number(),
  verdict: z.enum(roastVerdictEnum.enumValues),
  summaryQuote: z.string(),
  analysisSummary: z.string(),
  issues: z.array(issueCandidateSchema),
  diffLines: z.array(diffLineCandidateSchema),
});

export const normalizeRoastAiOutput = (
  output: z.infer<typeof roastAiRawOutputSchema>,
) => {
  return {
    score: normalizeScore(output.score),
    verdict: output.verdict,
    summaryQuote: truncateToMaxLength(
      output.summaryQuote,
      MAX_SUMMARY_QUOTE_CHARS,
    ),
    analysisSummary: truncateToMaxLength(
      output.analysisSummary,
      MAX_ANALYSIS_SUMMARY_CHARS,
    ),
    issues: normalizeIssueList(output.issues),
    diffLines: normalizeDiffLineList(output.diffLines),
  };
};

export const roastCreateOutputSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.enum(roastVerdictEnum.enumValues),
  summaryQuote: z.string().max(MAX_SUMMARY_QUOTE_CHARS),
  analysisSummary: z.string().max(MAX_ANALYSIS_SUMMARY_CHARS),
  issues: z.array(issueSchema).max(MAX_ISSUES),
  diffLines: z.array(diffLineSchema).max(MAX_DIFF_LINES),
});

export type RoastCreateInput = z.infer<typeof roastCreateInputSchema>;
export type RoastCreateRawOutput = z.infer<typeof roastAiRawOutputSchema>;
export type RoastCreateOutput = z.infer<typeof roastCreateOutputSchema>;
export type NormalizedRoastOutput = RoastCreateOutput;
