import { trackEvent } from "./analytics";
import manifest from "../../config/manifest.json";

/**
 * Отправка заявки.
 *
 * Production:
 * - если указан VITE_ORDER_API_URL — отправляем туда;
 * - если VITE_USE_MOCK_API !== "true" — отправляем в `/api/orders` (Vercel function).
 *
 * Local/mock:
 * - если VITE_USE_MOCK_API === "true" — возвращаем mock-success без записи PII в localStorage.
 */

export type OrderLayoutCompartmentKind = "empty" | "shelves" | "drawers" | "rod";

export interface OrderLayoutCompartment {
  id: string;
  kind: OrderLayoutCompartmentKind;
  heightMm: number;
  shelves: number;
  drawers: number;
  hasRod: boolean;
}

export interface OrderLayoutSection {
  id: string;
  widthMm: number;
  facadeMode?: "open" | "hinged";
  compartments: OrderLayoutCompartment[];
}

export interface OrderLayoutModel {
  sections: OrderLayoutSection[];
}

export interface OrderPayload {
  productType: "wardrobe" | "dresser" | "nightstand";
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  layout?: OrderLayoutModel;
  materials: { bodyId: string; facadeId: string; facadeKind?: "ldsp" | "mdf"; backPanelId?: string; backPanelKind?: "hdf" };
  style: { facadeStyleId: string; hardwareId: string };
  priceBreakdown: Record<string, number>;
  totalPrice: number;
  customer: { name: string; phone: string; email: string; comment?: string };
  delivery?: { enabled: boolean; address?: string; price: number };
  assembly?: { enabled: boolean; price: number; rate: number; basePrice: number };
  consent: { personalData: boolean; privacyVersion: string; acceptedAt: string };
  configVersion?: string;
  source: string;
  utm?: Record<string, string>;
  honeypot?: string;
}

export interface OrderResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

type ViteRuntimeEnv = Record<string, string | undefined> & { DEV?: boolean };
const viteEnv = ((import.meta as ImportMeta & { env?: ViteRuntimeEnv }).env ?? {}) as ViteRuntimeEnv;
const USE_MOCK = viteEnv.VITE_USE_MOCK_API === "true";
const ORDER_API_URL = viteEnv.VITE_ORDER_API_URL || "/api/orders";
const ORDER_SUBMIT_ERROR_EVENT = "order_submit_failed";
const GENERIC_SUBMIT_FAILURE_REASON = "generic_submit_failure";

function generateOrderId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RZ-${yyyy}${mm}${dd}-${rand}`;
}

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  const parse = (q: string) => {
    if (!q) return;
    new URLSearchParams(q.startsWith("?") ? q.slice(1) : q).forEach((v, k) => {
      if (k.startsWith("utm_")) out[k] = v;
    });
  };
  parse(window.location.search);
  const hashQ = window.location.hash.indexOf("?");
  if (hashQ >= 0) parse(window.location.hash.slice(hashQ + 1));
  return out;
}

export async function submitOrder(
  payload: Omit<OrderPayload, "utm" | "source"> & { source?: string },
): Promise<OrderResult> {
  const orderId = generateOrderId();
  const fullPayload: OrderPayload & { orderId: string } = {
    orderId,
    ...payload,
    source: payload.source ?? "configurator",
    configVersion: manifest.configVersion,
    utm: readUtm(),
  };

  try {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 650));
      trackEvent("order_submit_success", { orderId, total: payload.totalPrice, mode: "mock" });
      return { ok: true, orderId };
    }

    const res = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": orderId,
      },
      body: JSON.stringify(fullPayload),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      throw new Error((data as { message?: string })?.message ?? `HTTP ${res.status}`);
    }

    const serverOrderId = (data as { orderId?: string })?.orderId ?? orderId;
    trackEvent("order_submit_success", { orderId: serverOrderId, total: payload.totalPrice, mode: "api" });
    return { ok: true, orderId: serverOrderId };
  } catch (e) {
    trackEvent("order_submit_error", {
      error: ORDER_SUBMIT_ERROR_EVENT,
      reason: GENERIC_SUBMIT_FAILURE_REASON,
    });
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Не удалось отправить заявку",
    };
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function validateCustomer(c: { name: string; phone: string; email: string }) {
  const errors: Partial<Record<"name" | "phone" | "email", string>> = {};
  if (c.name.trim().length < 2) errors.name = "Укажите имя";
  const digits = c.phone.replace(/\D/g, "");
  const normalizedRuPhone = digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"));
  if (!normalizedRuPhone) errors.phone = "Укажите российский номер в формате +7";
  if (c.email.trim().length === 0) {
    errors.email = "Укажите email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    errors.email = "Email указан с ошибкой";
  }
  return errors;
}
