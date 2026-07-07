import { useState, type FormEvent } from "react";
import {
  formatWorkspaceDate,
} from "../../shared/workspace/formatWorkspace";
import {
  CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH,
  CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS,
  getCustomerChangeRequestStatusLabel,
  getCustomerChangeRequestSuccessMessage,
  getCustomerChangeRequestIneligibleMessage,
  getCustomerChangeRequestTypeLabel,
  getCustomerChangeRequestsEmptyMessage,
  type CustomerChangeRequest,
  type CustomerChangeRequestType,
} from "../../shared/workspace/changeRequestTypes";
import { useCustomerChangeRequests } from "../../shared/workspace/useCustomerChangeRequests";

function CustomerChangeRequestHistoryItem({ request }: { request: CustomerChangeRequest }) {
  return (
    <li className="rzm-account-change-request-item">
      <div className="rzm-account-change-request-head">
        <p className="rzm-account-change-request-type">
          {getCustomerChangeRequestTypeLabel(request.requestType)}
        </p>
        <p className="rzm-account-change-request-meta">
          {formatWorkspaceDate(request.createdAt)} · {getCustomerChangeRequestStatusLabel(request.status)}
        </p>
      </div>
      <p className="rzm-account-change-request-message">{request.message}</p>
    </li>
  );
}

export function CustomerOrderChangeRequestsSection({
  orderId,
  changeRequestAllowed,
}: {
  orderId: string;
  changeRequestAllowed: boolean;
}) {
  const {
    state,
    changeRequests,
    errorMessage,
    submitting,
    reload,
    submitChangeRequest,
  } = useCustomerChangeRequests(orderId, true);

  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState<CustomerChangeRequestType>("dimensions");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setRequestType("dimensions");
    setMessage("");
    setValidationError(null);
    setSubmitError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setValidationError("Сообщение не может быть пустым.");
      return;
    }

    if (trimmedMessage.length > CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH) {
      setValidationError("Сообщение слишком длинное.");
      return;
    }

    setValidationError(null);

    const result = await submitChangeRequest({
      requestType,
      message: trimmedMessage,
    });

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    setShowForm(false);
    resetForm();
    setSuccessMessage(getCustomerChangeRequestSuccessMessage());
  };

  return (
    <section className="rzm-account-section" aria-labelledby="order-change-requests-title">
      <div className="rzm-account-section-head rzm-account-section-head--with-actions">
        <div>
          <h2 id="order-change-requests-title">Изменения заказа</h2>
          <p className="rzm-step-text">Запросы на изменение уже отправленной заявки.</p>
        </div>
        {!showForm && changeRequestAllowed ? (
          <button
            type="button"
            className="rzm-ui-btn rzm-ui-btn--secondary"
            onClick={() => {
              setShowForm(true);
              setSuccessMessage(null);
              setSubmitError(null);
            }}
          >
            Запросить изменение
          </button>
        ) : null}
      </div>

      {successMessage ? (
        <p className="rzm-account-profile-success" role="status">
          {successMessage}
        </p>
      ) : null}

      {state === "loading" || state === "idle" ? (
        <p className="rzm-account-panel-text">Загружаем запросы на изменение…</p>
      ) : null}

      {state === "unauthorized" ? (
        <p className="rzm-account-panel-text">{errorMessage ?? "Войдите снова."}</p>
      ) : null}

      {state === "error" ? (
        <div className="rzm-account-panel-actions">
          <p className="rzm-account-panel-text">{errorMessage ?? "Не удалось загрузить запросы."}</p>
          <button type="button" className="rzm-ui-btn rzm-ui-btn--secondary" onClick={() => void reload()}>
            Повторить
          </button>
        </div>
      ) : null}

      {!changeRequestAllowed ? (
        <p className="rzm-account-panel-text" data-testid="change-request-ineligible">
          {getCustomerChangeRequestIneligibleMessage()}
        </p>
      ) : null}

      {changeRequestAllowed && showForm ? (
        <form className="rzm-account-change-request-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="rzm-auth-field">
            <span>Тип изменения</span>
            <select
              value={requestType}
              onChange={(event) => setRequestType(event.target.value as CustomerChangeRequestType)}
            >
              {CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="rzm-auth-field">
            <span>Сообщение</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH}
              rows={4}
              required
              placeholder="Опишите, что нужно изменить в заказе."
            />
          </label>

          {validationError ? (
            <p className="rzm-auth-modal-error" role="alert">
              {validationError}
            </p>
          ) : null}

          {submitError ? (
            <p className="rzm-auth-modal-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="rzm-account-panel-actions">
            <button type="submit" className="rzm-ui-btn rzm-ui-btn--primary" disabled={submitting}>
              {submitting ? "Отправляем…" : "Отправить"}
            </button>
            <button
              type="button"
              className="rzm-ui-btn rzm-ui-btn--secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {state === "success" ? (
        changeRequests.length === 0 ? (
          <p className="rzm-account-empty">{getCustomerChangeRequestsEmptyMessage()}</p>
        ) : (
          <ul className="rzm-account-change-request-list">
            {changeRequests.map((request) => (
              <CustomerChangeRequestHistoryItem key={request.id} request={request} />
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}
