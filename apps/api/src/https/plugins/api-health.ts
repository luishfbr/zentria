import Elysia, { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { injuries } from "../../db/schema/health";
import { members } from "../../db/schema/auth";
import { canAccessMember, requireRole } from "../../lib/org-access";

export const apiHealth = new Elysia({
  name: "api-health",
  detail: { tags: ["Health"] },
})
  .get(
    "/members/:memberId/injuries",
    async ({ params, member, status }) => {
      const { memberId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const rows = await db
        .select()
        .from(injuries)
        .where(eq(injuries.memberId, memberId));
      return rows;
    }
  )
  .post(
    "/members/:memberId/injuries",
    async ({ params, body, session, member, status }) => {
      const { memberId } = params;
      const canCreateForOther = requireRole(member, ["coach", "admin", "superadmin"]);
      if (member.id !== memberId && !canCreateForOther) {
        return status(403, { message: "Forbidden" });
      }
      const now = new Date();
      const [row] = await db
        .insert(injuries)
        .values({
          memberId,
          description: body.description,
          status: body.status,
          fromDate: new Date(body.fromDate),
          toDate: body.toDate ? new Date(body.toDate) : null,
          recordedBy: body.recordedBy ?? session.user.id ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        description: t.String(),
        status: t.String(),
        fromDate: t.String(),
        toDate: t.Optional(t.String()),
        recordedBy: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/members/:memberId/injuries/:injuryId",
    async ({ params, member, status }) => {
      const { memberId, injuryId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [row] = await db
        .select()
        .from(injuries)
        .where(
          and(
            eq(injuries.id, injuryId),
            eq(injuries.memberId, memberId)
          )
        )
        .limit(1);
      if (!row) return status(404, { message: "Not found" });
      return row;
    }
  )
  .put(
    "/members/:memberId/injuries/:injuryId",
    async ({ params, body, member, status }) => {
      const { memberId, injuryId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(injuries)
        .where(
          and(
            eq(injuries.id, injuryId),
            eq(injuries.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const updates: {
        description?: string;
        status?: string;
        fromDate?: Date;
        toDate?: Date | null;
        recordedBy?: string | null;
      } = {};
      if (body.description !== undefined) updates.description = body.description;
      if (body.status !== undefined) updates.status = body.status;
      if (body.fromDate !== undefined) updates.fromDate = new Date(body.fromDate);
      if (body.toDate !== undefined) updates.toDate = body.toDate ? new Date(body.toDate) : null;
      if (body.recordedBy !== undefined) updates.recordedBy = body.recordedBy;
      const [row] = await db
        .update(injuries)
        .set(updates)
        .where(eq(injuries.id, injuryId))
        .returning();
      return row;
    },
    {
      body: t.Object({
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        fromDate: t.Optional(t.String()),
        toDate: t.Optional(t.Nullable(t.String())),
        recordedBy: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .delete(
    "/members/:memberId/injuries/:injuryId",
    async ({ params, member, status }) => {
      const { memberId, injuryId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const [existing] = await db
        .select()
        .from(injuries)
        .where(
          and(
            eq(injuries.id, injuryId),
            eq(injuries.memberId, memberId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      await db.delete(injuries).where(eq(injuries.id, injuryId));
      return { success: true };
    }
  );
