import { AdminSignInForm } from "#/components/auth/admin-signin";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/signin")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.auth.user && context.auth.user.role === "superadmin") {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-screen mx-auto">
      <AdminSignInForm />
    </div>
  );
}
