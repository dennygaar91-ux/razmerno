export const ASSEMBLY_RATE = 0.1;

export type AssemblyQuote = {
  enabled: boolean;
  rate: number;
  basePrice: number;
  price: number;
  message: string;
};

export function calculateAssemblyQuote(enabled: boolean, basePrice: number): AssemblyQuote {
  const safeBase = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 0;
  const price = enabled ? Math.round(safeBase * ASSEMBLY_RATE) : 0;

  return {
    enabled,
    rate: ASSEMBLY_RATE,
    basePrice: safeBase,
    price,
    message: enabled
      ? `Сборка: 10% от стоимости шкафа — ${price.toLocaleString("ru-RU")} ₽`
      : "Сборку можно добавить позже",
  };
}

export function validateAssembly(enabled: boolean, basePrice: number): string | null {
  if (!enabled) return null;
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return "Не удалось рассчитать сборку: стоимость шкафа должна быть больше 0";
  }
  return null;
}
