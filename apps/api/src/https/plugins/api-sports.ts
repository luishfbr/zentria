import Elysia from "elysia";
import { t } from "elysia";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../../db/client";
import {
  sports,
  sportsMetrics,
  athleteSports,
} from "../../db/schema/sports";
import { requireRole } from "../../lib/org-access";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const apiSports = new Elysia({ name: "api-sports" })
  .get(
    "/organizations/:organizationId/sports",
    async ({ params, query }) => {
      if (!params.organizationId) throw new Error("Guard should ensure organizationId");
      const limit = Math.min(Number(query?.limit) ?? 50, 100);
      const offset = Number(query?.offset) ?? 0;
      const rows = await db
        .select()
        .from(sports)
        .where(eq(sports.organizationId, params.organizationId))
        .limit(limit)
        .offset(offset);
      return { data: rows };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
      detail: { tags: ["Sports"], summary: "List sports" },
    }
  )
  .post(
    "/organizations/:organizationId/sports",
    async ({ member, organizationId, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const slug = body.slug?.trim() || slugify(body.name);
      const [created] = await db
        .insert(sports)
        .values({
          organizationId,
          name: body.name,
          slug,
          description: body.description ?? null,
          createdAt: new Date(),
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Sports"], summary: "Create sport" },
    }
  )
  .get(
    "/organizations/:organizationId/sports/:sportId",
    async ({ organizationId, params }) => {
      if (!organizationId) throw new Error("Guard should ensure organizationId");
      const [row] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!row) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return { data: row };
    },
    { detail: { tags: ["Sports"], summary: "Get sport by id" } }
  )
  .put(
    "/organizations/:organizationId/sports/:sportId",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const slug = body.slug !== undefined ? body.slug : existing.slug;
      const [updated] = await db
        .update(sports)
        .set({
          name: body.name ?? existing.name,
          slug,
          description: body.description !== undefined ? body.description : existing.description,
        })
        .where(eq(sports.id, params.sportId))
        .returning();
      return { data: updated };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        slug: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Sports"], summary: "Update sport" },
    }
  )
  .delete(
    "/organizations/:organizationId/sports/:sportId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      await db.delete(sports).where(eq(sports.id, params.sportId));
      return { data: { id: params.sportId, deleted: true } };
    },
    { detail: { tags: ["Sports"], summary: "Delete sport" } }
  )
  .get(
    "/organizations/:organizationId/sports/:sportId/metrics",
    async ({ organizationId, params }) => {
      if (!organizationId) throw new Error("Guard should ensure organizationId");
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await db
        .select()
        .from(sportsMetrics)
        .where(eq(sportsMetrics.sportId, params.sportId))
        .orderBy(asc(sportsMetrics.order));
      return { data: rows };
    },
    { detail: { tags: ["Sports"], summary: "List sport metrics" } }
  )
  .post(
    "/organizations/:organizationId/sports/:sportId/metrics",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [created] = await db
        .insert(sportsMetrics)
        .values({
          sportId: params.sportId,
          name: body.name,
          unit: body.unit ?? null,
          type: body.type,
          order: body.order,
          createdAt: new Date(),
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        name: t.String(),
        unit: t.Optional(t.Nullable(t.String())),
        type: t.String(),
        order: t.Number(),
      }),
      detail: { tags: ["Sports"], summary: "Create sport metric" },
    }
  )
  .get(
    "/organizations/:organizationId/sports/:sportId/metrics/:metricId",
    async ({ organizationId, params }) => {
      if (!organizationId) throw new Error("Guard should ensure organizationId");
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [row] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, params.metricId),
            eq(sportsMetrics.sportId, params.sportId)
          )
        )
        .limit(1);
      if (!row) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Metric not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return { data: row };
    },
    { detail: { tags: ["Sports"], summary: "Get metric by id" } }
  )
  .put(
    "/organizations/:organizationId/sports/:sportId/metrics/:metricId",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, params.metricId),
            eq(sportsMetrics.sportId, params.sportId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Metric not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [updated] = await db
        .update(sportsMetrics)
        .set({
          name: body.name ?? existing.name,
          unit: body.unit !== undefined ? body.unit : existing.unit,
          type: body.type ?? existing.type,
          order: body.order ?? existing.order,
        })
        .where(eq(sportsMetrics.id, params.metricId))
        .returning();
      return { data: updated };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        unit: t.Optional(t.Nullable(t.String())),
        type: t.Optional(t.String()),
        order: t.Optional(t.Number()),
      }),
      detail: { tags: ["Sports"], summary: "Update metric" },
    }
  )
  .delete(
    "/organizations/:organizationId/sports/:sportId/metrics/:metricId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, params.metricId),
            eq(sportsMetrics.sportId, params.sportId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Metric not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      await db.delete(sportsMetrics).where(eq(sportsMetrics.id, params.metricId));
      return { data: { id: params.metricId, deleted: true } };
    },
    { detail: { tags: ["Sports"], summary: "Delete metric" } }
  )
  .get(
    "/organizations/:organizationId/sports/:sportId/athletes",
    async ({ organizationId, params }) => {
      if (!organizationId) throw new Error("Guard should ensure organizationId");
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await db
        .select()
        .from(athleteSports)
        .where(eq(athleteSports.sportId, params.sportId));
      return { data: rows };
    },
    { detail: { tags: ["Sports"], summary: "List athletes in sport" } }
  )
  .post(
    "/organizations/:organizationId/sports/:sportId/athletes",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const joinedAt = body.joinedAt ? new Date(body.joinedAt) : new Date();
      const [created] = await db
        .insert(athleteSports)
        .values({
          memberId: body.memberId,
          sportId: params.sportId,
          joinedAt,
          createdAt: new Date(),
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        memberId: t.String(),
        joinedAt: t.Optional(t.String()), // ISO date
      }),
      detail: { tags: ["Sports"], summary: "Add athlete to sport" },
    }
  )
  .delete(
    "/organizations/:organizationId/sports/:sportId/athletes/:memberId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, params.sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Sport not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const result = await db
        .delete(athleteSports)
        .where(
          and(
            eq(athleteSports.sportId, params.sportId),
            eq(athleteSports.memberId, params.memberId)
          )
        )
        .returning({ id: athleteSports.id });
      if (result.length === 0) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Athlete not in sport" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return { data: { memberId: params.memberId, sportId: params.sportId, removed: true } };
    },
    { detail: { tags: ["Sports"], summary: "Remove athlete from sport" } }
  );
