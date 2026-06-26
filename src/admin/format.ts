import type { AdminApiOrder, AdminOrderRow } from "./types";
import { maskEmail, maskPhone, maskCustomerName } from "./orderSummary";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function mapApiOrder(order: AdminApiOrder): AdminOrderRow {
  const dimensions = parseDimensionsFromProduct(order.product);
  const breakdownKeys = Object.keys(order.priceBreakdown ?? {});

  return {
    id: order.id,
    status: order.status,
    customer: order.customer.nameMasked || maskCustomerName(null),
    phone: order.customer.phoneMasked || maskPhone(null),
    email: order.customer.emailMasked || maskEmail(null),
    product: order.product,
    productType: parseProductTypeLabel(order.product),
    dimensions,
    materialsSummary: "not available in current admin payload",
    pricingLabel: order.pricing.status,
    pricingSource: order.pricing.source,
    pricingSnapshotSummary: "persisted total/delivery/assembly from stored order snapshot",
    priceBreakdownSummary: breakdownKeys.length > 0
      ? `stored breakdown keys: ${breakdownKeys.join(", ")}`
      : "stored breakdown not available in current admin payload",
    total: formatPrice(order.totalPrice),
    createdAt: formatDate(order.createdAt),
    delivery: order.delivery.enabled ? `${formatPrice(order.delivery.price)} · ${order.delivery.addressMasked ?? "адрес скрыт"}` : "нет",
    assembly: order.assembly.enabled ? formatPrice(order.assembly.price) : "нет",
    assemblyBasePrice: order.assembly.basePrice === null ? undefined : formatPrice(order.assembly.basePrice),
    managerEmail: order.email.manager,
    customerEmail: order.email.customer,
    production: `${order.production.status} · W${order.production.warnings}/R${order.production.rejects}/A${order.production.repairs} · rev.${order.production.revision}`,
    productionStatus: order.production.status,
  };
}

function parseProductTypeLabel(product: string): string {
  if (product.startsWith("Комод")) return "Комод";
  if (product.startsWith("Тумба")) return "Тумба";
  if (product.startsWith("Шкаф")) return "Шкаф";
  return "Изделие";
}

function parseDimensionsFromProduct(product: string): AdminOrderRow["dimensions"] | undefined {
  const match = product.match(/(\d+)\s*[\u00D7x]\s*(\d+)\s*[\u00D7x]\s*(\d+)/u);
  if (!match) return undefined;
  return {
    widthMm: Number(match[1]),
    heightMm: Number(match[2]),
    depthMm: Number(match[3]),
  };
}
