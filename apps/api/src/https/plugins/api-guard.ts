import Elysia from "elysia";
import { auth } from "../../lib/auth";
import { getMemberInOrg, type MemberWithOrg } from "../../lib/org-access";

/** Contexto adicionado pelo api-guard; usado nos plugins de domínio para tipar o context. */
export type ApiContextAdd = {
  session: { user: { id: string } };
  member: MemberWithOrg;
  organizationId: string;
};

/**
 * Guard para rotas sob /api/organizations/:organizationId.
 * Deve ser usado dentro de um .group("/organizations/:organizationId", ...).
 * Obtém organizationId exclusivamente de params.organizationId (context Elysia).
 * Expõe session, member e organizationId aos handlers via derive.
 */
export const apiGuard = new Elysia({ name: "api-guard" })
  .derive(async ({ params, request }) => {
    const organizationId = params.organizationId as string;
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return {
        session: null,
        member: null,
        organizationId,
      } as const;
    }
    const member = await getMemberInOrg(session.user.id, organizationId);
    return {
      session,
      member,
      organizationId,
    } as const;
  })
  .onBeforeHandle(({ session, member, status }) => {
    if (!session) {
      return status(401, { message: "Unauthorized" });
    }
    if (!member) {
      return status(403, { message: "Forbidden" });
    }
  });
