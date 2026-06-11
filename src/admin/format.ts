import type { AdminApiOrder, AdminOrderRow } from "./types";

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
  return {
    id: order.id,
    status: order.status,
    customer: order.customer.nameMasked,
    phone: order.customer.phoneMasked,
    email: order.customer.emailMasked,
    product: order.product,
    total: formatPrice(order.totalPrice),
    createdAt: formatDate(order.createdAt),
    delivery: order.delivery.enabled ? `${formatPrice(order.delivery.price)} · ${order.delivery.addressMasked ?? "адрес скрыт"}` : "нет",
    assembly: order.assembly.enabled ? formatPrice(order.assembly.price) : "нет",
    managerEmail: order.email.manager,
    customerEmail: order.email.customer,
    production: `${order.production.status} · W${order.production.warnings}/R${order.production.rejects}/A${order.production.repairs} · rev.${order.production.revision}`,
    productionStatus: order.production.status,
  };
}
