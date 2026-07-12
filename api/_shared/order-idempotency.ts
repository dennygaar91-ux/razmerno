import type { OrderDbInsert } from "./order-types";
import type { StoredOrderRecord } from "./supabase-orders";

type ComparableOrderRecord = Omit<
  OrderDbInsert,
  | "order_id"
  | "status"
  | "user_id"
  | "public_order_number"
  | "domain_status"
  | "constructor_project_id"
  | "manager_email_status"
  | "customer_email_status"
  | "manager_email_error"
  | "customer_email_error"
  | "user_agent"
  | "client_ip_hash"
  | "production_export"
>;

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeValue(item)]),
    );
  }

  return value;
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function toComparableRecord(record: OrderDbInsert): ComparableOrderRecord {
  const {
    order_id: _orderId,
    status: _status,
    user_id: _userId,
    public_order_number: _publicOrderNumber,
    domain_status: _domainStatus,
    constructor_project_id: _constructorProjectId,
    manager_email_status: _managerEmailStatus,
    customer_email_status: _customerEmailStatus,
    manager_email_error: _managerEmailError,
    customer_email_error: _customerEmailError,
    user_agent: _userAgent,
    client_ip_hash: _clientIpHash,
    production_export: _productionExport,
    ...comparable
  } = record;

  return comparable;
}

function fromStoredOrderRecord(record: StoredOrderRecord): ComparableOrderRecord {
  return {
    source: record.source,
    product_type: record.product_type,
    dimensions: record.dimensions,
    sections: record.sections,
    filling: record.filling,
    layout: record.layout,
    materials: record.materials,
    style: record.style,
    price_breakdown: record.price_breakdown,
    total_price: record.total_price,
    customer_name: record.customer_name,
    customer_phone: record.customer_phone,
    customer_email: record.customer_email,
    customer_comment: record.customer_comment,
    delivery_enabled: record.delivery_enabled,
    delivery_address: record.delivery_address,
    delivery_price: record.delivery_price,
    assembly_enabled: record.assembly_enabled,
    assembly_price: record.assembly_price,
    assembly_rate: record.assembly_rate,
    assembly_base_price: record.assembly_base_price,
    consent: record.consent,
    config_version: record.config_version,
    utm: record.utm,
    catalog_source_used: record.catalog_source_used,
    pricing_source_diagnostic: record.pricing_source_diagnostic,
    pricing_fallback_reason: record.pricing_fallback_reason,
  };
}

export function isSameOrderPayload(record: OrderDbInsert, stored: StoredOrderRecord): boolean {
  return stableSerialize(toComparableRecord(record)) === stableSerialize(fromStoredOrderRecord(stored));
}
