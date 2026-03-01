import Elysia from "elysia";
import { t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { members, users } from "../../db/schema/auth";
import { requireRole } from "../../lib/org-access";

export const apiMembers = new Elysia({ name: "api-members" })
  .get(
    "/organizations/:organizationId/members",
    async ({ member, organizationId, query }) => {
      if (!member || !organizationId) throw new Error("Guard should ensure member");

      const limit = Math.min(query.limit ?? 50, 100);
      const offset = query.offset ?? 0;

      if (requireRole(member, ["athlete"])) {
        const rows = await db
          .select({
            id: members.id,
            organizationId: members.organizationId,
            userId: members.userId,
            role: members.role,
            createdAt: members.createdAt,
            name: users.name,
            email: users.email,
          })
          .from(members)
          .innerJoin(users, eq(members.userId, users.id))
          .where(and(eq(members.id, member.id), eq(members.organizationId, organizationId)))
          .limit(1);
        return { data: rows };
      }

      const rows = await db
        .select({
          id: members.id,
          organizationId: members.organizationId,
          userId: members.userId,
          role: members.role,
          createdAt: members.createdAt,
          name: users.name,
          email: users.email,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.organizationId, organizationId))
        .limit(limit)
        .offset(offset);
      return { data: rows };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric({ default: 50 })),
        offset: t.Optional(t.Numeric({ default: 0 })),
      }),
      detail: {
        tags: ["Members"],
        summary: "List organization members",
        description: "Lists members of the organization. Athletes only see themselves.",
      },
    }
  );
