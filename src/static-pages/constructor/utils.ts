export function formatFallbackPrice(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

export function formatRuPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return "";

  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  const a = normalized.slice(1, 4);
  const b = normalized.slice(4, 7);
  const c = normalized.slice(7, 9);
  const d = normalized.slice(9, 11);

  return `+7${a ? ` (${a}` : ""}${a.length === 3 ? ")" : ""}${b ? ` ${b}` : ""}${c ? `-${c}` : ""}${d ? `-${d}` : ""}`;
}
