/**
 * Аналитика — Яндекс.Метрика.
 *
 * Env:
 * - VITE_YANDEX_METRIKA_ID=12345678
 * - VITE_ANALYTICS_DEBUG=true
 */
type ViteRuntimeEnv = Record<string, string | undefined> & { DEV?: boolean };
const viteEnv = ((import.meta as ImportMeta & { env?: ViteRuntimeEnv }).env ?? {}) as ViteRuntimeEnv;
const YM_ID = Number(viteEnv.VITE_YANDEX_METRIKA_ID || viteEnv.VITE_YM_ID || 0) || null;
const DEBUG = viteEnv.VITE_ANALYTICS_DEBUG === "true" || viteEnv.DEV === true;

export type AnalyticsEvent =
  | "page_view"
  | "hero_cta_click"
  | "furniture_type_selected"
  | "quickstart_use_case_selected"
  | "dimensions_changed"
  | "constructor_step_next"
  | "constructor_step_back"
  | "material_selected"
  | "filling_changed"
  | "price_viewed"
  | "order_form_opened"
  | "order_submit_success"
  | "order_submit_error"
  | "validation_error_seen"
  | "checkout_drawer_closed";

declare global {
  interface Window {
    ym?: ((id: number, action: string, target?: string | Record<string, unknown>, params?: Record<string, unknown>) => void) & { a?: unknown[]; l?: number };
  }
}

export function trackEvent(event: AnalyticsEvent, params?: Record<string, unknown>) {
  if (YM_ID && typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(YM_ID, "reachGoal", event, params);
    return;
  }
  if (DEBUG && typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[analytics]", event, params ?? "");
  }
}

export function trackPageView(path: string) {
  if (YM_ID && typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(YM_ID, "hit", path);
  }
  trackEvent("page_view", { path });
}


let metrikaInjected = false;

export function initYandexMetrika() {
  if (!YM_ID || typeof window === "undefined" || metrikaInjected) return;
  if (typeof window.ym === "function") {
    metrikaInjected = true;
    return;
  }

  metrikaInjected = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);

  window.ym = window.ym || function ymStub(...args: unknown[]) {
    (window.ym!.a = window.ym!.a || []).push(args);
  };
  window.ym.l = Date.now();
  window.ym(YM_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  });
}
