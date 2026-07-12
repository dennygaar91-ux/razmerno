import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthContext } from "./AuthProvider";
import { useSessionContext } from "./SessionProvider";
import { fetchCustomerProfile, patchCustomerProfile } from "./profileApi";
import type { CustomerProfile, CustomerProfilePatch } from "./types";

type UserContextValue = {
  profile: CustomerProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: CustomerProfilePatch) => Promise<{ ok: true } | { ok: false; message: string }>;
  displayName: string | null;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const { session } = useSessionContext();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!isAuthenticated || !accessToken) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const result = await fetchCustomerProfile(accessToken);
    if (result.ok) {
      setProfile(result.data);
      setProfileError(null);
    } else {
      setProfile(null);
      setProfileError(result.message);
    }
    setProfileLoading(false);
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (patch: CustomerProfilePatch) => {
      const accessToken = session?.access_token;
      if (!accessToken) {
        return { ok: false as const, message: "Требуется авторизация." };
      }

      const result = await patchCustomerProfile(accessToken, patch);
      if (!result.ok) {
        return { ok: false as const, message: result.message };
      }

      setProfile(result.data);
      setProfileError(null);
      return { ok: true as const };
    },
    [session?.access_token],
  );

  const displayName = profile?.full_name?.trim() || profile?.email || null;

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      profileLoading,
      profileError,
      refreshProfile,
      updateProfile,
      displayName,
    }),
    [displayName, profile, profileError, profileLoading, refreshProfile, updateProfile],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
