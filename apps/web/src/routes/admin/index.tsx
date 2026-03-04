import { LoadingPage } from "#/components/loading-components";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (
      !context.auth.isAuthenticated ||
      context.auth.user?.role !== "superadmin"
    ) {
      return redirect({ to: "/admin/signin", replace: true });
    } else if (context.auth.user?.role === "superadmin") {
      return redirect({ to: "/admin/dashboard", replace: true });
    } else {
      return redirect({ to: "/", replace: true });
    }
  },
});

function RouteComponent() {
  return <LoadingPage />;
}
