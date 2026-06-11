import type { AdminApiOrder, AdminProductionDetail, ProductionReviewStatus } from "./types";

export const ADMIN_SESSION_KEY = "razmerno-admin-session";
export const ADMIN_LOGIN_API_URL = import.meta.env.VITE_ADMIN_LOGIN_API_URL ?? "/api/admin/login";
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_ORDERS_API_URL ?? "/api/admin/orders";
export const ADMIN_STATUS_API_URL = import.meta.env.VITE_ADMIN_ORDER_STATUS_API_URL ?? "/api/admin/order-status";
export const ADMIN_STATUS_EVENTS_API_URL = import.meta.env.VITE_ADMIN_STATUS_EVENTS_API_URL ?? "/api/admin/status-events";
export const ADMIN_PRODUCTION_DETAIL_API_URL = import.meta.env.VITE_ADMIN_PRODUCTION_DETAIL_API_URL ?? "/api/admin/production-detail";
export const ADMIN_PRODUCTION_REVIEW_API_URL = import.meta.env.VITE_ADMIN_PRODUCTION_REVIEW_API_URL ?? "/api/admin/production-review";

export async function loginAdmin(password: string): Promise<string> {
  const response = await fetch(ADMIN_LOGIN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await response.json() as { ok?: boolean; token?: string; message?: string };
  if (!response.ok || data.ok !== true || !data.token) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data.token;
}

export async function fetchAdminOrders(adminKey: string): Promise<AdminApiOrder[]> {
  const response = await fetch(ADMIN_API_URL, { headers: { Authorization: `Bearer ${adminKey}` } });
  const data = await response.json() as { ok?: boolean; orders?: AdminApiOrder[]; message?: string };
  if (!response.ok || data.ok !== true || !Array.isArray(data.orders)) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data.orders;
}

export async function updateOrderStatus(adminKey: string, orderId: string, status: "new" | "in_progress" | "done") {
  const response = await fetch(ADMIN_STATUS_API_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
    body: JSON.stringify({ orderId, status }),
  });
  const data = await response.json() as { ok?: boolean; message?: string };
  if (!response.ok || data.ok !== true) throw new Error(data.message || `HTTP ${response.status}`);
}

export async function loadProductionDetail(adminKey: string, orderId: string): Promise<AdminProductionDetail> {
  const response = await fetch(`${ADMIN_PRODUCTION_DETAIL_API_URL}?orderId=${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${adminKey}` },
  });
  const data = await response.json() as { ok?: boolean; detail?: AdminProductionDetail; message?: string };
  if (!response.ok || data.ok !== true || !data.detail) throw new Error(data.message || `HTTP ${response.status}`);
  return data.detail;
}

export async function updateProductionReview(
  adminKey: string,
  orderId: string,
  status: ProductionReviewStatus,
  note: string,
) {
  const response = await fetch(ADMIN_PRODUCTION_REVIEW_API_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
    body: JSON.stringify({ orderId, status, note }),
  });
  const data = await response.json() as { ok?: boolean; message?: string };
  if (!response.ok || data.ok !== true) throw new Error(data.message || `HTTP ${response.status}`);
}
