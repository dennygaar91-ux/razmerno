export type CustomerNotificationType =
  | "order_created"
  | "order_updated"
  | "change_request"
  | "system";

export type CustomerNotification = {
  id: string;
  type: CustomerNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId: string | null;
};

export type CustomerNotificationListApiResult =
  | { ok: true; data: CustomerNotification[] }
  | { ok: false; message: string; status?: number };

export type CustomerNotificationReadApiResult =
  | { ok: true; data: CustomerNotification }
  | { ok: false; message: string; status?: number };

export type CustomerNotificationReadAllApiResult =
  | { ok: true; updatedCount: number }
  | { ok: false; message: string; status?: number };

const CUSTOMER_NOTIFICATION_TYPE_LABELS: Record<CustomerNotificationType, string> = {
  order_created: "Заказ создан",
  order_updated: "Заказ обновлён",
  change_request: "Запрос на изменение",
  system: "Системное уведомление",
};

export function getCustomerNotificationTypeLabel(type: CustomerNotificationType): string {
  return CUSTOMER_NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export function getCustomerNotificationsEmptyMessage(): string {
  return "Пока уведомлений нет.";
}

export function getCustomerNotificationsErrorMessage(): string {
  return "Не удалось загрузить уведомления.";
}

export function getCustomerNotificationReadLabel(isRead: boolean): string {
  return isRead ? "Прочитано" : "Непрочитано";
}
