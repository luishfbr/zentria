import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import "../styles.css";
import type { AuthContext } from "#/auth";
import { LoadingPage } from "#/components/loading-components";
import { Toaster } from "#/components/ui/sonner";

interface MyRouterContext {
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors closeButton position="bottom-center" />
    </>
  ),
  pendingComponent: LoadingPage,
});
