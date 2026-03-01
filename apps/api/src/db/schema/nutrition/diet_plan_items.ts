import { integer, pgTable, text, index } from "drizzle-orm/pg-core";
import { dietPlans } from "./diet_plans";
import { randomUUIDV7 } from "../../../lib/ids";

export const dietPlanItems = pgTable(
  "diet_plan_items",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    dietPlanId: text("diet_plan_id")
      .notNull()
      .references(() => dietPlans.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0-6
    mealType: text("meal_type").notNull(), // ex: "breakfast", "lunch", "snack", "dinner"
    content: text("content").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [index("diet_plan_items_diet_plan_id_idx").on(table.dietPlanId)],
);
