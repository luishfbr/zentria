import Elysia from "elysia";
import { t } from "elysia";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/client";
import { members } from "../../db/schema/auth";
import { evaluations, evaluationResults } from "../../db/schema/evaluations";
import { sportsMetrics } from "../../db/schema/sports";
import { canAccessMember } from "../../lib/org-access";

async function ensureMemberInOrg(memberId: string, organizationId: string) {
  const [row] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.id, memberId),
        eq(members.organizationId, organizationId)
      )
    )
    .limit(1);
  return row ?? null;
}

export const apiEvaluations = new Elysia({ name: "api-evaluations" })
  .get(
    "/organizations/:organizationId/members/:memberId/evaluations",
    async ({ member, organizationId, params, query }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const target = await ensureMemberInOrg(params.memberId, organizationId);
      if (!target) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Member not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const limit = Math.min(Number(query?.limit) ?? 50, 100);
      const offset = Number(query?.offset) ?? 0;
      const conditions = [eq(evaluations.memberId, params.memberId)];
      if (query?.sportId) conditions.push(eq(evaluations.sportId, query.sportId));
      const rows = await db
        .select()
        .from(evaluations)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(evaluations.evaluatedAt));
      return { data: rows };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
        sportId: t.Optional(t.String()),
      }),
      detail: { tags: ["Evaluations"], summary: "List member evaluations" },
    }
  )
  .post(
    "/organizations/:organizationId/members/:memberId/evaluations",
    async ({ member, organizationId, params, body, session }) => {
      if (!member || !organizationId || !session) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const target = await ensureMemberInOrg(params.memberId, organizationId);
      if (!target) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Member not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const evaluatedAt = new Date(body.evaluatedAt);
      const [created] = await db
        .insert(evaluations)
        .values({
          memberId: params.memberId,
          sportId: body.sportId,
          evaluatedAt,
          recordedBy: session.user.id,
          createdAt: new Date(),
        })
        .returning();
      if (body.results?.length) {
        await db.insert(evaluationResults).values(
          body.results.map((r: { sportMetricId: string; value: string }) => ({
            evaluationId: created.id,
            sportMetricId: r.sportMetricId,
            value: r.value,
            createdAt: new Date(),
          }))
        );
      }
      const results = await db
        .select()
        .from(evaluationResults)
        .where(eq(evaluationResults.evaluationId, created.id));
      return { data: { ...created, results } };
    },
    {
      body: t.Object({
        sportId: t.String(),
        evaluatedAt: t.String(),
        results: t.Optional(
          t.Array(t.Object({ sportMetricId: t.String(), value: t.String() }))
        ),
      }),
      detail: { tags: ["Evaluations"], summary: "Create evaluation" },
    }
  )
  .get(
    "/organizations/:organizationId/members/:memberId/evaluations/:evaluationId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const target = await ensureMemberInOrg(params.memberId, organizationId);
      if (!target) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Member not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [evalRow] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, params.evaluationId),
            eq(evaluations.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!evalRow) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Evaluation not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const results = await db
        .select({
          id: evaluationResults.id,
          sportMetricId: evaluationResults.sportMetricId,
          value: evaluationResults.value,
          metricName: sportsMetrics.name,
          metricUnit: sportsMetrics.unit,
        })
        .from(evaluationResults)
        .leftJoin(sportsMetrics, eq(evaluationResults.sportMetricId, sportsMetrics.id))
        .where(eq(evaluationResults.evaluationId, params.evaluationId));
      return { data: { ...evalRow, results } };
    },
    { detail: { tags: ["Evaluations"], summary: "Get evaluation by id" } }
  )
  .put(
    "/organizations/:organizationId/members/:memberId/evaluations/:evaluationId",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, params.evaluationId),
            eq(evaluations.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Evaluation not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const updates: Partial<typeof evaluations.$inferInsert> = {};
      if (body.evaluatedAt !== undefined) updates.evaluatedAt = new Date(body.evaluatedAt);
      if (Object.keys(updates).length > 0) {
        await db
          .update(evaluations)
          .set(updates)
          .where(eq(evaluations.id, params.evaluationId));
      }
      if (body.results?.length) {
        await db
          .delete(evaluationResults)
          .where(eq(evaluationResults.evaluationId, params.evaluationId));
        await db.insert(evaluationResults).values(
          body.results.map((r: { sportMetricId: string; value: string }) => ({
            evaluationId: params.evaluationId,
            sportMetricId: r.sportMetricId,
            value: r.value,
            createdAt: new Date(),
          }))
        );
      }
      const [updated] = await db
        .select()
        .from(evaluations)
        .where(eq(evaluations.id, params.evaluationId))
        .limit(1);
      const results = await db
        .select()
        .from(evaluationResults)
        .where(eq(evaluationResults.evaluationId, params.evaluationId));
      return { data: { ...updated!, results } };
    },
    {
      body: t.Object({
        evaluatedAt: t.Optional(t.String()),
        results: t.Optional(
          t.Array(t.Object({ sportMetricId: t.String(), value: t.String() }))
        ),
      }),
      detail: { tags: ["Evaluations"], summary: "Update evaluation" },
    }
  )
  .delete(
    "/organizations/:organizationId/members/:memberId/evaluations/:evaluationId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.id, params.evaluationId),
            eq(evaluations.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Evaluation not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      await db.delete(evaluations).where(eq(evaluations.id, params.evaluationId));
      return { data: { id: params.evaluationId, deleted: true } };
    },
    { detail: { tags: ["Evaluations"], summary: "Delete evaluation" } }
  );
