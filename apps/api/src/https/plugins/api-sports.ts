import Elysia, { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import {
  sports,
  sportsMetrics,
  athleteSports,
} from "../../db/schema/sports";
import { members, users } from "../../db/schema/auth";
import { requireRole } from "../../lib/org-access";

export const apiSports = new Elysia({
  name: "api-sports",
  detail: { tags: ["Sports"] },
})
  // Sports CRUD
  .get("/sports", async ({ organizationId }) => {
    const rows = await db
      .select()
      .from(sports)
      .where(eq(sports.organizationId, organizationId));
    return rows;
  })
  .post(
    "/sports",
    async ({ body, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const [row] = await db
        .insert(sports)
        .values({
          organizationId,
          name: body.name,
          slug: body.slug,
          description: body.description ?? null,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        description: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/sports/:sportId",
    async ({ params, organizationId, status }) => {
      const { sportId } = params;
      const [row] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!row) return status(404, { message: "Not found" });
      return row;
    }
  )
  .put(
    "/sports/:sportId",
    async ({ params, body, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId } = params;
      const [existing] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const [row] = await db
        .update(sports)
        .set({
          name: body.name ?? existing.name,
          slug: body.slug ?? existing.slug,
          description: body.description !== undefined ? body.description : existing.description,
        })
        .where(eq(sports.id, sportId))
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        slug: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .delete(
    "/sports/:sportId",
    async ({ params, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId } = params;
      const [existing] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      await db.delete(sports).where(eq(sports.id, sportId));
      return { success: true };
    }
  )
  // Metrics
  .get(
    "/sports/:sportId/metrics",
    async ({ params, organizationId, status }) => {
      const { sportId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const rows = await db
        .select()
        .from(sportsMetrics)
        .where(eq(sportsMetrics.sportId, sportId));
      return rows;
    }
  )
  .post(
    "/sports/:sportId/metrics",
    async ({ params, body, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const now = new Date();
      const [row] = await db
        .insert(sportsMetrics)
        .values({
          sportId,
          name: body.name,
          unit: body.unit ?? null,
          type: body.type,
          order: body.order,
          createdAt: now,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.String(),
        unit: t.Optional(t.String()),
        type: t.String(),
        order: t.Number(),
      }),
    }
  )
  .get(
    "/sports/:sportId/metrics/:metricId",
    async ({ params, organizationId, status }) => {
      const { sportId, metricId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const [row] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, metricId),
            eq(sportsMetrics.sportId, sportId)
          )
        )
        .limit(1);
      if (!row) return status(404, { message: "Not found" });
      return row;
    }
  )
  .put(
    "/sports/:sportId/metrics/:metricId",
    async ({ params, body, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId, metricId } = params;
      const [existing] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, metricId),
            eq(sportsMetrics.sportId, sportId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      const [row] = await db
        .update(sportsMetrics)
        .set({
          name: body.name ?? existing.name,
          unit: body.unit !== undefined ? body.unit : existing.unit,
          type: body.type ?? existing.type,
          order: body.order ?? existing.order,
        })
        .where(eq(sportsMetrics.id, metricId))
        .returning();
      return row;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        unit: t.Optional(t.Nullable(t.String())),
        type: t.Optional(t.String()),
        order: t.Optional(t.Number()),
      }),
    }
  )
  .delete(
    "/sports/:sportId/metrics/:metricId",
    async ({ params, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId, metricId } = params;
      const [existing] = await db
        .select()
        .from(sportsMetrics)
        .where(
          and(
            eq(sportsMetrics.id, metricId),
            eq(sportsMetrics.sportId, sportId)
          )
        )
        .limit(1);
      if (!existing) return status(404, { message: "Not found" });
      await db.delete(sportsMetrics).where(eq(sportsMetrics.id, metricId));
      return { success: true };
    }
  )
  // Athletes in sport
  .get(
    "/sports/:sportId/athletes",
    async ({ params, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const rows = await db
        .select({
          id: athleteSports.id,
          memberId: athleteSports.memberId,
          sportId: athleteSports.sportId,
          joinedAt: athleteSports.joinedAt,
          createdAt: athleteSports.createdAt,
          userName: users.name,
          userEmail: users.email,
          role: members.role,
        })
        .from(athleteSports)
        .innerJoin(members, eq(athleteSports.memberId, members.id))
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(athleteSports.sportId, sportId));
      return rows;
    }
  )
  .post(
    "/sports/:sportId/athletes",
    async ({ params, body, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const [orgMember] = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.id, body.memberId),
            eq(members.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!orgMember) return status(400, { message: "Member not in organization" });
      const now = new Date();
      const [row] = await db
        .insert(athleteSports)
        .values({
          memberId: body.memberId,
          sportId,
          joinedAt: now,
          createdAt: now,
        })
        .returning();
      return row;
    },
    {
      body: t.Object({
        memberId: t.String(),
      }),
    }
  )
  .delete(
    "/sports/:sportId/athletes/:memberId",
    async ({ params, member, organizationId, status }) => {
      if (!requireRole(member, ["coach", "admin", "superadmin"])) {
        return status(403, { message: "Forbidden" });
      }
      const { sportId, memberId } = params;
      const [sport] = await db
        .select()
        .from(sports)
        .where(
          and(
            eq(sports.id, sportId),
            eq(sports.organizationId, organizationId)
          )
        )
        .limit(1);
      if (!sport) return status(404, { message: "Not found" });
      const result = await db
        .delete(athleteSports)
        .where(
          and(
            eq(athleteSports.sportId, sportId),
            eq(athleteSports.memberId, memberId)
          )
        )
        .returning({ id: athleteSports.id });
      if (result.length === 0) return status(404, { message: "Not found" });
      return { success: true };
    }
  );
