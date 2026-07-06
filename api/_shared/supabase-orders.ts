import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OrderDbInsert } from "./order-types";
import { normalizeSupabaseProjectUrl } from "./supabase-url";

export type StoredOrderRecord = {
  order_id: string;
  user_id: string | null;
  public_order_number: string | null;
  domain_status: string | null;
  constructor_project_id: string | null;
  source: string;
  product_type: OrderDbInsert["product_type"];
  dimensions: OrderDbInsert["dimensions"];
  sections: number;
  filling: OrderDbInsert["filling"];
  layout: OrderDbInsert["layout"];
  materials: OrderDbInsert["materials"];
  style: OrderDbInsert["style"];
  price_breakdown: OrderDbInsert["price_breakdown"];
  total_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_comment: string | null;
  delivery_enabled: boolean;
  delivery_address: string | null;
  delivery_price: number;
  assembly_enabled: boolean;
  assembly_price: number;
  assembly_rate: number;
  assembly_base_price: number;
  consent: OrderDbInsert["consent"];
  config_version: string | null;
  utm: OrderDbInsert["utm"];
  manager_email_status: OrderDbInsert["manager_email_status"];
  customer_email_status: OrderDbInsert["customer_email_status"];
  manager_email_error: string | null;
  customer_email_error: string | null;
  production_export: unknown | null;
  catalog_source_used: OrderDbInsert["catalog_source_used"];
  pricing_source_diagnostic: OrderDbInsert["pricing_source_diagnostic"];
  pricing_fallback_reason: OrderDbInsert["pricing_fallback_reason"];
  created_at: string;
};

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  const url = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL);
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
    return {
      ok: false as const,
      skipped: false as const,
      error: error.message,
      code: typeof (error as { code?: unknown }).code === "string" ? (error as { code?: string }).code ?? null : null,
    };
  }

  return { ok: true as const, skipped: false as const };
}

export async function allocatePublicOrderNumber():
  | { ok: true; value: string }
  | { ok: false; error: string } {
  const client = getSupabaseClient();

  if (!client) {
    return { ok: false, error: "supabase-env-missing" };
  }

  const { data, error } = await client.rpc("next_public_order_number");

  if (error || data == null) {
    return {
      ok: false,
      error: error?.message || "public_number_allocation_failed",
    };
  }

  return { ok: true, value: String(data) };
}

export async function getOrderRecordByOrderId(orderId: string) {
  const client = getSupabaseClient();

  if (!client) {
    return { ok: true as const, skipped: true as const, reason: "supabase-env-missing", row: null };
  }

  const { data, error } = await client
    .from("orders")
    .select(
      "order_id,user_id,public_order_number,domain_status,constructor_project_id,source,product_type,dimensions,sections,filling,layout,materials,style,price_breakdown,total_price,customer_name,customer_phone,customer_email,customer_comment,delivery_enabled,delivery_address,delivery_price,assembly_enabled,assembly_price,assembly_rate,assembly_base_price,consent,config_version,utm,manager_email_status,customer_email_status,manager_email_error,customer_email_error,production_export,catalog_source_used,pricing_source_diagnostic,pricing_fallback_reason,created_at",
    )
    .eq("order_id", orderId)
    .limit(1);

  if (error) {
    return { ok: false as const, skipped: false as const, error: error.message, row: null };
  }

  const row = Array.isArray(data)
    ? ((data[0] ?? null) as StoredOrderRecord | null)
    : data
      ? (data as StoredOrderRecord)
      : null;
  return { ok: true as const, skipped: false as const, row };
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
