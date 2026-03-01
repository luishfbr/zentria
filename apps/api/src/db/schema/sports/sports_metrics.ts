import { integer, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { sports } from "./sports";
import { randomUUIDV7 } from "../../../lib/ids";

export const sportsMetrics = pgTable(
  "sports_metrics",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    sportId: text("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    unit: text("unit"),
    type: text("type").notNull(), // ex: "number", "time"
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [index("sports_metrics_sport_id_idx").on(table.sportId)],
);
