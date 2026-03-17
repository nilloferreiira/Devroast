import {
  AI_TIMEOUT_MS,
  diffLineTypeValues,
  issueSeverityValues,
  normalizeRoastAiOutput,
  roastAiRawOutputSchema,
  roastAiRequiredFieldList,
  roastCreateOutputSchema,
  roastModeValues,
  roastVerdictValues,
  type NormalizedRoastOutput,
} from "@/lib/roast-contract";

export type RoastAdapterErrorCategory =
  | "provider_timeout"
  | "provider_error"
  | "parse_error";

export class RoastAdapterError extends Error {
  public readonly category: RoastAdapterErrorCategory;
  public readonly cause: unknown;

  public constructor(
    category: RoastAdapterErrorCategory,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "RoastAdapterError";
    this.category = category;
    this.cause = cause;
  }
}

export type GeminiRoastAdapterError = RoastAdapterError;

export const mapUnknownProviderError = (
  error: unknown,
): RoastAdapterError => {
  if (error instanceof RoastAdapterError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new RoastAdapterError(
      "provider_timeout",
      "Model request timed out",
      error,
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("timed out")) {
      return new RoastAdapterError(
        "provider_timeout",
        "Model request timed out",
        error,
      );
    }

    return new RoastAdapterError("provider_error", "Model request failed", error);
  }

  return new RoastAdapterError("provider_error", "Model request failed", error);
};

const resolveToneInstruction = (roastMode: "normal" | "roast"): string => {
  return roastMode === "normal"
    ? "Use a serious and objective tone."
    : "Use a sarcastic tone while keeping feedback technically actionable.";
};

const buildGeminiPrompt = (params: {
  code: string;
  roastMode: "normal" | "roast";
  language: string;
}): string => {
  const allowedRoastModes = roastModeValues.join(", ");
  const allowedVerdicts = roastVerdictValues.join(", ");
  const allowedIssueSeverity = issueSeverityValues.join(", ");
  const allowedDiffLineTypes = diffLineTypeValues.join(", ");
  const requiredFields = roastAiRequiredFieldList.join(", ");

  return [
    "You are a strict JSON API that analyzes code quality.",
    "Respond with JSON only. Do not include markdown, code fences, or extra prose.",
    resolveToneInstruction(params.roastMode),
    `Input roast mode (must be one of: ${allowedRoastModes}): ${params.roastMode}`,
    `Language: ${params.language}`,
    "Return exactly one JSON object with required fields:",
    requiredFields,
    "Allowed enum values:",
    `- verdict: ${allowedVerdicts}`,
    `- issues[].severity: ${allowedIssueSeverity}`,
    `- diffLines[].lineType: ${allowedDiffLineTypes}`,
    "Field contract:",
    "- score: number from 0 to 10",
    "- verdict: enum value listed above",
    "- summaryQuote: short single-quote-style summary string",
    "- analysisSummary: concise paragraph string",
    "- issues: array of objects { severity, title, description }",
    "- diffLines: array of objects { lineType, content }",
    "Code to analyze:",
    params.code,
  ].join("\n");
};

const callGeminiModel = async (input: {
  prompt: string;
  timeoutMs: number;
}): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new RoastAdapterError(
      "provider_error",
      "Missing GEMINI_API_KEY environment variable",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, input.timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: "application/json",
          },
          contents: [
            {
              parts: [{ text: input.prompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const bodyText = await response.text();
      throw new RoastAdapterError(
        "provider_error",
        `Gemini request failed with status ${response.status}`,
        bodyText,
      );
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new RoastAdapterError(
        "provider_error",
        "Gemini response did not include text output",
        payload,
      );
    }

    return text;
  } catch (error) {
    throw mapUnknownProviderError(error);
  } finally {
    clearTimeout(timeout);
  }
};

const parseNormalizedOutput = (rawText: string): NormalizedRoastOutput => {
  try {
    const parsedJson: unknown = JSON.parse(rawText);
    const parsedContract = roastAiRawOutputSchema.parse(parsedJson);
    const normalized = normalizeRoastAiOutput(parsedContract);
    return roastCreateOutputSchema.parse(normalized);
  } catch (error) {
    throw new RoastAdapterError(
      "parse_error",
      "Model response could not be parsed or validated",
      error,
    );
  }
};

// Adapter safety rule: no lifecycle/event logging here (especially request IDs).
// Router/application layer owns observability and event categorization:
// - roast.create.provider_timeout
// - roast.create.provider_error
// - roast.create.parse_error
export const generateRoastAnalysis = async (
  params: {
    code: string;
    roastMode: "normal" | "roast";
    language: string;
  },
  deps?: {
    callModel: (input: { prompt: string; timeoutMs: number }) => Promise<string>;
  },
): Promise<NormalizedRoastOutput> => {
  const callModel = deps?.callModel ?? callGeminiModel;
  const prompt = buildGeminiPrompt(params);

  let rawOutput: string;

  try {
    rawOutput = await callModel({ prompt, timeoutMs: AI_TIMEOUT_MS });
  } catch (error) {
    throw mapUnknownProviderError(error);
  }

  return parseNormalizedOutput(rawOutput);
};
