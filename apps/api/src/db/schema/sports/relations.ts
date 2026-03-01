import { relations } from "drizzle-orm";
import { organizations } from "../auth/organizations";
import { members } from "../auth/members";
import { sports } from "./sports";
import { sportsMetrics } from "./sports_metrics";
import { athleteSports } from "./athlete_sports";

export const sportsRelations = relations(sports, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sports.organizationId],
    references: [organizations.id],
  }),
  sportsMetrics: many(sportsMetrics),
  athleteSports: many(athleteSports),
}));

export const sportsMetricsRelations = relations(sportsMetrics, ({ one }) => ({
  sport: one(sports, {
    fields: [sportsMetrics.sportId],
    references: [sports.id],
  }),
}));

export const athleteSportsRelations = relations(athleteSports, ({ one }) => ({
  member: one(members, {
    fields: [athleteSports.memberId],
    references: [members.id],
  }),
  sport: one(sports, {
    fields: [athleteSports.sportId],
    references: [sports.id],
  }),
}));
