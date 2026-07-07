export type OperationsOrderCompletionResult = {
  orderId: string;
  domainStatus: string;
  legacyStatus: string;
  note: string | null;
};

export type OperationsOrderCompletionApiResult =
  | { ok: true; completion: OperationsOrderCompletionResult; review: unknown }
  | { ok: false; message: string; status?: number };

export async function submitOperationsOrderCompletion(
  accessToken: string,
  input: { orderId: string; note?: string | null },
): Promise<OperationsOrderCompletionApiResult> {
  try {
    const response = await fetch("/api/operations/order-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId: input.orderId,
        note: input.note ?? null,
      }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      completion?: OperationsOrderCompletionResult;
      review?: unknown;
    };

    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        status: response.status,
        message: payload.message ?? "Не удалось завершить заказ.",
      };
    }

    return {
      ok: true,
      completion: payload.completion as OperationsOrderCompletionResult,
      review: payload.review,
    };
  } catch {
    return { ok: false, message: "Не удалось завершить заказ." };
  }
}
