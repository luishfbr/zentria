import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_pathlessLayout/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(dashboard)/_pathlessLayout/dashboard"!</div>;
}
