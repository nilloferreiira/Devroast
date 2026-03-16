import { codeToTokens } from "shiki";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";

const toPlainTokenLines = (
  payload: Awaited<ReturnType<typeof codeToTokens>>,
): CodeTokenLinesPayload => {
  return {
    tokens: payload.tokens.map((line) =>
      line.map((token) => ({
        content: token.content,
        offset: token.offset,
        color: token.color,
      })),
    ),
  };
};

export const highlightCode = async (
  code: string,
  language: CodeLanguageOrPlaintext,
): Promise<CodeTokenLinesPayload> => {
  if (language === "plaintext") {
    return {
      tokens: code.split("\n").map((line) => [
        {
          content: line,
          offset: 0,
        },
      ]),
    };
  }

  try {
    const payload = await codeToTokens(code, {
      lang: language,
      theme: "vesper",
    });

    return toPlainTokenLines(payload);
  } catch {
    return {
      tokens: code.split("\n").map((line) => [
        {
          content: line,
          offset: 0,
        },
      ]),
    };
  }
};
