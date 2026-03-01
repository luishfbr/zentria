import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import '../styles.css'
import type { AuthContext } from '#/auth'

interface MyRouterContext {
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})