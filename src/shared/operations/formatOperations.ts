export function formatOperationsPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function formatOperationsDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(date);
}
