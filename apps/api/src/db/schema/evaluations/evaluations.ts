import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { sports } from "../sports/sports";
import { randomUUIDV7 } from "../../../lib/ids";

export const evaluations = pgTable(
  "evaluations",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    sportId: text("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    evaluatedAt: timestamp("evaluated_at").notNull(),
    recordedBy: text("recorded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("evaluations_member_id_idx").on(table.memberId),
    index("evaluations_sport_id_idx").on(table.sportId),
  ],
);
