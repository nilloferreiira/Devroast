import { HomeShameLeaderboardCode } from "@/components/home/home-shame-leaderboard-code";
import { CodeBlockDisplay } from "@/components/ui/code-block";
import { Panel } from "@/components/ui/panel";
import {
  SectionLabelPrefix,
  SectionLabelRoot,
  SectionLabelText,
} from "@/components/ui/section-label";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableCell, TableRow } from "@/components/ui/table-row";
import { caller } from "@/trpc/server";

export const HomeShameLeaderboardContent = async () => {
  const { rows, totalRoasts } = await caller.homepageLeaderboard.summary();

  const codeBlocks = await Promise.all(
    rows.map((row) =>
      CodeBlockDisplay({
        code: row.code,
        lang: row.lang,
        withLineNumbers: true,
        className:
          "max-h-[520px] border border-border-primary bg-bg-surface px-4 py-3",
      }),
    ),
  );

  return (
    <section className="flex flex-col gap-5 pb-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabelRoot>
          <SectionLabelPrefix />
          <SectionLabelText>shame_leaderboard</SectionLabelText>
        </SectionLabelRoot>
      </div>

      <p className="text-sm text-text-tertiary">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      <Panel spacing="sm" className="p-0">
        <div className="flex items-center border-b border-border-primary bg-bg-elevated px-5 py-3">
          <TableCell width="rank" className="text-text-tertiary">
            rank
          </TableCell>
          <TableCell width="score" className="font-normal text-text-tertiary">
            score
          </TableCell>
          <TableCell width="code" className="text-text-tertiary">
            code
          </TableCell>
          <TableCell width="lang" className="text-text-tertiary">
            language
          </TableCell>
        </div>

        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;

          return (
            <TableRow
              key={row.rank}
              className={isLast ? "border-b-0" : undefined}
            >
              <TableCell width="rank" className="self-start pt-1">
                {row.rank}
              </TableCell>
              <TableCell width="score" className="self-start pt-1">
                {row.score}
              </TableCell>
              <TableCell width="code" className="min-w-0">
                <HomeShameLeaderboardCode>
                  {codeBlocks[index]}
                </HomeShameLeaderboardCode>
              </TableCell>
              <TableCell width="lang" className="self-start pt-1">
                {row.lang}
              </TableCell>
            </TableRow>
          );
        })}
      </Panel>

      <div className="flex items-center justify-center py-4">
        <StatusBadge tone="neutral">
          {`showing top 3 of ${totalRoasts.toLocaleString()} · view full leaderboard >>`}
        </StatusBadge>
      </div>
    </section>
  );
};
