import { relations } from "drizzle-orm";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { injuries } from "./injuries";

export const injuriesRelations = relations(injuries, ({ one }) => ({
  member: one(members, {
    fields: [injuries.memberId],
    references: [members.id],
  }),
  recordedByUser: one(users, {
    fields: [injuries.recordedBy],
    references: [users.id],
  }),
}));
