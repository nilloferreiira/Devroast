"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeBlockHeader, CodeBlockRoot } from "@/components/ui/code-block";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import {
  type CodeLanguage,
  type CodeLanguageOrPlaintext,
  codeLanguageItems,
} from "@/lib/code-languages";
import { detectLanguage } from "@/lib/detect-language";
import { highlightCodeAction } from "./highlight-code-action";

type CodeEditorProps = {
  initialCode: string;
  initialTokenLines: CodeTokenLinesPayload;
  maxChars: number;
  onLimitChange?: (isOverLimit: boolean) => void;
  onEditorStateChange?: (state: {
    code: string;
    language: CodeLanguageOrPlaintext;
  }) => void;
};

const insertAtCursor = (
  target: HTMLTextAreaElement,
  insertion: string,
): number => {
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const nextValue =
    target.value.slice(0, start) + insertion + target.value.slice(end);
  target.value = nextValue;
  const nextCursor = start + insertion.length;
  target.selectionStart = nextCursor;
  target.selectionEnd = nextCursor;

  return nextCursor;
};

const getLineIndent = (content: string, cursor: number) => {
  const before = content.slice(0, cursor);
  const lineStartIndex = before.lastIndexOf("\n") + 1;
  const currentLine = content.slice(lineStartIndex).split("\n")[0] ?? "";
  const indent = currentLine.match(/^\s*/)?.[0] ?? "";

  return indent;
};

export const CodeEditor = ({
  initialCode,
  initialTokenLines,
  maxChars,
  onLimitChange,
  onEditorStateChange,
}: CodeEditorProps) => {
  const highlightRef = useRef<HTMLPreElement>(null);
  const [code, setCode] = useState(initialCode);
  const [languageMode, setLanguageMode] = useState<"auto" | "manual">("auto");
  const [manualLanguage, setManualLanguage] = useState<CodeLanguage | null>(
    null,
  );
  const [detectedLanguage, setDetectedLanguage] =
    useState<CodeLanguageOrPlaintext>(detectLanguage(initialCode));
  const [tokenLines, setTokenLines] =
    useState<CodeTokenLinesPayload>(initialTokenLines);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const latestHighlightRequest = useRef(0);

  const effectiveLanguage = useMemo<CodeLanguageOrPlaintext>(() => {
    if (languageMode === "manual" && manualLanguage) {
      return manualLanguage;
    }

    return detectedLanguage;
  }, [detectedLanguage, languageMode, manualLanguage]);

  const selectedLanguageValue =
    languageMode === "auto"
      ? detectedLanguage
      : (manualLanguage ?? detectedLanguage);
  const characterCount = code.length;
  const isOverLimit = characterCount > maxChars;

  const requestHighlight = useCallback(
    async (nextCode: string, nextLanguage: CodeLanguageOrPlaintext) => {
      latestHighlightRequest.current += 1;
      const requestId = latestHighlightRequest.current;
      setIsHighlighting(true);

      const nextTokenLines = await highlightCodeAction(nextCode, nextLanguage);

      if (requestId !== latestHighlightRequest.current) {
        return;
      }

      setTokenLines(nextTokenLines);
      setIsHighlighting(false);
    },
    [],
  );

  useEffect(() => {
    if (languageMode !== "auto") {
      return;
    }

    const nextDetectedLanguage = detectLanguage(code);
    setDetectedLanguage(nextDetectedLanguage);
    requestHighlight(code, nextDetectedLanguage);
  }, [code, languageMode, requestHighlight]);

  useEffect(() => {
    if (languageMode === "auto") {
      return;
    }

    requestHighlight(code, effectiveLanguage);
  }, [code, effectiveLanguage, languageMode, requestHighlight]);

  useEffect(() => {
    onLimitChange?.(isOverLimit);
  }, [isOverLimit, onLimitChange]);

  useEffect(() => {
    onEditorStateChange?.({
      code,
      language: effectiveLanguage,
    });
  }, [code, effectiveLanguage, onEditorStateChange]);

  return (
    <CodeBlockRoot>
      <CodeBlockHeader>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <select
                id="code-language-select"
                value={selectedLanguageValue}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (nextValue === "auto") {
                    setLanguageMode("auto");
                    setManualLanguage(null);
                    return;
                  }

                  setLanguageMode("manual");
                  const nextManualLanguage = nextValue as CodeLanguage;
                  setManualLanguage(nextManualLanguage);
                }}
                className="inline-flex h-8 min-w-37 appearance-none items-center justify-between border border-border-primary bg-bg-elevated py-0 pl-2.5 pr-7 font-mono text-[11px] text-text-primary outline-none transition-colors hover:border-border-secondary focus:border-border-secondary"
              >
                <option value="auto">Auto detect</option>

                {codeLanguageItems.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-text-secondary">
                ▾
              </span>
            </div>
          </div>
        </div>
      </CodeBlockHeader>

      <div className="relative min-h-70 bg-bg-surface">
        <pre
          ref={highlightRef}
          className="pointer-events-none absolute inset-0 overflow-auto p-4 font-mono text-[13px] leading-6"
          aria-hidden
        >
          {tokenLines.tokens.map((line, lineIndex) => {
            const lineNumber = lineIndex + 1;

            return (
              <div key={lineNumber}>
                {line.length === 0 ? " " : null}
                {line.map((token) => (
                  <span
                    key={`${lineNumber}-${token.offset}`}
                    style={token.color ? { color: token.color } : undefined}
                  >
                    {token.content}
                  </span>
                ))}
              </div>
            );
          })}
        </pre>

        <textarea
          value={code}
          onChange={(event) => {
            const nextCode = event.target.value;

            setCode(nextCode);
          }}
          onPaste={(event) => {
            const pastedText = event.clipboardData.getData("text");

            if (!pastedText) {
              return;
            }

            event.preventDefault();
            const nextTarget = event.currentTarget;
            insertAtCursor(nextTarget, pastedText);
            const nextCode = nextTarget.value;
            setCode(nextCode);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Tab") {
              event.preventDefault();
              const nextTarget = event.currentTarget;
              insertAtCursor(nextTarget, "  ");
              setCode(nextTarget.value);
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const nextTarget = event.currentTarget;
              const indent = getLineIndent(
                nextTarget.value,
                nextTarget.selectionStart,
              );
              insertAtCursor(nextTarget, `\n${indent}`);
              setCode(nextTarget.value);
            }
          }}
          onScroll={(event) => {
            if (!highlightRef.current) {
              return;
            }

            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
          spellCheck={false}
          wrap="off"
          className="relative z-10 min-h-70 w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-6 text-transparent caret-text-primary outline-none placeholder:text-text-tertiary selection:bg-accent-green/30"
          placeholder="Paste your code here..."
        />

        {isHighlighting ? (
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 border-r border-t border-border-primary bg-bg-surface/90 px-3 py-1.5 font-mono text-[11px] text-text-tertiary">
            updating highlight...
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 border-l border-t border-border-primary bg-bg-surface/90 px-3 py-1.5 font-mono text-[11px] text-text-tertiary">
          <span className={isOverLimit ? "text-accent-red" : undefined}>
            {characterCount} / {maxChars}
          </span>
        </div>
      </div>
    </CodeBlockRoot>
  );
};
