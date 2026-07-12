import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { signInWithPassword, signOutCustomer, signUpWithPassword } from "./authApi";
import { useSessionContext } from "./SessionProvider";
import type { AuthCredentials, AuthResult } from "./types";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  signIn: (credentials: AuthCredentials) => Promise<AuthResult>;
  signUp: (credentials: AuthCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { configured, loading, session, user, refreshSession } = useSessionContext();

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    const result = await signInWithPassword(credentials);
    if (result.ok) await refreshSession();
    return result;
  }, [refreshSession]);

  const signUp = useCallback(async (credentials: AuthCredentials) => {
    const result = await signUpWithPassword(credentials);
    if (result.ok) await refreshSession();
    return result;
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    await signOutCustomer();
    await refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      loading,
      isAuthenticated: Boolean(session?.access_token),
      userId: user?.id ?? null,
      email: user?.email ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [configured, loading, session?.access_token, signIn, signOut, signUp, user?.email, user?.id],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
