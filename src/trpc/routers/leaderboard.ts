import { getPaginatedLeaderboardSummary } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const LEADERBOARD_PER_PAGE = 20;

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

const toPaginationInput = (input: unknown): { page?: unknown; perPage?: unknown } => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return input as { page?: unknown; perPage?: unknown };
};

export const leaderboardRouter = createTRPCRouter({
  page: baseProcedure
    .input((input: unknown) => input)
    .query(async ({ input }) => {
      const parsedInput = toPaginationInput(input);
      const requestedPage = toNormalizedPage(parsedInput.page);

      let summary = await getPaginatedLeaderboardSummary(
        requestedPage,
        LEADERBOARD_PER_PAGE,
      );

      const totalPages = Math.max(
        1,
        Math.ceil(summary.totalItems / LEADERBOARD_PER_PAGE),
      );
      const page = Math.min(requestedPage, totalPages);

      if (page !== requestedPage) {
        summary = await getPaginatedLeaderboardSummary(page, LEADERBOARD_PER_PAGE);
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
          perPage: LEADERBOARD_PER_PAGE,
          totalItems: summary.totalItems,
          totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
        },
      };
    }),
});
