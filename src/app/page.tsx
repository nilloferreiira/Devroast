import { EditorPanel } from "@/components/home/editor-panel";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  SectionLabelPrefix,
  SectionLabelRoot,
  SectionLabelText,
} from "@/components/ui/section-label";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableCell, TableRow } from "@/components/ui/table-row";
import { getLeaderboardRows } from "@/db/queries";
import type { LeaderboardRow } from "@/db/queries/leaderboard";
import { highlightCode } from "@/lib/highlight-code";

const editorCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }

  return total;
}`;

const MAX_CODE_SNIPPET_CHARS = 2000;

const fallbackLeaderboardRows: LeaderboardRow[] = [
  {
    rank: "#1",
    score: "2.1",
    preview: "function calculateTotal(items) { var total = 0; ...",
    lang: "javascript",
  },
  {
    rank: "#2",
    score: "2.6",
    preview: "if (user = null) { return false; } // yikes",
    lang: "typescript",
  },
  {
    rank: "#3",
    score: "2.8",
    preview: "while(true){ doWork(); } // no escape",
    lang: "python",
  },
];

export default async function HomePage() {
  const initialTokenLines = await highlightCode(editorCode, "javascript");
  let leaderboardRows: LeaderboardRow[] = fallbackLeaderboardRows;

  try {
    leaderboardRows = await getLeaderboardRows(3);
  } catch {
    leaderboardRows = fallbackLeaderboardRows;
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-0 pt-20 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h1 className="inline-flex items-center gap-3 font-mono text-4xl font-bold">
            <span className="text-accent-green">$</span>
            <span>paste your code. get roasted.</span>
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </section>

        <EditorPanel
          initialCode={editorCode}
          initialTokenLines={initialTokenLines}
          maxChars={MAX_CODE_SNIPPET_CHARS}
        />

        <section className="flex items-center justify-center gap-6 py-1 text-xs text-text-tertiary">
          <span>2,847 codes roasted</span>
          <span className="font-mono">·</span>
          <span>avg score: 4.2/10</span>
        </section>

        <section className="h-10" />

        <section className="flex flex-col gap-5 pb-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabelRoot>
              <SectionLabelPrefix />
              <SectionLabelText>shame_leaderboard</SectionLabelText>
            </SectionLabelRoot>
            <Button variant="secondary" size="sm">
              $ view_all &gt;&gt;
            </Button>
          </div>

          <p className="text-sm text-text-tertiary">
            {"// the worst code on the internet, ranked by shame"}
          </p>

          <Panel spacing="sm" className="p-0">
            <div className="flex items-center border-b border-border-primary bg-bg-elevated px-5 py-3">
              <TableCell width="rank" className="text-text-tertiary">
                rank
              </TableCell>
              <TableCell
                width="score"
                className="font-normal text-text-tertiary"
              >
                score
              </TableCell>
              <TableCell width="code" className="text-text-tertiary">
                code preview
              </TableCell>
              <TableCell width="lang" className="text-text-tertiary">
                language
              </TableCell>
            </div>

            {leaderboardRows.map((row, index) => {
              const isLast = index === leaderboardRows.length - 1;

              return (
                <TableRow
                  key={row.rank}
                  className={isLast ? "border-b-0" : undefined}
                >
                  <TableCell width="rank">{row.rank}</TableCell>
                  <TableCell width="score">{row.score}</TableCell>
                  <TableCell width="code">{row.preview}</TableCell>
                  <TableCell width="lang">{row.lang}</TableCell>
                </TableRow>
              );
            })}
          </Panel>

          <div className="flex items-center justify-center py-4">
            <StatusBadge tone="neutral">
              showing top 3 of 2,847 · view full leaderboard &gt;&gt;
            </StatusBadge>
          </div>
        </section>
      </div>
    </main>
  );
}
