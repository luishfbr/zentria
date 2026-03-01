import Elysia from "elysia";
import { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { members } from "../../db/schema/auth";
import { injuries } from "../../db/schema/health";
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

export const apiHealth = new Elysia({ name: "api-health" })
  .get(
    "/organizations/:organizationId/members/:memberId/injuries",
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
      const conditions = [eq(injuries.memberId, params.memberId)];
      if (query?.status) conditions.push(eq(injuries.status, query.status));
      const rows = await db
        .select()
        .from(injuries)
        .where(and(...conditions));
      return { data: rows };
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
      }),
      detail: { tags: ["Health"], summary: "List member injuries" },
    }
  )
  .post(
    "/organizations/:organizationId/members/:memberId/injuries",
    async ({ member, organizationId, params, body, session }) => {
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
      const fromDate = new Date(body.fromDate);
      const toDate = body.toDate ? new Date(body.toDate) : null;
      const [created] = await db
        .insert(injuries)
        .values({
          memberId: params.memberId,
          description: body.description,
          status: body.status,
          fromDate,
          toDate,
          recordedBy: body.recordedBy ?? session?.user?.id ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        description: t.String(),
        status: t.String(),
        fromDate: t.String(),
        toDate: t.Optional(t.Nullable(t.String())),
        recordedBy: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Health"], summary: "Create injury" },
    }
  )
  .get(
    "/organizations/:organizationId/members/:memberId/injuries/:injuryId",
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
      const [row] = await db
        .select()
        .from(injuries)
        .where(
          and(
            eq(injuries.id, params.injuryId),
            eq(injuries.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!row) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Injury not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return { data: row };
    },
    { detail: { tags: ["Health"], summary: "Get injury by id" } }
  )
  .put(
    "/organizations/:organizationId/members/:memberId/injuries/:injuryId",
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
        .from(injuries)
        .where(
          and(
            eq(injuries.id, params.injuryId),
            eq(injuries.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Injury not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.description !== undefined) updates.description = body.description;
      if (body.status !== undefined) updates.status = body.status;
      if (body.fromDate !== undefined) updates.fromDate = new Date(body.fromDate);
      if (body.toDate !== undefined) updates.toDate = body.toDate ? new Date(body.toDate) : null;
      const [updated] = await db
        .update(injuries)
        .set(updates as Partial<typeof injuries.$inferInsert>)
        .where(eq(injuries.id, params.injuryId))
        .returning();
      return { data: updated };
    },
    {
      body: t.Object({
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        fromDate: t.Optional(t.String()),
        toDate: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Health"], summary: "Update injury" },
    }
  )
  .delete(
    "/organizations/:organizationId/members/:memberId/injuries/:injuryId",
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
        .from(injuries)
        .where(
          and(
            eq(injuries.id, params.injuryId),
            eq(injuries.memberId, params.memberId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Injury not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      await db.delete(injuries).where(eq(injuries.id, params.injuryId));
      return { data: { id: params.injuryId, deleted: true } };
    },
    { detail: { tags: ["Health"], summary: "Delete injury" } }
  );
