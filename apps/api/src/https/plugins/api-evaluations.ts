import Elysia, { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { evaluations, evaluationResults } from "../../db/schema/evaluations";
import { sportsMetrics } from "../../db/schema/sports";
import { athleteSports } from "../../db/schema/sports";
import { members } from "../../db/schema/auth";
import { canAccessMember, requireRole } from "../../lib/org-access";
import type { ApiContextAdd } from "./api-guard";

export const apiEvaluations = new Elysia({
  name: "api-evaluations",
  detail: { tags: ["Evaluations"] },
})
  .get(
    "/members/:memberId/evaluations",
    async (ctx) => {
      const { params, query, member, organizationId, status } = ctx as typeof ctx & ApiContextAdd;
      const { memberId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const conditions = [eq(evaluations.memberId, memberId)];
      if (query.sportId) {
        conditions.push(eq(evaluations.sportId, query.sportId));
      }
      const rows = await db
        .select()
        .from(evaluations)
        .where(and(...conditions));
      return rows;
    },
    {
      query: t.Object({
        sportId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/members/:memberId/evaluations",
    async (ctx) => {
      const { params, body, session, member, organizationId, status } = ctx as typeof ctx & ApiContextAdd;
      const { memberId } = params;
      const canCreateForOther = requireRole(member, ["coach", "admin", "superadmin"]);
      if (member.id !== memberId && !canCreateForOther) {
        return status(403, { message: "Forbidden" });
      }
      const [orgMember] = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.id, memberId),
            eq(members.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!orgMember) return status(404, { message: "Member not found" });
      const [athleteSport] = await db
        .select()
        .from(athleteSports)
        .where(
          and(
            eq(athleteSports.memberId, memberId),
            eq(athleteSports.sportId, body.sportId)
          )
        )
        .limit(1);
      if (!athleteSport) {
        return status(400, { message: "Member is not enrolled in this sport" });
      }
      const now = new Date();
      const evaluatedAt = body.evaluatedAt ? new Date(body.evaluatedAt) : now;
      const [evalRow] = await db
        .insert(evaluations)
        .values({
          memberId,
          sportId: body.sportId,
          evaluatedAt,
          recordedBy: session.user.id,
          createdAt: now,
        })
        .returning();
      if (!evalRow) return status(500, { message: "Insert failed" });
      if (body.results && body.results.length > 0) {
        const resultNow = new Date();
        await db.insert(evaluationResults).values(
          body.results.map((r: { sportMetricId: string; value: string }) => ({
            evaluationId: evalRow.id,
            sportMetricId: r.sportMetricId,
            value: r.value,
            createdAt: resultNow,
          }))
        );
      }
      const withResults = await db
        .select()
        .from(evaluationResults)
        .where(eq(evaluationResults.evaluationId, evalRow.id));
      return { ...evalRow, results: withResults };
    },
    {
      body: t.Object({
        sportId: t.String(),
        evaluatedAt: t.Optional(t.String()),
        results: t.Optional(
          t.Array(
            t.Object({
              sportMetricId: t.String(),
              value: t.String(),
            })
          )
        ),
      }),
    }
  )
  .get(
    "/members/:memberId/evaluations/:evaluationId",
    async (ctx) => {
      const { params, member, status } = ctx as typeof ctx & ApiContextAdd;
      const { memberId, evaluationId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [evalRow] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, evaluationId),
            eq(evaluations.memberId, memberId)
          )
        )
        .limit(1);
      if (!evalRow) return status(404, { message: "Not found" });
      const results = await db
        .select({
          id: evaluationResults.id,
          evaluationId: evaluationResults.evaluationId,
          sportMetricId: evaluationResults.sportMetricId,
          value: evaluationResults.value,
          createdAt: evaluationResults.createdAt,
          metricName: sportsMetrics.name,
          metricUnit: sportsMetrics.unit,
        })
        .from(evaluationResults)
        .leftJoin(sportsMetrics, eq(evaluationResults.sportMetricId, sportsMetrics.id))
        .where(eq(evaluationResults.evaluationId, evaluationId));
      return { ...evalRow, results };
    }
  )
  .put(
    "/members/:memberId/evaluations/:evaluationId",
    async (ctx) => {
      const { params, body, member, status } = ctx as typeof ctx & ApiContextAdd;
      const { memberId, evaluationId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, evaluationId),
            eq(evaluations.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const updates: { evaluatedAt?: Date } = {};
      if (body.evaluatedAt) updates.evaluatedAt = new Date(body.evaluatedAt);
      if (Object.keys(updates).length > 0) {
        await db
          .update(evaluations)
          .set(updates)
          .where(eq(evaluations.id, evaluationId));
      }
      if (body.results) {
        await db
          .delete(evaluationResults)
          .where(eq(evaluationResults.evaluationId, evaluationId));
        const now = new Date();
        if (body.results.length > 0) {
          await db.insert(evaluationResults).values(
            body.results.map((r: { sportMetricId: string; value: string }) => ({
              evaluationId,
              sportMetricId: r.sportMetricId,
              value: r.value,
              createdAt: now,
            }))
          );
        }
      }
      const [updated] = await db
        .select()
        .from(evaluations)
        .where(eq(evaluations.id, evaluationId))
        .limit(1);
      const results = await db
        .select()
        .from(evaluationResults)
        .where(eq(evaluationResults.evaluationId, evaluationId));
      return { ...updated, results };
    },
    {
      body: t.Object({
        evaluatedAt: t.Optional(t.String()),
        results: t.Optional(
          t.Array(
            t.Object({
              sportMetricId: t.String(),
              value: t.String(),
            })
          )
        ),
      }),
    }
  )
  .delete(
    "/members/:memberId/evaluations/:evaluationId",
    async (ctx) => {
      const { params, member, status } = ctx as typeof ctx & ApiContextAdd;
      const { memberId, evaluationId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, evaluationId),
            eq(evaluations.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      await db.delete(evaluations).where(eq(evaluations.id, evaluationId));
      return { success: true };
    }
  );
