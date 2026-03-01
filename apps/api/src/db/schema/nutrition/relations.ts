import { relations } from "drizzle-orm";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { dietPlans } from "./diet_plans";
import { dietPlanItems } from "./diet_plan_items";

export const dietPlansRelations = relations(dietPlans, ({ one, many }) => ({
  member: one(members, {
    fields: [dietPlans.memberId],
    references: [members.id],
  }),
  createdByUser: one(users, {
    fields: [dietPlans.createdBy],
    references: [users.id],
  }),
  items: many(dietPlanItems),
}));

export const dietPlanItemsRelations = relations(dietPlanItems, ({ one }) => ({
  dietPlan: one(dietPlans, {
    fields: [dietPlanItems.dietPlanId],
    references: [dietPlans.id],
  }),
}));
