import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { SessionProvider } from "./SessionProvider";
import { UserProvider } from "./UserContext";

export function CustomerAuthProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UserProvider>{children}</UserProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
