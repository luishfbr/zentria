import Elysia, { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { dietPlans, dietPlanItems } from "../../db/schema/nutrition";
import { members } from "../../db/schema/auth";
import { canAccessMember, requireRole } from "../../lib/org-access";

export const apiNutrition = new Elysia({
  name: "api-nutrition",
  detail: { tags: ["Nutrition"] },
})
  .get(
    "/members/:memberId/diet-plans",
    async ({ params, member, status }) => {
      const { memberId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const rows = await db
        .select()
        .from(dietPlans)
        .where(eq(dietPlans.memberId, memberId));
      return rows;
    }
  )
  .post(
    "/members/:memberId/diet-plans",
    async ({ params, body, session, member, status }) => {
      const { memberId } = params;
      const canCreateForOther = requireRole(member, ["coach", "admin", "superadmin"]);
      if (member.id !== memberId && !canCreateForOther) {
        return status(403, { message: "Forbidden" });
      }
      const now = new Date();
      const [row] = await db
        .insert(dietPlans)
        .values({
          memberId,
          name: body.name,
          validFrom: new Date(body.validFrom),
          validTo: body.validTo ? new Date(body.validTo) : null,
          createdBy: body.createdBy ?? session.user.id ?? null,
          createdAt: now,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.String(),
        validFrom: t.String(),
        validTo: t.Optional(t.String()),
        createdBy: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/members/:memberId/diet-plans/:dietPlanId",
    async ({ params, member, status }) => {
      const { memberId, dietPlanId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [row] = await db
        .select()
        .from(dietPlans)
        .where(
          and(
            eq(dietPlans.id, dietPlanId),
            eq(dietPlans.memberId, memberId)
          )
        )
        .limit(1);
      if (!row) return status(404, { message: "Not found" });
      return row;
    }
  )
  .put(
    "/members/:memberId/diet-plans/:dietPlanId",
    async ({ params, body, member, status }) => {
      const { memberId, dietPlanId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(dietPlans)
        .where(
          and(
            eq(dietPlans.id, dietPlanId),
            eq(dietPlans.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const updates: {
        name?: string;
        validFrom?: Date;
        validTo?: Date | null;
        createdBy?: string | null;
      } = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.validFrom !== undefined) updates.validFrom = new Date(body.validFrom);
      if (body.validTo !== undefined) updates.validTo = body.validTo ? new Date(body.validTo) : null;
      if (body.createdBy !== undefined) updates.createdBy = body.createdBy;
      const [row] = await db
        .update(dietPlans)
        .set(updates)
        .where(eq(dietPlans.id, dietPlanId))
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        validFrom: t.Optional(t.String()),
        validTo: t.Optional(t.Nullable(t.String())),
        createdBy: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .delete(
    "/members/:memberId/diet-plans/:dietPlanId",
    async ({ params, member, status }) => {
      const { memberId, dietPlanId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(dietPlans)
        .where(
          and(
            eq(dietPlans.id, dietPlanId),
            eq(dietPlans.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      await db.delete(dietPlans).where(eq(dietPlans.id, dietPlanId));
      return { success: true };
    }
  )
  // Diet plan items
  .get(
    "/members/:memberId/diet-plans/:dietPlanId/items",
    async ({ params, member, status }) => {
      const { memberId, dietPlanId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
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
      if (!plan) return status(404, { message: "Not found" });
      const rows = await db
        .select()
        .from(dietPlanItems)
        .where(eq(dietPlanItems.dietPlanId, dietPlanId));
      return rows;
    }
  )
  .post(
    "/members/:memberId/diet-plans/:dietPlanId/items",
    async ({ params, body, member, status }) => {
      const { memberId, dietPlanId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
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
      if (!plan) return status(404, { message: "Not found" });
      const [row] = await db
        .insert(dietPlanItems)
        .values({
          dietPlanId,
          dayOfWeek: body.dayOfWeek,
          mealType: body.mealType,
          content: body.content,
          order: body.order,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        dayOfWeek: t.Number(),
        mealType: t.String(),
        content: t.String(),
        order: t.Number(),
      }),
    }
  )
  .get(
    "/members/:memberId/diet-plans/:dietPlanId/items/:itemId",
    async ({ params, member, status }) => {
      const { memberId, dietPlanId, itemId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
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
      if (!plan) return status(404, { message: "Not found" });
      const [row] = await db
        .select()
        .from(dietPlanItems)
        .where(
          and(
            eq(dietPlanItems.id, itemId),
            eq(dietPlanItems.dietPlanId, dietPlanId)
          )
        )
        .limit(1);
      if (!row) return status(404, { message: "Not found" });
      return row;
    }
  )
  .put(
    "/members/:memberId/diet-plans/:dietPlanId/items/:itemId",
    async ({ params, body, member, status }) => {
      const { memberId, dietPlanId, itemId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
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
      if (!plan) return status(404, { message: "Not found" });
      const [existing] = await db
        .select()
        .from(dietPlanItems)
        .where(
          and(
            eq(dietPlanItems.id, itemId),
            eq(dietPlanItems.dietPlanId, dietPlanId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const updates: {
        dayOfWeek?: number;
        mealType?: string;
        content?: string;
        order?: number;
      } = {};
      if (body.dayOfWeek !== undefined) updates.dayOfWeek = body.dayOfWeek;
      if (body.mealType !== undefined) updates.mealType = body.mealType;
      if (body.content !== undefined) updates.content = body.content;
      if (body.order !== undefined) updates.order = body.order;
      const [row] = await db
        .update(dietPlanItems)
        .set(updates)
        .where(eq(dietPlanItems.id, itemId))
        .returning();
      return row;
    },
    {
      body: t.Object({
        dayOfWeek: t.Optional(t.Number()),
        mealType: t.Optional(t.String()),
        content: t.Optional(t.String()),
        order: t.Optional(t.Number()),
      }),
    }
  )
  .delete(
    "/members/:memberId/diet-plans/:dietPlanId/items/:itemId",
    async ({ params, member, status }) => {
      const { memberId, dietPlanId, itemId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
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
      if (!plan) return status(404, { message: "Not found" });
      const result = await db
        .delete(dietPlanItems)
        .where(
          and(
            eq(dietPlanItems.id, itemId),
            eq(dietPlanItems.dietPlanId, dietPlanId)
          )
        )
        .returning({ id: dietPlanItems.id });
      if (result.length === 0) return status(404, { message: "Not found" });
      return { success: true };
    }
  );
