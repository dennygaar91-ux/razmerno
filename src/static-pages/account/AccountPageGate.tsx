import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthModal } from "../../shared/auth/AuthModal";
import {
  PRODUCTION_AUTH_MISCONFIGURED_MESSAGE,
  resolveCheckoutAuthGateDecision,
} from "../../shared/auth/checkoutAuthGate";
import { useAuth } from "../../shared/auth/useAuth";

type AccountPageGateProps = {
  children: ReactNode;
};

export function AccountPageGate({ children }: AccountPageGateProps) {
  const { configured, loading, isAuthenticated } = useAuth();
  const isProduction = import.meta.env.PROD;
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const gateDecision = resolveCheckoutAuthGateDecision({
    isProduction,
    isAuthConfigured: configured,
    isAuthenticated,
  });

  useEffect(() => {
    if (loading) return;
    if (gateDecision === "require_auth") {
      setAuthModalOpen(true);
    }
  }, [gateDecision, loading]);

  if (!configured && isProduction) {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Личный кабинет</h1>
        <p className="rzm-account-panel-text">{PRODUCTION_AUTH_MISCONFIGURED_MESSAGE}</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rzm-account-panel" aria-live="polite">
        <p className="rzm-account-panel-text">Загружаем сессию…</p>
      </section>
    );
  }

  if (gateDecision === "require_auth" || !isAuthenticated) {
    return (
      <>
        <section className="rzm-account-panel" aria-live="polite">
          <h1 className="rzm-account-panel-title">Личный кабинет</h1>
          <p className="rzm-account-panel-text">
            Войдите или зарегистрируйтесь, чтобы увидеть проекты, заказы и профиль.
          </p>
          <div className="rzm-account-panel-actions">
            <button
              type="button"
              className="rzm-ui-btn rzm-ui-btn--secondary"
              onClick={() => setAuthModalOpen(true)}
            >
              Войти
            </button>
            <a className="rzm-secondary-cta" href="/configurator">
              Открыть конструктор
            </a>
          </div>
        </section>
        <AuthModal
          open={authModalOpen}
          initialMode="login"
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return <>{children}</>;
}
