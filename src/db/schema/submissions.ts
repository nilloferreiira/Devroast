import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { codeLanguageEnum, roastModeEnum } from "@/db/schema/enums";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceCode: text("source_code").notNull(),
  language: codeLanguageEnum("language").notNull(),
  roastMode: roastModeEnum("roast_mode").notNull(),
  lineCount: integer("line_count").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
