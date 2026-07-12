import { useEffect, useState, type FormEvent } from "react";
import { patchCustomerProfile } from "../../shared/auth/profileApi";
import { useSessionContext } from "../../shared/auth/SessionProvider";
import type { CustomerWorkspaceProfile } from "../../shared/workspace/types";

type CustomerProfileSectionProps = {
  profile: CustomerWorkspaceProfile;
  onProfileUpdated: (profile: CustomerWorkspaceProfile) => void;
};

export function CustomerProfileSection({ profile, onProfileUpdated }: CustomerProfileSectionProps) {
  const { session } = useSessionContext();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editing) return;
    setFullName(profile.fullName);
    setPhone(profile.phone ?? "");
  }, [editing, profile.fullName, profile.phone]);

  const startEditing = () => {
    setEditing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFullName(profile.fullName);
    setPhone(profile.phone ?? "");
  };

  const cancelEditing = () => {
    setEditing(false);
    setErrorMessage(null);
    setFullName(profile.fullName);
    setPhone(profile.phone ?? "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accessToken = session?.access_token;
    if (!accessToken) {
      setErrorMessage("Сессия истекла. Войдите снова.");
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage("Имя не может быть пустым.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await patchCustomerProfile(accessToken, {
      full_name: trimmedName,
      phone: phone.trim() || null,
    });

    setSaving(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    const updatedProfile: CustomerWorkspaceProfile = {
      fullName: result.data.full_name,
      email: result.data.email,
      phone: result.data.phone,
    };

    onProfileUpdated(updatedProfile);
    setEditing(false);
    setSuccessMessage("Профиль сохранён.");
  };

  return (
    <section className="rzm-account-section" aria-labelledby="account-profile-title">
      <div className="rzm-account-section-head rzm-account-section-head--with-actions">
        <div>
          <h2 id="account-profile-title">Профиль</h2>
          <p className="rzm-step-text">Контактные данные аккаунта.</p>
        </div>
        {!editing ? (
          <button
            type="button"
            className="rzm-ui-btn rzm-ui-btn--secondary"
            onClick={startEditing}
          >
            Редактировать
          </button>
        ) : null}
      </div>

      {successMessage && !editing ? (
        <p className="rzm-account-profile-success" role="status">
          {successMessage}
        </p>
      ) : null}

      {editing ? (
        <form className="rzm-account-profile-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="rzm-auth-field">
            <span>Имя</span>
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={200}
              required
            />
          </label>

          <label className="rzm-auth-field">
            <span>Email</span>
            <input type="email" name="email" value={profile.email} readOnly aria-readonly="true" />
          </label>
          <p className="rzm-account-profile-hint">Email меняется только через поддержку.</p>

          <label className="rzm-auth-field">
            <span>Телефон</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={32}
              placeholder="+7 900 000-00-00"
            />
          </label>

          {errorMessage ? (
            <p className="rzm-auth-modal-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="rzm-account-panel-actions">
            <button type="submit" className="rzm-ui-btn rzm-ui-btn--primary" disabled={saving}>
              {saving ? "Сохраняем…" : "Сохранить"}
            </button>
            <button
              type="button"
              className="rzm-ui-btn rzm-ui-btn--secondary"
              onClick={cancelEditing}
              disabled={saving}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <dl className="rzm-account-profile">
          <div>
            <dt>Имя</dt>
            <dd>{profile.fullName || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{profile.phone || "Не указан"}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
