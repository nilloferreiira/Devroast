import Link from "next/link";
import { LeaderboardCode } from "@/components/leaderboard/leaderboard-code";
import { CodeBlockDisplay } from "@/components/ui/code-block";
import { Panel } from "@/components/ui/panel";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type LeaderboardPageProps = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

const LEADERBOARD_PER_PAGE = 20;

const toSingleValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const toPositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = toPositiveInt(toSingleValue(resolvedSearchParams?.page), 1);
  const requestedPerPage = toPositiveInt(
    toSingleValue(resolvedSearchParams?.perPage),
    LEADERBOARD_PER_PAGE,
  );
  const perPage =
    requestedPerPage === LEADERBOARD_PER_PAGE
      ? requestedPerPage
      : LEADERBOARD_PER_PAGE;
  const { rows, pagination } = await caller.leaderboard.page({ page, perPage });

  const codeBlocks = await Promise.all(
    rows.map((row) =>
      CodeBlockDisplay({
        code: row.code,
        lang: row.lang,
        withLineNumbers: true,
        className: "border-0 bg-bg-surface px-5 py-4",
      }),
    ),
  );

  const perPageParam = pagination.perPage;
  const previousHref = `?page=${Math.max(1, pagination.page - 1)}&perPage=${perPageParam}`;
  const nextHref = `?page=${Math.max(1, pagination.page + 1)}&perPage=${perPageParam}`;

  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-14 pt-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="flex w-full flex-col gap-4">
          <h1 className="inline-flex items-center gap-3 font-mono text-[28px] font-bold leading-none md:text-[32px]">
            <span className="text-accent-green">&gt;</span>
            <span>shame_leaderboard</span>
          </h1>

          <p className="font-mono text-sm text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>

          <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
            <span>{`${pagination.totalItems.toLocaleString()} submissions`}</span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5">
          {rows.length === 0 ? (
            <Panel className="flex min-h-44 items-center justify-center px-6 py-8 text-center font-mono text-sm text-text-tertiary">
              no entries yet. be the first to get roasted.
            </Panel>
          ) : (
            rows.map((row, index) => (
              <Panel
                key={`${row.rank}-${row.lang}-${row.code.slice(0, 16)}`}
                className="overflow-hidden p-0"
              >
                <div className="flex h-12 items-center justify-between border-b border-border-primary px-5 font-mono text-xs">
                  <div className="flex items-center gap-6">
                    <span className="text-text-tertiary">{row.rank}</span>
                    <span className="font-bold text-accent-red">
                      {row.score}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-text-tertiary">
                    <span>{row.lang}</span>
                    <span>{row.views}</span>
                  </div>
                </div>

                <LeaderboardCode canExpand={row.code.includes("\n")}>
                  {codeBlocks[index]}
                </LeaderboardCode>
              </Panel>
            ))
          )}

          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-border-primary bg-bg-surface px-4 py-3 font-mono text-xs text-text-secondary">
            {pagination.hasPrev ? (
              <Link
                href={previousHref}
                className="inline-flex items-center text-accent-cyan transition-colors hover:text-text-primary"
              >
                previous
              </Link>
            ) : (
              <span className="inline-flex items-center text-text-muted">
                previous
              </span>
            )}

            <span>{`page ${pagination.page} of ${pagination.totalPages}`}</span>

            {pagination.hasNext ? (
              <Link
                href={nextHref}
                className="inline-flex items-center text-accent-cyan transition-colors hover:text-text-primary"
              >
                next
              </Link>
            ) : (
              <span className="inline-flex items-center text-text-muted">
                next
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
