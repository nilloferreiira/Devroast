import { pgEnum } from "drizzle-orm/pg-core";

export const codeLanguageEnum = pgEnum("code_language", [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "python",
  "plaintext",
]);

export const roastModeEnum = pgEnum("roast_mode", ["normal", "roast"]);

export const roastStatusEnum = pgEnum("roast_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "removed",
  "added",
  "context",
]);

export const roastVerdictEnum = pgEnum("roast_verdict", [
  "needs_serious_help",
  "needs_work",
  "not_great",
  "decent",
  "clean",
]);

export type CodeLanguage = (typeof codeLanguageEnum.enumValues)[number];
export type RoastMode = (typeof roastModeEnum.enumValues)[number];
export type RoastStatus = (typeof roastStatusEnum.enumValues)[number];
export type IssueSeverity = (typeof issueSeverityEnum.enumValues)[number];
export type DiffLineType = (typeof diffLineTypeEnum.enumValues)[number];
export type RoastVerdict = (typeof roastVerdictEnum.enumValues)[number];
