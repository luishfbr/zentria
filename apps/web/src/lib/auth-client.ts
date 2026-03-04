import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  basePath: "/auth",
  baseURL: "http://localhost:8080",
  plugins: [adminClient(), organizationClient()],
});
