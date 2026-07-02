import { useCallback, useEffect, useState } from "react";
import { AuthModal } from "./AuthModal";
import {
  PRODUCTION_AUTH_MISCONFIGURED_MESSAGE,
  resolveCheckoutAuthGateDecision,
  resolveCheckoutSubmitAfterAuth,
} from "./checkoutAuthGate";
import { useAuth } from "./useAuth";
import type { AuthMode } from "./types";

export function useCheckoutAuthGate(submit: () => void | Promise<void>) {
  const { configured: authConfigured, isAuthenticated } = useAuth();
  const isProduction = import.meta.env.PROD;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>("login");
  const [pendingCheckoutSubmit, setPendingCheckoutSubmit] = useState(false);
  const [authGateError, setAuthGateError] = useState<string | null>(null);

  const attemptCheckoutSubmit = useCallback(() => {
    const decision = resolveCheckoutAuthGateDecision({
      isProduction,
      isAuthConfigured: authConfigured,
      isAuthenticated,
    });

    if (decision === "blocked_misconfigured") {
      setAuthGateError(PRODUCTION_AUTH_MISCONFIGURED_MESSAGE);
      return decision;
    }

    if (decision === "require_auth") {
      setAuthGateError(null);
      setAuthModalMode("login");
      setPendingCheckoutSubmit(true);
      setAuthModalOpen(true);
      return decision;
    }

    setAuthGateError(null);
    void submit();
    return decision;
  }, [authConfigured, isAuthenticated, isProduction, submit]);

  useEffect(() => {
    if (
      resolveCheckoutSubmitAfterAuth({
        pendingSubmit: pendingCheckoutSubmit,
        isAuthenticated,
      }) !== "submit"
    ) {
      return;
    }

    const decision = resolveCheckoutAuthGateDecision({
      isProduction,
      isAuthConfigured: authConfigured,
      isAuthenticated,
    });

    setPendingCheckoutSubmit(false);
    setAuthModalOpen(false);

    if (decision === "blocked_misconfigured") {
      setAuthGateError(PRODUCTION_AUTH_MISCONFIGURED_MESSAGE);
      return;
    }

    setAuthGateError(null);
    void submit();
  }, [authConfigured, isAuthenticated, isProduction, pendingCheckoutSubmit, submit]);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setPendingCheckoutSubmit(false);
  }, []);

  const checkoutAuthModal = (
    <AuthModal
      open={authModalOpen}
      initialMode={authModalMode}
      title="Войдите, чтобы отправить заявку"
      description="Конструктор сохранит текущую конфигурацию. После входа вы вернётесь к оформлению заказа."
      onClose={closeAuthModal}
      onSuccess={() => setAuthModalOpen(false)}
    />
  );

  return {
    authGateError,
    attemptCheckoutSubmit,
    checkoutAuthModal,
  };
}
