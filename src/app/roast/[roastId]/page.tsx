import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CodeBlockDisplay } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { Panel } from "@/components/ui/panel";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  SectionLabelPrefix,
  SectionLabelRoot,
  SectionLabelText,
} from "@/components/ui/section-label";
import { StatusBadge } from "@/components/ui/status-badge";

type RoastResultPageProps = {
  params: Promise<{
    roastId: string;
  }>;
};

type AnalysisCard = {
  title: string;
  tone: "critical" | "warning" | "good";
  description: string;
  suggestion: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const submittedCode = `function quickSort(arr) {
  let left = []
  let right = []
  let pivot = arr[0]

  if (arr.length <= 1) {
    return "doesn't work"
  }

  // this avoids the optimization
  // and leaks memory sometimes

  return void;
}`;

const analysisCards: AnalysisCard[] = [
  {
    title: "critical",
    tone: "critical",
    description:
      "This function returns mixed and invalid types, which makes runtime behavior unreliable.",
    suggestion:
      "Always return the same value shape and avoid impossible branches.",
  },
  {
    title: "warning",
    tone: "warning",
    description:
      "Recursive setup is incomplete: partition arrays are declared but never populated.",
    suggestion:
      "Iterate through input and push each item into left/right before recursive calls.",
  },
  {
    title: "good",
    tone: "good",
    description:
      "The base case exists and prevents infinite recursion for short arrays.",
    suggestion:
      "Keep this guard and add explicit typing for stronger guarantees.",
  },
  {
    title: "style",
    tone: "warning",
    description:
      "Comments explain symptoms but not intent, making future maintenance harder.",
    suggestion: "Prefer concise comments that state why a decision exists.",
  },
];

export default async function RoastResultPage({
  params,
}: RoastResultPageProps) {
  const { roastId } = await params;

  if (!uuidPattern.test(roastId)) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-14 pt-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10">
        <section
          aria-label={`roast result ${roastId}`}
          className="flex flex-col gap-8 lg:flex-row lg:items-center"
        >
          <div className="flex justify-center lg:justify-start">
            <ScoreRing score={3.5} />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <StatusBadge tone="critical">
              verdict: needs_serious_help
            </StatusBadge>

            <p className="font-mono text-base leading-relaxed text-text-primary md:text-xl">
              {
                '"this code looks like it was written during a power outage... in 2005."'
              }
            </p>

            <div className="flex items-center gap-3 font-mono text-xs text-text-tertiary">
              <span>lang: javascript</span>
              <span>·</span>
              <span>7 lines</span>
            </div>

            <div>
              <Button variant="secondary" size="sm">
                $ share_result
              </Button>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-4">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>your_submission</SectionLabelText>
          </SectionLabelRoot>

          <Panel className="overflow-hidden p-0">
            <CodeBlockDisplay
              code={submittedCode}
              lang="javascript"
              withLineNumbers
              className="min-h-[360px] border-0 px-4 py-4"
            />
          </Panel>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>detailed_analysis</SectionLabelText>
          </SectionLabelRoot>

          <div className="grid gap-5 md:grid-cols-2">
            {analysisCards.map((card) => (
              <Panel
                key={card.title}
                className="flex h-full flex-col gap-3 p-5"
              >
                <StatusBadge tone={card.tone}>{card.title}</StatusBadge>
                <p className="text-sm text-text-secondary">
                  {card.description}
                </p>
                <p className="font-mono text-xs text-text-tertiary">
                  {`suggestion: ${card.suggestion}`}
                </p>
              </Panel>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>suggested_fix</SectionLabelText>
          </SectionLabelRoot>

          <Panel className="overflow-hidden p-0">
            <div className="flex h-10 items-center border-b border-border-primary px-4 font-mono text-xs text-text-secondary">
              your_code.ts -&gt; improved_code.ts
            </div>

            <div className="py-1">
              <DiffLine
                tone="context"
                code="function quickSort(arr) {"
                className="h-7"
              />
              <DiffLine tone="removed" code="  let left = []" className="h-7" />
              <DiffLine
                tone="removed"
                code="  let right = []"
                className="h-7"
              />
              <DiffLine
                tone="removed"
                code={'  if (arr.length <= 1) return "doesn\'t work"'}
                className="h-7"
              />
              <DiffLine
                tone="added"
                code="  const left = []; const right = [];"
                className="h-7"
              />
              <DiffLine
                tone="added"
                code="  if (arr.length <= 1) return arr;"
                className="h-7"
              />
              <DiffLine tone="context" code="}" className="h-7" />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
