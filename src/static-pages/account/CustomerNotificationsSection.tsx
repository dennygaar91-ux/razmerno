import { formatWorkspaceDate } from "../../shared/workspace/formatWorkspace";
import {
  getCustomerNotificationReadLabel,
  getCustomerNotificationTypeLabel,
  getCustomerNotificationsEmptyMessage,
  getCustomerNotificationsErrorMessage,
  type CustomerNotification,
} from "../../shared/workspace/notificationTypes";
import { useCustomerNotifications } from "../../shared/workspace/useCustomerNotifications";

function CustomerNotificationCard({ notification }: { notification: CustomerNotification }) {
  const readClass = notification.isRead
    ? "rzm-account-notification-item--read"
    : "rzm-account-notification-item--unread";

  return (
    <li
      className={`rzm-account-notification-item ${readClass}`}
      aria-label={getCustomerNotificationReadLabel(notification.isRead)}
    >
      <div className="rzm-account-notification-head">
        <p className="rzm-account-notification-title">{notification.title}</p>
        <p className="rzm-account-notification-meta">
          {getCustomerNotificationTypeLabel(notification.type)} · {formatWorkspaceDate(notification.createdAt)}
        </p>
      </div>
      <p className="rzm-account-notification-message">{notification.message}</p>
      <p className="rzm-account-notification-read-state">
        {getCustomerNotificationReadLabel(notification.isRead)}
      </p>
    </li>
  );
}

export function CustomerNotificationsSection() {
  const { state, notifications, errorMessage, retry } = useCustomerNotifications(true);

  return (
    <section className="rzm-account-section" aria-labelledby="account-notifications-title">
      <div className="rzm-account-section-head">
        <h2 id="account-notifications-title">Уведомления</h2>
        <p className="rzm-step-text">События по вашим заказам и запросам.</p>
      </div>

      {state === "loading" || state === "idle" ? (
        <p className="rzm-account-panel-text">Загружаем уведомления…</p>
      ) : null}

      {state === "unauthorized" ? (
        <p className="rzm-account-panel-text">{errorMessage ?? "Войдите снова."}</p>
      ) : null}

      {state === "error" ? (
        <div className="rzm-account-panel-actions">
          <p className="rzm-account-panel-text">{errorMessage ?? getCustomerNotificationsErrorMessage()}</p>
          <button type="button" className="rzm-ui-btn rzm-ui-btn--secondary" onClick={() => void retry()}>
            Повторить
          </button>
        </div>
      ) : null}

      {state === "empty" ? (
        <p className="rzm-account-empty">{getCustomerNotificationsEmptyMessage()}</p>
      ) : null}

      {state === "success" ? (
        <ul className="rzm-account-notification-list">
          {notifications.map((notification) => (
            <CustomerNotificationCard key={notification.id} notification={notification} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
