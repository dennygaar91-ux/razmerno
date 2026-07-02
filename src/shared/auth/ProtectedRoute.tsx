import type { ReactNode } from "react";
import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const { configured, loading, isAuthenticated } = useAuth();

  if (!configured) return <>{children}</>;
  if (loading) return null;
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
}
