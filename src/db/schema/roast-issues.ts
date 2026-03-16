import {
  index,
  integer,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { issueSeverityEnum } from "@/db/schema/enums";
import { roasts } from "@/db/schema/roasts";

export const roastIssues = pgTable(
  "roast_issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roastId: uuid("roast_id")
      .notNull()
      .references(() => roasts.id, { onDelete: "cascade" }),
    severity: issueSeverityEnum("severity").notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description").notNull(),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [
    index("roast_issues_roast_id_display_order_idx").on(
      table.roastId,
      table.displayOrder,
    ),
  ],
);

export type RoastIssue = typeof roastIssues.$inferSelect;
export type NewRoastIssue = typeof roastIssues.$inferInsert;
