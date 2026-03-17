"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CodeEditor } from "@/components/home/code-editor";
import { useCreateRoastAction } from "@/components/home/create-roast-action";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";
import { detectLanguage } from "@/lib/detect-language";

type EditorPanelProps = {
  initialCode: string;
  initialTokenLines: CodeTokenLinesPayload;
  maxChars: number;
};

export const EditorPanel = ({
  initialCode,
  initialTokenLines,
  maxChars,
}: EditorPanelProps) => {
  const router = useRouter();
  const createRoastMutation = useCreateRoastAction();
  const [isOverLimit, setIsOverLimit] = useState(initialCode.length > maxChars);
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<CodeLanguageOrPlaintext>(() =>
    detectLanguage(initialCode),
  );
  const [isRoastMode, setIsRoastMode] = useState(false);

  const submitErrorCode =
    createRoastMutation.error && "data" in createRoastMutation.error
      ? (createRoastMutation.error.data?.code ?? null)
      : null;
  const submitError =
    submitErrorCode === "BAD_REQUEST"
      ? "input looks invalid. please review your code and try again."
      : createRoastMutation.error
        ? "roast failed. please retry in a few seconds."
        : null;

  const handleEditorStateChange = useCallback(
    (state: { code: string; language: CodeLanguageOrPlaintext }) => {
      setCode(state.code);
      setLanguage(state.language);
    },
    [],
  );

  const handleSubmit = () => {
    if (isOverLimit || createRoastMutation.isPending) {
      return;
    }

    createRoastMutation.mutate(
      {
        code,
        roastMode: isRoastMode ? "roast" : "normal",
        language,
      },
      {
        onSuccess: ({ roastId }) => {
          router.push(`/roast/${roastId}`);
        },
      },
    );
  };

  return (
    <>
      <CodeEditor
        initialCode={initialCode}
        initialTokenLines={initialTokenLines}
        maxChars={maxChars}
        onLimitChange={setIsOverLimit}
        onEditorStateChange={handleEditorStateChange}
      />

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle
            label="roast mode"
            checked={isRoastMode}
            onCheckedChange={setIsRoastMode}
            disabled={createRoastMutation.isPending}
          />
          <p className="text-xs text-text-tertiary">
            {isRoastMode
              ? "// maximum sarcasm enabled"
              : "// normal mode enabled"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button
            variant="submit"
            size="md"
            disabled={isOverLimit || createRoastMutation.isPending}
            onClick={handleSubmit}
          >
            {createRoastMutation.isPending
              ? "$ roasting..."
              : "$ roast_my_code"}
          </Button>

          {submitError ? (
            <p className="text-xs text-accent-red">{submitError}</p>
          ) : null}
        </div>
      </section>
    </>
  );
};
