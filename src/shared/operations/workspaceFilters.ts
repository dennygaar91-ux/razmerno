import type { OperationsWorkspaceOrder } from "./types";

export type OperationsDomainStatusFilter = "all" | "Проверка" | "Оплата" | "Отмена";

export const OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS: Array<{
  id: OperationsDomainStatusFilter;
  label: string;
}> = [
  { id: "all", label: "Все" },
  { id: "Проверка", label: "Проверка" },
  { id: "Оплата", label: "Оплата" },
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

export function getOperationsDomainStatusBadgeTone(domainStatus: string): "review" | "payment" | "cancelled" | "neutral" {
  if (domainStatus === "Проверка") return "review";
  if (domainStatus === "Оплата") return "payment";
  if (domainStatus === "Отмена") return "cancelled";
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
