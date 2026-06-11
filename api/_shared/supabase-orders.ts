import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OrderDbInsert } from "./order-types";

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

export async function insertOrderRecord(record: OrderDbInsert) {
  const client = getSupabaseClient();

  if (!client) {
    return { ok: true as const, skipped: true as const, reason: "supabase-env-missing" };
  }

  const { error } = await client.from("orders").insert(record);

  if (error) {
    return { ok: false as const, skipped: false as const, error: error.message };
  }

  return { ok: true as const, skipped: false as const };
}

export async function updateOrderEmailStatus(
  orderId: string,
  patch: {
    manager_email_status?: "pending" | "sent" | "skipped" | "failed";
    customer_email_status?: "pending" | "sent" | "skipped" | "failed";
    manager_email_error?: string | null;
    customer_email_error?: string | null;
  },
) {
  const client = getSupabaseClient();

  if (!client) {
    return { ok: true as const, skipped: true as const, reason: "supabase-env-missing" };
  }

  const { error } = await client
    .from("orders")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  if (error) {
    return { ok: false as const, skipped: false as const, error: error.message };
  }

  return { ok: true as const, skipped: false as const };
}
