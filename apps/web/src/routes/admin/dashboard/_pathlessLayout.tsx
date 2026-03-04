import { AppSidebar } from "#/components/app-sidebar";
import { LoadingPage } from "#/components/loading-components";
import ThemeToggle from "#/components/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import {
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar";
import { authClient } from "#/lib/auth-client";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { Home, Settings } from "lucide-react";

const data = [
  {
    title: "Página Inicial",
    url: "/admin/dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "Configurações do Portal",
    url: "/portal-settings",
    icon: Settings,
    isActive: true,
  },
];

export const Route = createFileRoute("/admin/dashboard/_pathlessLayout")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (
      !context.auth.isAuthenticated ||
      context.auth.user?.role !== "superadmin"
    ) {
      throw redirect({ to: "/admin/signin" });
    }
  },
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const path = useRouterState().location.pathname;

  if (isPending || !session?.user) {
    return <LoadingPage />;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} data={data} groupLabel="Painel de Administração" />
      <SidebarInset>
        <header className="flex flex-row justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    {data.find((f) => f.url === path)?.title ||
                      "Caminho não encontrado!"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-auto">
          <SidebarContent>
            <Outlet />
          </SidebarContent>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
