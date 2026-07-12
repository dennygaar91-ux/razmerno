import crypto from "node:crypto";
import { INITIAL_ORDER_DOMAIN_STATUS, LEGACY_ORDER_STATUS_ON_SUBMIT } from "./order-domain";
import type { OrderDbInsert, OrderPricingAttribution, OrderRequest } from "./order-types";

function hashClientIp(value: string | null): string | null {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function toOrderDbInsert({
  orderId,
  body,
  userAgent,
  clientIp,
  pricingAttribution = null,
  userId,
  publicOrderNumber,
  constructorProjectId = null,
}: {
  orderId: string;
  body: OrderRequest;
  userAgent: string | null;
  clientIp: string | null;
  pricingAttribution?: OrderPricingAttribution | null;
  userId: string;
  publicOrderNumber: string;
  constructorProjectId?: string | null;
}): OrderDbInsert {
  return {
    order_id: orderId,
    status: LEGACY_ORDER_STATUS_ON_SUBMIT,
    user_id: userId,
    public_order_number: publicOrderNumber,
    domain_status: INITIAL_ORDER_DOMAIN_STATUS,
    constructor_project_id: constructorProjectId,
    source: body.source ?? "configurator",

    product_type: body.productType ?? "wardrobe",
    dimensions: body.dimensions ?? { width: 0, height: 0, depth: 0 },
    sections: body.sections ?? 1,
    filling: body.filling ?? { shelves: 0, drawers: 0, hangingRod: false },
    layout: body.layout ?? null,
    materials: body.materials ?? { bodyId: "", facadeId: "" },
    style: body.style ?? { facadeStyleId: "", hardwareId: "" },
    price_breakdown: body.priceBreakdown ?? {},
    total_price: body.totalPrice ?? 0,

    customer_name: body.customer?.name?.trim() ?? "",
    customer_phone: body.customer?.phone?.trim() ?? "",
    customer_email: body.customer?.email?.trim() ?? "",
    customer_comment: body.customer?.comment?.trim() || null,

    delivery_enabled: body.delivery?.enabled === true,
    delivery_address: body.delivery?.address?.trim() || null,
    delivery_price: body.delivery?.enabled === true ? (body.delivery?.price ?? 0) : 0,

    assembly_enabled: body.assembly?.enabled === true,
    assembly_price: body.assembly?.enabled === true ? (body.assembly?.price ?? 0) : 0,
    assembly_rate: body.assembly?.enabled === true ? (body.assembly?.rate ?? 0) : 0,
    assembly_base_price: body.assembly?.enabled === true ? (body.assembly?.basePrice ?? 0) : 0,

    consent: body.consent ?? { personalData: false },
    config_version: body.configVersion ?? null,
    utm: body.utm ?? {},

    manager_email_status: "pending",
    customer_email_status: "pending",
    manager_email_error: null,
    customer_email_error: null,

    user_agent: userAgent,
    client_ip_hash: hashClientIp(clientIp),
    production_export: body.productionExport ?? null,

    catalog_source_used: pricingAttribution?.catalog_source_used ?? null,
    pricing_source_diagnostic: pricingAttribution?.pricing_source_diagnostic ?? null,
    pricing_fallback_reason: pricingAttribution?.pricing_fallback_reason ?? null,
  };
}
