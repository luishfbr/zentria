import * as React from "react";
import { authClient } from "./lib/auth-client";
import { LoadingPage } from "./components/loading-components";
import { useQuery } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins";

export interface AuthContext {
  isAuthenticated: boolean;
  user: UserWithRole | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useQuery({
    queryKey: ["session"],
    queryFn: async () =>
      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      }),
  });

  const user = session?.data?.user;

  const isAuthenticated = !!user;

  if (isPending) return <LoadingPage />;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user: (user as UserWithRole) ?? null }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
