import { ResetPasswordForm } from "#/components/auth/reset-password";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/(auth)/reset-password")({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string(),
  }),
});

function RouteComponent() {
  const { token } = Route.useSearch();

  return <ResetPasswordForm token={token} />;
}
