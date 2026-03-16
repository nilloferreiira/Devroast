import { getPaginatedLeaderboardSummary } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

type LeaderboardPageRequest = {
  page?: unknown;
  perPage?: unknown;
};

type NormalizedLeaderboardPageInput = {
  page: number;
};

const LEADERBOARD_PER_PAGE_CONTRACT = 20;

const toNormalizedPage = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 1 ? value : 1;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return 1;
    }

    const numericValue = Number(trimmedValue);

    return Number.isInteger(numericValue) && numericValue >= 1 ? numericValue : 1;
  }

  return 1;
};

const toLeaderboardPageRequest = (
  input: unknown,
): LeaderboardPageRequest | undefined => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return undefined;
  }

  return input as LeaderboardPageRequest;
};

const leaderboardPageInputParser = {
  _input: undefined as unknown as LeaderboardPageRequest | undefined,
  _output: undefined as unknown as NormalizedLeaderboardPageInput,
  parse: (input: unknown): NormalizedLeaderboardPageInput => {
    const request = toLeaderboardPageRequest(input);
    const { page, perPage: _ignoredClientPerPage } = request ?? {};

    return {
      page: toNormalizedPage(page),
    };
  },
};

export const leaderboardRouter = createTRPCRouter({
  page: baseProcedure
    .input(leaderboardPageInputParser)
    .query(async ({ input }) => {
      const requestedPage = input.page;

      let summary = await getPaginatedLeaderboardSummary(
        requestedPage,
        LEADERBOARD_PER_PAGE_CONTRACT,
      );

      const totalPages = Math.max(
        1,
        Math.ceil(summary.totalItems / LEADERBOARD_PER_PAGE_CONTRACT),
      );
      const page = Math.min(requestedPage, totalPages);

      if (page !== requestedPage) {
        summary = await getPaginatedLeaderboardSummary(
          page,
          LEADERBOARD_PER_PAGE_CONTRACT,
        );
      }

      return {
        rows: summary.rows.map((row) => ({
          rank: row.rank,
          score: row.score,
          lang: row.lang,
          views: row.views,
          code: row.code,
        })),
        pagination: {
          page,
          perPage: LEADERBOARD_PER_PAGE_CONTRACT,
          totalItems: summary.totalItems,
          totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
        },
      };
    }),
});
