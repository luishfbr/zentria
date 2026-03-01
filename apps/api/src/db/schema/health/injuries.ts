import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { randomUUIDV7 } from "../../../lib/ids";

export const injuries = pgTable(
  "injuries",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    status: text("status").notNull(), // ex: "active", "recovered", "chronic"
    fromDate: timestamp("from_date").notNull(),
    toDate: timestamp("to_date"),
    recordedBy: text("recorded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("injuries_member_id_idx").on(table.memberId),
    index("injuries_status_idx").on(table.status),
  ],
);
