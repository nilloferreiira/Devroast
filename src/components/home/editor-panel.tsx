"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/home/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";

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
  const [isOverLimit, setIsOverLimit] = useState(initialCode.length > maxChars);

  return (
    <>
      <CodeEditor
        initialCode={initialCode}
        initialTokenLines={initialTokenLines}
        maxChars={maxChars}
        onLimitChange={setIsOverLimit}
      />

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle label="roast mode" defaultChecked />
          <p className="text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </p>
        </div>

        <Button variant="submit" size="md" disabled={isOverLimit}>
          $ roast_my_code
        </Button>
      </section>
    </>
  );
};
