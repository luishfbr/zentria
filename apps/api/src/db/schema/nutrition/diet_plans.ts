import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { randomUUIDV7 } from "../../../lib/ids";

export const dietPlans = pgTable(
  "diet_plans",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    validFrom: timestamp("valid_from").notNull(),
    validTo: timestamp("valid_to"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [index("diet_plans_member_id_idx").on(table.memberId)],
);
