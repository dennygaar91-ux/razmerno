import type { OperationsOrderReview } from "./reviewTypes";

const DEFAULT_OPERATIONS_ORDER_DECISION_API_URL = "/api/operations/order-decision";

export type OperationsOrderDecisionType = "approve" | "reject";

export type SubmitOperationsOrderDecisionResult =
  | { ok: true; data: OperationsOrderReview }
  | { ok: false; status?: number; message: string };

export async function submitOperationsOrderDecision(
  accessToken: string,
  input: { orderId: string; decision: OperationsOrderDecisionType; reason: string | null },
): Promise<SubmitOperationsOrderDecisionResult> {
  try {
    const response = await fetch(
      import.meta.env.VITE_OPERATIONS_ORDER_DECISION_API_URL?.trim() || DEFAULT_OPERATIONS_ORDER_DECISION_API_URL,
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
      | { ok?: boolean; review?: OperationsOrderReview; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.review) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось применить решение.",
      };
    }

    return { ok: true, data: payload.review };
  } catch {
    return { ok: false, message: "Сетевая ошибка при применении решения." };
  }
}

export function isOperationsRejectReasonValid(value: string): boolean {
  return value.trim().length >= 3;
}
