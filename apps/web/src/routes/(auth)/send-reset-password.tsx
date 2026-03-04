import { SendResetPasswordForm } from "#/components/auth/send-reset-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(auth)/send-reset-password",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <SendResetPasswordForm />;
}
