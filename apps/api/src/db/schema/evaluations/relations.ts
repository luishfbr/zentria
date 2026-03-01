import { relations } from "drizzle-orm";
import { members } from "../auth/members";
import { users } from "../auth/users";
import { sports } from "../sports/sports";
import { sportsMetrics } from "../sports/sports_metrics";
import { evaluations } from "./evaluations";
import { evaluationResults } from "./evaluation_results";

export const evaluationsRelations = relations(evaluations, ({ one, many }) => ({
  member: one(members, {
    fields: [evaluations.memberId],
    references: [members.id],
  }),
  sport: one(sports, {
    fields: [evaluations.sportId],
    references: [sports.id],
  }),
  recordedByUser: one(users, {
    fields: [evaluations.recordedBy],
    references: [users.id],
  }),
  results: many(evaluationResults),
}));

export const evaluationResultsRelations = relations(
  evaluationResults,
  ({ one }) => ({
    evaluation: one(evaluations, {
      fields: [evaluationResults.evaluationId],
      references: [evaluations.id],
    }),
    sportMetric: one(sportsMetrics, {
      fields: [evaluationResults.sportMetricId],
      references: [sportsMetrics.id],
    }),
  }),
);
