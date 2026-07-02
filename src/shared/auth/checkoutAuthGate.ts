export type CheckoutAuthGateDecision = "submit" | "require_auth" | "blocked_misconfigured";

export const PRODUCTION_AUTH_MISCONFIGURED_MESSAGE =
  "Авторизация недоступна из‑за ошибки конфигурации сервиса. Отправка заявки временно заблокирована. Попробуйте позже или свяжитесь с нами.";

export function resolveCheckoutAuthGateDecision(input: {
  isProduction: boolean;
  isAuthConfigured: boolean;
  isAuthenticated: boolean;
}): CheckoutAuthGateDecision {
  if (!input.isAuthConfigured) {
    if (input.isProduction) return "blocked_misconfigured";
    return "submit";
  }

  if (!input.isAuthenticated) return "require_auth";
  return "submit";
}

export function shouldRequireAuthBeforeCheckoutSubmit(input: {
  isAuthConfigured: boolean;
  isAuthenticated: boolean;
  isProduction?: boolean;
}): boolean {
  return (
    resolveCheckoutAuthGateDecision({
      isProduction: input.isProduction ?? false,
      isAuthConfigured: input.isAuthConfigured,
      isAuthenticated: input.isAuthenticated,
    }) === "require_auth"
  );
}

export function isProductionAuthMisconfigured(input: {
  isProduction: boolean;
  isAuthConfigured: boolean;
}): boolean {
  return resolveCheckoutAuthGateDecision({
    isProduction: input.isProduction,
    isAuthConfigured: input.isAuthConfigured,
    isAuthenticated: false,
  }) === "blocked_misconfigured";
}

export function resolveCheckoutSubmitAfterAuth(input: {
  pendingSubmit: boolean;
  isAuthenticated: boolean;
}): "submit" | "idle" {
  if (input.pendingSubmit && input.isAuthenticated) return "submit";
  return "idle";
}

export function shouldRestoreAnonymousConstructorState(input: {
  hadSessionBeforeAuth: boolean;
  isAuthenticated: boolean;
}): boolean {
  return !input.hadSessionBeforeAuth && input.isAuthenticated;
}
