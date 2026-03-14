import { Button } from "@/components/ui/button";
import {
  CodeBlockDisplay,
  CodeBlockHeader,
  CodeBlockRoot,
} from "@/components/ui/code-block";
import {
  DiffLine,
  DiffLineCode,
  DiffLinePrefix,
  DiffLineRoot,
} from "@/components/ui/diff-line";
import { Panel } from "@/components/ui/panel";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  SectionLabelPrefix,
  SectionLabelRoot,
  SectionLabelText,
} from "@/components/ui/section-label";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableCell, TableRow } from "@/components/ui/table-row";
import { Toggle } from "@/components/ui/toggle";

const buttonVariants = ["submit", "secondary", "ghost"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const sampleCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }

  return total;
}`;

export default async function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page px-6 py-10 text-text-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-green">
            UI Kit
          </p>
          <h1 className="text-3xl font-semibold">Components</h1>
          <p className="text-sm text-text-secondary">
            Generic and reusable components based on the Pencil library screen.
          </p>
        </header>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>buttons</SectionLabelText>
          </SectionLabelRoot>
          <div className="grid gap-3 sm:grid-cols-3">
            {buttonVariants.map((variant) => (
              <Panel key={variant}>
                <p className="mb-4 font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {variant}
                </p>
                <Button variant={variant}>$ roast_my_code</Button>
              </Panel>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {buttonSizes.map((size) => (
              <Panel key={size}>
                <p className="mb-4 font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {size}
                </p>
                <Button size={size}>$ roast_my_code</Button>
              </Panel>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>toggle</SectionLabelText>
          </SectionLabelRoot>
          <Panel className="flex flex-wrap items-center gap-8">
            <Toggle label="roast mode" defaultChecked />
            <Toggle label="roast mode" />
          </Panel>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>badge_status</SectionLabelText>
          </SectionLabelRoot>
          <Panel className="flex flex-wrap items-center gap-6">
            <StatusBadge tone="critical">critical</StatusBadge>
            <StatusBadge tone="warning">warning</StatusBadge>
            <StatusBadge tone="good">good</StatusBadge>
            <StatusBadge tone="critical">needs_serious_help</StatusBadge>
          </Panel>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>code_block</SectionLabelText>
          </SectionLabelRoot>
          <CodeBlockRoot>
            <CodeBlockHeader>calculate.js</CodeBlockHeader>
            <CodeBlockDisplay
              code={sampleCode}
              lang="javascript"
              withLineNumbers
            />
          </CodeBlockRoot>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>diff_line</SectionLabelText>
          </SectionLabelRoot>
          <div className="overflow-hidden border border-border-primary bg-bg-surface">
            <DiffLine tone="removed" code="var total = 0;" />
            <DiffLineRoot tone="added">
              <DiffLinePrefix tone="added" />
              <DiffLineCode>const total = 0;</DiffLineCode>
            </DiffLineRoot>
            <DiffLine
              tone="context"
              code="for (let i = 0; i < items.length; i++) {"
            />
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>score_ring</SectionLabelText>
          </SectionLabelRoot>
          <Panel className="inline-flex w-fit items-center justify-center">
            <ScoreRing score={3.5} />
          </Panel>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabelRoot>
            <SectionLabelPrefix />
            <SectionLabelText>table_row</SectionLabelText>
          </SectionLabelRoot>
          <Panel spacing="sm" className="p-0">
            <TableRow>
              <TableCell width="rank">#1</TableCell>
              <TableCell width="score">2.1</TableCell>
              <TableCell width="code">
                function calculateTotal(items) {"{"} var total = 0; ...
              </TableCell>
              <TableCell width="lang">javascript</TableCell>
            </TableRow>
          </Panel>
        </section>
      </div>
    </main>
  );
}
