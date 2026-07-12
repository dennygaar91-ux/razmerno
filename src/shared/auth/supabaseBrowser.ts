import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function isCustomerAuthConfigured(): boolean {
  const env = import.meta.env;
  if (!env) return false;
  const url = env.VITE_SUPABASE_URL?.trim();
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && anonKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isCustomerAuthConfigured()) return null;

  if (!browserClient) {
    browserClient = createClient(
      import.meta.env.VITE_SUPABASE_URL!.trim(),
      import.meta.env.VITE_SUPABASE_ANON_KEY!.trim(),
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  }

  return browserClient;
}

export async function readBrowserSession(): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function refreshBrowserSession(): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client.auth.refreshSession();
  if (error) return null;
  return data.session;
}
