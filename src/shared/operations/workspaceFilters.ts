import type { OperationsWorkspaceOrder } from "./types";

export type OperationsDomainStatusFilter =
  | "all"
  | "Проверка"
  | "Оплата"
  | "В работе"
  | "Завершено"
  | "Отмена";

export const OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS: Array<{
  id: OperationsDomainStatusFilter;
  label: string;
}> = [
  { id: "all", label: "Все" },
  { id: "Проверка", label: "Проверка" },
  { id: "Оплата", label: "Оплата" },
  { id: "В работе", label: "В работе" },
  { id: "Завершено", label: "Завершено" },
  { id: "Отмена", label: "Отмена" },
];

export function getOperationsDomainStatusLabel(domainStatus: string): string {
  if (domainStatus === "Проверка") return "Проверка";
  if (domainStatus === "Оплата") return "Оплата";
  if (domainStatus === "Отмена") return "Отмена";
  if (domainStatus === "В работе") return "В работе";
  if (domainStatus === "Завершено") return "Завершено";
  if (domainStatus === "Черновик") return "Черновик";
  return domainStatus || "—";
}

export function getOperationsDomainStatusBadgeTone(
  domainStatus: string,
): "review" | "payment" | "cancelled" | "in_progress" | "completed" | "neutral" {
  if (domainStatus === "Проверка") return "review";
  if (domainStatus === "Оплата") return "payment";
  if (domainStatus === "Отмена") return "cancelled";
  if (domainStatus === "В работе") return "in_progress";
  if (domainStatus === "Завершено") return "completed";
  return "neutral";
}

export function filterOperationsWorkspaceByDomainStatus(
  orders: OperationsWorkspaceOrder[],
  filter: OperationsDomainStatusFilter,
): OperationsWorkspaceOrder[] {
  if (filter === "all") return orders;
  return orders.filter((order) => order.domainStatus === filter);
}

export function getOperationsWorkspaceFilteredEmptyMessage(filter: OperationsDomainStatusFilter): string {
  if (filter === "all") return "Очередь заявок пока пуста.";
  return `Заявок со статусом «${filter}» пока нет.`;
}

export type OperationsDomainStatusCounts = Record<OperationsDomainStatusFilter, number>;

export function countOperationsWorkspaceByDomainStatus(
  orders: OperationsWorkspaceOrder[],
): OperationsDomainStatusCounts {
  return {
    all: orders.length,
    Проверка: orders.filter((order) => order.domainStatus === "Проверка").length,
    Оплата: orders.filter((order) => order.domainStatus === "Оплата").length,
    "В работе": orders.filter((order) => order.domainStatus === "В работе").length,
    Завершено: orders.filter((order) => order.domainStatus === "Завершено").length,
    Отмена: orders.filter((order) => order.domainStatus === "Отмена").length,
  };
}

export function formatOperationsDomainStatusFilterLabel(
  label: string,
  count: number,
): string {
  return `${label} ${count}`;
}
