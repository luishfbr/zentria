import Elysia from "elysia";
import { auth } from "../../lib/auth";
import { getMemberInOrg } from "../../lib/org-access";
import type { MemberWithOrg } from "../../lib/org-access";

const API_ORGANIZATIONS_PREFIX = "/api/organizations/";

function getOrganizationIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(API_ORGANIZATIONS_PREFIX)) return null;
  const rest = pathname.slice(API_ORGANIZATIONS_PREFIX.length);
  const idx = rest.indexOf("/");
  if (idx === -1) return rest || null;
  return rest.slice(0, idx) || null;
}

export type ApiContext = {
  session: { user: { id: string; email: string; name?: string }; session: object } | null;
  member: MemberWithOrg | null;
  organizationId: string | null;
};

export const apiGuard = new Elysia({ name: "api-guard" })
  .derive(async ({ request }): Promise<ApiContext> => {
    const session = await auth.api.getSession({ headers: request.headers });
    const pathname = new URL(request.url).pathname;
    const organizationId = getOrganizationIdFromPath(pathname);

    if (!session) {
      return { session: null, member: null, organizationId };
    }

    if (!organizationId) {
      return { session, member: null, organizationId: null };
    }

    const member = await getMemberInOrg(session.user.id, organizationId);
    return { session, member, organizationId };
  })
  .onBeforeHandle(({ session, member, organizationId }) => {
    if (!session) {
      return new Response(
        JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (organizationId && !member) {
      return new Response(
        JSON.stringify({ error: { code: "FORBIDDEN", message: "Not a member of this organization" } }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  });
