export const CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH = 2000;

export type CustomerChangeRequestType =
  | "dimensions"
  | "materials"
  | "configuration"
  | "delivery"
  | "other";

export type CustomerChangeRequestStatus = "submitted" | "reviewed" | "resolved" | "rejected";

export type CustomerChangeRequest = {
  id: string;
  orderId: string;
  requestType: CustomerChangeRequestType;
  status: CustomerChangeRequestStatus;
  message: string;
  createdAt: string;
};

export type CustomerChangeRequestCreateInput = {
  orderId: string;
  requestType: CustomerChangeRequestType;
  message: string;
};

export type CustomerChangeRequestListApiResult =
  | { ok: true; data: CustomerChangeRequest[] }
  | { ok: false; message: string; status?: number };

export type CustomerChangeRequestCreateApiResult =
  | { ok: true; data: CustomerChangeRequest }
  | { ok: false; message: string; status?: number };

export const CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS: Array<{
  value: CustomerChangeRequestType;
  label: string;
}> = [
  { value: "dimensions", label: "Размеры" },
  { value: "materials", label: "Материалы" },
  { value: "configuration", label: "Комплектация" },
  { value: "delivery", label: "Доставка" },
  { value: "other", label: "Другое" },
];

export function getCustomerChangeRequestTypeLabel(
  requestType: CustomerChangeRequestType,
): string {
  return (
    CUSTOMER_CHANGE_REQUEST_TYPE_OPTIONS.find((option) => option.value === requestType)?.label ??
    requestType
  );
}

export function getCustomerChangeRequestStatusLabel(status: CustomerChangeRequestStatus): string {
  if (status === "submitted") return "Отправлен";
  if (status === "reviewed") return "На рассмотрении";
  if (status === "resolved") return "Принят";
  if (status === "rejected") return "Отклонён";
  return status;
}

export function getCustomerChangeRequestsEmptyMessage(): string {
  return "Пока нет запросов на изменение заказа.";
}

export function getCustomerChangeRequestSuccessMessage(): string {
  return "Запрос отправлен менеджеру.";
}

export function getCustomerChangeRequestIneligibleMessage(): string {
  return "Изменения недоступны для текущего статуса заявки.";
}
