import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "../auth/organizations";
import { randomUUIDV7 } from "../../../lib/ids";

export const sports = pgTable(
  "sports",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDV7()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("sports_organization_id_slug_uidx").on(
      table.organizationId,
      table.slug,
    ),
  ],
);
