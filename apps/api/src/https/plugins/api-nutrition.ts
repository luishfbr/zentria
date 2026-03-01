import Elysia from "elysia";
import { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { members } from "../../db/schema/auth";
import { dietPlans, dietPlanItems } from "../../db/schema/nutrition";
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

async function ensureDietPlanForMember(
  dietPlanId: string,
  memberId: string,
  organizationId: string
) {
  const target = await ensureMemberInOrg(memberId, organizationId);
  if (!target) return null;
  const [plan] = await db
    .select()
    .from(dietPlans)
    .where(
      and(
        eq(dietPlans.id, dietPlanId),
        eq(dietPlans.memberId, memberId)
      )
    )
    .limit(1);
  return plan ?? null;
}

export const apiNutrition = new Elysia({ name: "api-nutrition" })
  .get(
    "/organizations/:organizationId/members/:memberId/diet-plans",
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
      const rows = await db
        .select()
        .from(dietPlans)
        .where(eq(dietPlans.memberId, params.memberId));
      return { data: rows };
    },
    { detail: { tags: ["Nutrition"], summary: "List member diet plans" } }
  )
  .post(
    "/organizations/:organizationId/members/:memberId/diet-plans",
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
      const validFrom = new Date(body.validFrom);
      const validTo = body.validTo ? new Date(body.validTo) : null;
      const [created] = await db
        .insert(dietPlans)
        .values({
          memberId: params.memberId,
          name: body.name,
          validFrom,
          validTo,
          createdBy: session?.user?.id ?? null,
          createdAt: new Date(),
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        name: t.String(),
        validFrom: t.String(),
        validTo: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Nutrition"], summary: "Create diet plan" },
    }
  )
  .get(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const items = await db
        .select()
        .from(dietPlanItems)
        .where(eq(dietPlanItems.dietPlanId, params.dietPlanId));
      return { data: { ...plan, items } };
    },
    { detail: { tags: ["Nutrition"], summary: "Get diet plan by id with items" } }
  )
  .put(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.validFrom !== undefined) updates.validFrom = new Date(body.validFrom);
      if (body.validTo !== undefined) updates.validTo = body.validTo ? new Date(body.validTo) : null;
      const [updated] = await db
        .update(dietPlans)
        .set(updates as Partial<typeof dietPlans.$inferInsert>)
        .where(eq(dietPlans.id, params.dietPlanId))
        .returning();
      return { data: updated };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        validFrom: t.Optional(t.String()),
        validTo: t.Optional(t.Nullable(t.String())),
      }),
      detail: { tags: ["Nutrition"], summary: "Update diet plan" },
    }
  )
  .delete(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      await db.delete(dietPlans).where(eq(dietPlans.id, params.dietPlanId));
      return { data: { id: params.dietPlanId, deleted: true } };
    },
    { detail: { tags: ["Nutrition"], summary: "Delete diet plan" } }
  )
  .get(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId/items",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await db
        .select()
        .from(dietPlanItems)
        .where(eq(dietPlanItems.dietPlanId, params.dietPlanId));
      return { data: rows };
    },
    { detail: { tags: ["Nutrition"], summary: "List diet plan items" } }
  )
  .post(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId/items",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [created] = await db
        .insert(dietPlanItems)
        .values({
          dietPlanId: params.dietPlanId,
          dayOfWeek: body.dayOfWeek,
          mealType: body.mealType,
          content: body.content,
          order: body.order,
        })
        .returning();
      return { data: created };
    },
    {
      body: t.Object({
        dayOfWeek: t.Number({ minimum: 0, maximum: 6 }),
        mealType: t.String(),
        content: t.String(),
        order: t.Number(),
      }),
      detail: { tags: ["Nutrition"], summary: "Create diet plan item" },
    }
  )
  .put(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId/items/:itemId",
    async ({ member, organizationId, params, body }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const [existing] = await db
        .select()
        .from(dietPlanItems)
        .where(
          and(
            eq(dietPlanItems.id, params.itemId),
            eq(dietPlanItems.dietPlanId, params.dietPlanId)
          )
        )
        .limit(1);
      if (!existing) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Item not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const updates: Partial<typeof dietPlanItems.$inferInsert> = {};
      if (body.dayOfWeek !== undefined) updates.dayOfWeek = body.dayOfWeek;
      if (body.mealType !== undefined) updates.mealType = body.mealType;
      if (body.content !== undefined) updates.content = body.content;
      if (body.order !== undefined) updates.order = body.order;
      const [updated] = await db
        .update(dietPlanItems)
        .set(updates)
        .where(eq(dietPlanItems.id, params.itemId))
        .returning();
      return { data: updated };
    },
    {
      body: t.Object({
        dayOfWeek: t.Optional(t.Number({ minimum: 0, maximum: 6 })),
        mealType: t.Optional(t.String()),
        content: t.Optional(t.String()),
        order: t.Optional(t.Number()),
      }),
      detail: { tags: ["Nutrition"], summary: "Update diet plan item" },
    }
  )
  .delete(
    "/organizations/:organizationId/members/:memberId/diet-plans/:dietPlanId/items/:itemId",
    async ({ member, organizationId, params }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");
      if (!canAccessMember(member, params.memberId)) {
        return new Response(
          JSON.stringify({ error: { code: "FORBIDDEN", message: "Cannot access this member" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const plan = await ensureDietPlanForMember(
        params.dietPlanId,
        params.memberId,
        organizationId
      );
      if (!plan) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Diet plan not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const result = await db
        .delete(dietPlanItems)
        .where(
          and(
            eq(dietPlanItems.id, params.itemId),
            eq(dietPlanItems.dietPlanId, params.dietPlanId)
          )
        )
        .returning({ id: dietPlanItems.id });
      if (result.length === 0) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: "Item not found" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return { data: { id: params.itemId, deleted: true } };
    },
    { detail: { tags: ["Nutrition"], summary: "Delete diet plan item" } }
  );
