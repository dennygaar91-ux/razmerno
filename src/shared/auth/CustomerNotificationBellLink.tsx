import { useCustomerNotificationUnreadCount } from "../workspace/useCustomerNotificationUnreadCount";

export function CustomerNotificationBellLink({ compact = false }: { compact?: boolean }) {
  const { unreadCount } = useCustomerNotificationUnreadCount(true);
  const label = compact ? "Уведомления" : "Уведомления";

  return (
    <a
      className="rzm-header-notification-bell"
      href="/account#account-notifications-title"
      aria-label={unreadCount > 0 ? `${label}: ${unreadCount} непрочитанных` : label}
      title={label}
    >
      <span aria-hidden="true">🔔</span>
      {unreadCount > 0 ? (
        <span className="rzm-header-notification-badge" data-testid="customer-notification-unread-badge">
          {unreadCount}
        </span>
      ) : null}
    </a>
  );
}
