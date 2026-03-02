import Elysia from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { members, users } from "../../db/schema/auth";
import { canAccessMember } from "../../lib/org-access";

export const apiMembers = new Elysia({
  name: "api-members",
  detail: { tags: ["Members"] },
})
  .get("/members", async ({ member, organizationId }) => {
    const isAthlete =
      member.role.toLowerCase() === "athlete";
    if (isAthlete) {
      const rows = await db
        .select({
          id: members.id,
          organizationId: members.organizationId,
          userId: members.userId,
          role: members.role,
          createdAt: members.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(
          and(
            eq(members.organizationId, organizationId),
            eq(members.id, member.id)
          )
        );
      return rows;
    }
    const rows = await db
      .select({
        id: members.id,
        organizationId: members.organizationId,
        userId: members.userId,
        role: members.role,
        createdAt: members.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(members.organizationId, organizationId));
    return rows;
  })
  .get(
    "/members/:memberId",
    async ({ params, member, organizationId, status }) => {
      const { memberId } = params;
      if (!canAccessMember(member, memberId)) {
        return status(403, { message: "Forbidden" });
      }
      const rows = await db
        .select({
          id: members.id,
          organizationId: members.organizationId,
          userId: members.userId,
          role: members.role,
          createdAt: members.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(
          and(
            eq(members.organizationId, organizationId),
            eq(members.id, memberId)
          )
        )
        .limit(1);
      const row = rows[0];
      if (!row) {
        return status(404, { message: "Not found" });
      }
      return row;
    }
  );
