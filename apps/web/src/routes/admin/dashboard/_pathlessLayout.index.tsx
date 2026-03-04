import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard/_pathlessLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>bem vindo ao dashboard</div>;
}
