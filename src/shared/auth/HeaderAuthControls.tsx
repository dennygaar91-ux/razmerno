import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

type HeaderAuthControlsProps = {
  className?: string;
  compact?: boolean;
};

export function HeaderAuthControls({ className, compact = false }: HeaderAuthControlsProps) {
  const { configured, loading, isAuthenticated, signOut } = useAuth();
  const { displayName } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");

  if (!configured || loading) return null;

  const rootClassName = ["rzm-header-auth", className].filter(Boolean).join(" ");

  if (isAuthenticated) {
    return (
      <div className={rootClassName} aria-label="Аккаунт">
        <span className="rzm-header-auth-user" title={displayName ?? undefined}>
          {compact ? "Аккаунт" : displayName ?? "Аккаунт"}
        </span>
        <button type="button" className="rzm-ui-btn rzm-ui-btn--ghost rzm-header-auth-logout" onClick={() => void signOut()}>
          Выйти
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={rootClassName} aria-label="Вход и регистрация">
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--ghost rzm-header-auth-login"
          onClick={() => {
            setModalMode("login");
            setModalOpen(true);
          }}
        >
          Войти
        </button>
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--secondary rzm-header-auth-register"
          onClick={() => {
            setModalMode("register");
            setModalOpen(true);
          }}
        >
          Регистрация
        </button>
      </div>
      <AuthModal open={modalOpen} initialMode={modalMode} onClose={() => setModalOpen(false)} />
    </>
  );
}
