import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { members } from "../auth/members";
import { sports } from "./sports";
import { randomUUIDV7 } from "../../../lib/ids";

export const athleteSports = pgTable(
  "athlete_sports",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    sportId: text("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("athlete_sports_member_id_sport_id_uidx").on(
      table.memberId,
      table.sportId,
    ),
  ],
);
