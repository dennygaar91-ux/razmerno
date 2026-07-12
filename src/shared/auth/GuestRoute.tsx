import type { ReactNode } from "react";
import { useAuth } from "./useAuth";

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const { configured, loading, isAuthenticated } = useAuth();

  if (!configured) return <>{children}</>;
  if (loading) return null;
  if (isAuthenticated) return null;
  return <>{children}</>;
}
