import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { members } from "../db/schema/auth";

export type MemberRole = "athlete" | "coach" | "admin" | "superadmin" | "member";

export type MemberWithOrg = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
};

/**
 * Devolve o member do utilizador na organização, ou null se não for membro.
 */
export async function getMemberInOrg(
  userId: string,
  organizationId: string
): Promise<MemberWithOrg | null> {
  const rows = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.userId, userId),
        eq(members.organizationId, organizationId)
      )
    )
    .limit(1);
  const row = rows[0] ?? null;
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organizationId,
    userId: row.userId,
    role: row.role,
    createdAt: row.createdAt,
  };
}

/**
 * Verifica se o member tem uma das roles permitidas.
 * Retorna true se role do member estiver em allowedRoles.
 */
export function requireRole(
  member: MemberWithOrg,
  allowedRoles: MemberRole[]
): boolean {
  const allowed = new Set(allowedRoles.map((r) => r.toLowerCase()));
  return allowed.has(member.role.toLowerCase());
}

/**
 * Verifica se o member pode aceder aos dados de outro membro.
 * Athlete só pode aceder ao próprio memberId; coach e admin podem aceder a qualquer membro da org.
 */
export function canAccessMember(
  currentMember: MemberWithOrg,
  targetMemberId: string
): boolean {
  if (currentMember.id === targetMemberId) return true;
  const canAccessOthers = requireRole(currentMember, [
    "coach",
    "admin",
    "superadmin",
  ]);
  return canAccessOthers;
}
