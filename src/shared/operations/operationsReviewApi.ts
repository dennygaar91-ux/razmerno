import type { OperationsOrderReview, OperationsOrderReviewApiResult } from "./reviewTypes";

const DEFAULT_OPERATIONS_ORDER_REVIEW_API_URL = "/api/operations/order";

function getOperationsOrderReviewApiUrl(orderId: string): string {
  const base = import.meta.env.VITE_OPERATIONS_ORDER_REVIEW_API_URL?.trim() || DEFAULT_OPERATIONS_ORDER_REVIEW_API_URL;
  return `${base}?orderId=${encodeURIComponent(orderId)}`;
}

export async function fetchOperationsOrderReview(
  accessToken: string,
  orderId: string,
): Promise<OperationsOrderReviewApiResult> {
  try {
    const response = await fetch(getOperationsOrderReviewApiUrl(orderId), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; review?: OperationsOrderReview; message?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.review) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || "Не удалось загрузить manual review.",
      };
    }

    return { ok: true, data: payload.review };
  } catch {
    return { ok: false, message: "Сетевая ошибка при загрузке manual review." };
  }
}
