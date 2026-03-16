"use server";

import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";
import { highlightCode } from "@/lib/highlight-code";

export const highlightCodeAction = async (
  code: string,
  language: CodeLanguageOrPlaintext,
): Promise<CodeTokenLinesPayload> => {
  return highlightCode(code, language);
};
