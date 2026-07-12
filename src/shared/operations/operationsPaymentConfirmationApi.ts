export type OperationsPaymentConfirmationResult = {
  orderId: string;
  domainStatus: string;
  legacyStatus: string;
  note: string | null;
};

export type OperationsPaymentConfirmationApiResult =
  | { ok: true; confirmation: OperationsPaymentConfirmationResult; review: unknown }
  | { ok: false; message: string; status?: number };

export async function submitOperationsPaymentConfirmation(
  accessToken: string,
  input: { orderId: string; note?: string | null },
): Promise<OperationsPaymentConfirmationApiResult> {
  try {
    const response = await fetch("/api/operations/payment-confirmation", {
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
      confirmation?: OperationsPaymentConfirmationResult;
      review?: unknown;
    };

    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        status: response.status,
        message: payload.message ?? "Не удалось подтвердить оплату.",
      };
    }

    return {
      ok: true,
      confirmation: payload.confirmation as OperationsPaymentConfirmationResult,
      review: payload.review,
    };
  } catch {
    return { ok: false, message: "Не удалось подтвердить оплату." };
  }
}
