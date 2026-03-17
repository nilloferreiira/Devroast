"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor } from "@/components/home/code-editor";
import { useCreateRoastAction } from "@/components/home/create-roast-action";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";

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
  const [language, setLanguage] =
    useState<CodeLanguageOrPlaintext>("plaintext");
  const [isRoastMode, setIsRoastMode] = useState(false);

  const submitError = createRoastMutation.error?.message;

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
        onEditorStateChange={(state) => {
          setCode(state.code);
          setLanguage(state.language);
        }}
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
            <p className="text-xs text-accent-red">
              roast failed. please retry in a few seconds.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
};
