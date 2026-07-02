import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isCustomerAuthConfigured,
  readBrowserSession,
  refreshBrowserSession,
} from "./supabaseBrowser";

type SessionContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  refreshSession: () => Promise<Session | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const configured = isCustomerAuthConfigured();
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);

  const refreshSession = useCallback(async () => {
    if (!configured) {
      setSession(null);
      setLoading(false);
      return null;
    }

    const nextSession = (await readBrowserSession()) ?? (await refreshBrowserSession());
    setSession(nextSession);
    setLoading(false);
    return nextSession;
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      setSession(null);
      setLoading(false);
      return;
    }

    let active = true;
    void refreshSession();

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [configured, refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      configured,
      loading,
      session,
      user: session?.user ?? null,
      refreshSession,
    }),
    [configured, loading, refreshSession, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
}
