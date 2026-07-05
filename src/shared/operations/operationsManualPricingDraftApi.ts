import type { OperationsManualPricingDraft } from "./reviewTypes";

const DEFAULT_MANUAL_PRICING_DRAFT_API_URL = "/api/operations/manual-pricing-draft";

export type SaveManualPricingDraftResult =
  | { ok: true; data: OperationsManualPricingDraft }
  | { ok: false; status?: number; message: string };

export async function saveOperationsManualPricingDraft(
  accessToken: string,
  input: { orderId: string; manualTotalPrice: number; reason: string | null },
): Promise<SaveManualPricingDraftResult> {
  try {
    const response = await fetch(
      import.meta.env.VITE_OPERATIONS_MANUAL_PRICING_DRAFT_API_URL?.trim() || DEFAULT_MANUAL_PRICING_DRAFT_API_URL,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(input),
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; manualPricingDraft?: OperationsManualPricingDraft; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.manualPricingDraft) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось сохранить черновик ручной цены.",
      };
    }

    return { ok: true, data: payload.manualPricingDraft };
  } catch {
    return { ok: false, message: "Сетевая ошибка при сохранении черновика ручной цены." };
  }
}

export function parseManualDraftPriceInput(value: string): number | null {
  const normalized = value.replace(/\s/gu, "").replace(",", ".");
  if (!normalized) return null;
  if (!/^\d+(\.\d+)?$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  const rounded = Math.round(parsed);
  if (Math.abs(parsed - rounded) > 0.0001) return null;
  if (rounded > 50_000_000) return null;
  return rounded;
}

export function isManualDraftPriceInputValid(value: string): boolean {
  return parseManualDraftPriceInput(value) !== null;
}
