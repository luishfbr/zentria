import { pgTable, text, decimal, timestamp, index } from "drizzle-orm/pg-core";
import { evaluations } from "./evaluations";
import { sportsMetrics } from "../sports/sports_metrics";
import { randomUUIDV7 } from "../../../lib/ids";

export const evaluationResults = pgTable(
  "evaluation_results",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    evaluationId: text("evaluation_id")
      .notNull()
      .references(() => evaluations.id, { onDelete: "cascade" }),
    sportMetricId: text("sport_metric_id")
      .notNull()
      .references(() => sportsMetrics.id, { onDelete: "cascade" }),
    value: decimal("value", { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("evaluation_results_evaluation_id_idx").on(table.evaluationId),
    index("evaluation_results_sport_metric_id_idx").on(table.sportMetricId),
  ],
);
