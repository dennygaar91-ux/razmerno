export type OperationsWorkspaceOrder = {
  orderId: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  customerNameMasked: string;
  productSummary: string;
  totalPrice: number;
  productionStatus: string;
};

export type OperationsWorkspaceStats = {
  total: number;
};

export type OperationsWorkspace = {
  orders: OperationsWorkspaceOrder[];
  stats: OperationsWorkspaceStats;
};

export type OperationsWorkspaceApiResult =
  | { ok: true; data: OperationsWorkspace }
  | { ok: false; status?: number; message: string };

export type OperationsWorkspaceLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized";

export function getOperationsOrderStatusLabel(status: string): string {
  if (status === "new") return "Новая";
  if (status === "in_progress") return "В работе";
  if (status === "done") return "Закрыта";
  return status;
}

export function getOperationsWorkspaceEmptyMessage(): string {
  return "Очередь заявок пока пуста.";
}

export function getOperationsWorkspaceErrorMessage(): string {
  return "Не удалось загрузить очередь заявок.";
}
