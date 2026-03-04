import { RegisterForm } from "#/components/auth/register-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/_pathlessLayout/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterForm />;
}
