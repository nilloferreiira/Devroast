import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import {
  getRoastById,
  getRoastDiffLines,
  getRoastIssues,
} from "@/db/queries/roasts";
import { getBaseUrl } from "@/lib/get-base-url";

type RoastResultPageProps = {
  params: Promise<{
    roastId: string;
  }>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveVerdictTone = (verdict: string | null) => {
  if (verdict === "needs_serious_help") {
    return "critical" as const;
  }

  if (verdict === "needs_work" || verdict === "not_great") {
    return "warning" as const;
  }

  if (verdict === "decent" || verdict === "clean") {
    return "good" as const;
  }

  return "neutral" as const;
};

export async function generateMetadata({
  params,
}: RoastResultPageProps): Promise<Metadata> {
  const { roastId } = await params;

  if (!uuidPattern.test(roastId)) return {};

  const roast = await getRoastById(roastId);

  if (!roast || roast.status !== "completed") return {};

  const score = Number(roast.score ?? 0);
  const title = `DevRoast: ${score}/10 — ${roast.verdict ?? "unknown"}`;
  const description = roast.summaryQuote ?? "Code has been roasted.";
  const ogImageUrl = `${getBaseUrl()}/api/og/${roastId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function RoastResultPage({
  params,
}: RoastResultPageProps) {
  const { roastId } = await params;

  if (!uuidPattern.test(roastId)) {
    notFound();
  }

  const roast = await getRoastById(roastId);

  if (!roast) {
    notFound();
  }

  if (roast.status !== "completed") {
    notFound();
  }

  const [issues, diffLines] = await Promise.all([
    getRoastIssues(roast.roastId),
    getRoastDiffLines(roast.roastId),
  ]);

  const sourceLineCount = roast.sourceCode.split(/\r?\n/).length;
  const score = Number(roast.score ?? 0);
  const verdictLabel = roast.verdict ?? "unknown";
  const verdictTone = resolveVerdictTone(roast.verdict);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-14 pt-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section
          aria-label={`roast result ${roastId}`}
          className="flex flex-col gap-8 lg:flex-row lg:items-center"
        >
          <div className="flex justify-center lg:justify-start">
            <ScoreRing score={score} />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <StatusBadge
              tone={verdictTone}
            >{`verdict: ${verdictLabel}`}</StatusBadge>

            <p className="font-mono text-base leading-relaxed text-text-primary md:text-xl">
              {`"${roast.summaryQuote}"`}
            </p>

            <div className="flex items-center gap-3 font-mono text-xs text-text-tertiary">
              <span>{`lang: ${roast.language}`}</span>
              <span>·</span>
              <span>{`${sourceLineCount} lines`}</span>
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
              code={roast.sourceCode}
              lang={roast.language}
              withLineNumbers
              className="min-h-90 border-0 px-4 py-4"
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
            <Panel className="flex h-full flex-col gap-3 p-5 md:col-span-2">
              <StatusBadge tone="neutral">summary</StatusBadge>
              <p className="text-sm text-text-secondary">
                {roast.analysisSummary}
              </p>
            </Panel>

            {issues.map((issue) => (
              <Panel key={issue.id} className="flex h-full flex-col gap-3 p-5">
                <StatusBadge tone={issue.severity}>
                  {issue.severity}
                </StatusBadge>
                <p className="font-mono text-xs text-text-primary">
                  {issue.title}
                </p>
                <p className="text-sm text-text-secondary">
                  {issue.description}
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
              {diffLines.map((line) => (
                <DiffLine
                  key={line.id}
                  tone={line.lineType}
                  code={line.content}
                  className="h-7"
                />
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
