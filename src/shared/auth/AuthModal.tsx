import { useEffect, useId, useState, type FormEvent } from "react";
import type { AuthMode } from "./types";
import { useAuth } from "./useAuth";

type AuthModalProps = {
  open: boolean;
  initialMode?: AuthMode;
  title?: string;
  description?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AuthModal({
  open,
  initialMode = "login",
  title,
  description,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const titleId = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
  }, [initialMode, open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result =
      mode === "login"
        ? await signIn({ email, password })
        : await signUp({ email, password, fullName });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="rzm-auth-modal-root" role="presentation" onClick={onClose}>
      <div
        className="rzm-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="rzm-auth-modal-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h2 id={titleId} className="rzm-auth-modal-title">
          {title ?? (mode === "login" ? "Вход" : "Регистрация")}
        </h2>
        {description ? <p className="rzm-auth-modal-description">{description}</p> : null}

        <div className="rzm-auth-modal-tabs" role="tablist" aria-label="Режим авторизации">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form className="rzm-auth-modal-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="rzm-auth-field">
              <span>Имя и фамилия</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
          ) : null}

          <label className="rzm-auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="rzm-auth-field">
            <span>Пароль</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          {error ? (
            <p className="rzm-auth-modal-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="rzm-ui-btn rzm-ui-btn--primary rzm-auth-modal-submit" disabled={submitting}>
            {submitting ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
