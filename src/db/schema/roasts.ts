import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { roastStatusEnum, roastVerdictEnum } from "@/db/schema/enums";
import { submissions } from "@/db/schema/submissions";

export const roasts = pgTable(
  "roasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    status: roastStatusEnum("status").notNull(),
    score: numeric("score", { precision: 3, scale: 1 }),
    verdict: roastVerdictEnum("verdict"),
    summaryQuote: text("summary_quote"),
    analysisSummary: text("analysis_summary"),
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    uniqueIndex("roasts_submission_id_unique_idx").on(table.submissionId),
    index("roasts_leaderboard_idx").on(table.score, table.completedAt),
  ],
);

export type Roast = typeof roasts.$inferSelect;
export type NewRoast = typeof roasts.$inferInsert;
