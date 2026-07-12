import type { CustomerWorkspace } from "./types";

export function formatWorkspacePrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWorkspaceDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatFurnitureTypeLabel(value: string | null): string {
  if (!value) return "Проект";
  const labels: Record<string, string> = {
    wardrobe: "Шкаф",
    dresser: "Комод",
    nightstand: "Тумба",
    cabinet: "Тумба / модуль",
  };
  return labels[value] ?? value;
}

export function getAccountProjectsEmptyMessage(): string {
  return "Пока нет активных проектов. Сохраните конфигурацию в конструкторе после входа.";
}

export function getAccountOrdersEmptyMessage(): string {
  return "Пока нет отправленных заказов. Оформите заявку в конструкторе после входа.";
}

export function isWorkspaceFullyEmpty(workspace: CustomerWorkspace): boolean {
  return workspace.stats.activeProjects === 0 && workspace.stats.orders === 0;
}

export function getAccountDashboardTitle(profileFullName: string): string {
  const trimmed = profileFullName.trim();
  return trimmed ? `Здравствуйте, ${trimmed}` : "Личный кабинет";
}
