import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { diffLineTypeEnum } from "@/db/schema/enums";
import { roasts } from "@/db/schema/roasts";

export const roastDiffLines = pgTable(
  "roast_diff_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roastId: uuid("roast_id")
      .notNull()
      .references(() => roasts.id, { onDelete: "cascade" }),
    lineType: diffLineTypeEnum("line_type").notNull(),
    content: text("content").notNull(),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [
    index("roast_diff_lines_roast_id_display_order_idx").on(
      table.roastId,
      table.displayOrder,
    ),
  ],
);

export type RoastDiffLine = typeof roastDiffLines.$inferSelect;
export type NewRoastDiffLine = typeof roastDiffLines.$inferInsert;
