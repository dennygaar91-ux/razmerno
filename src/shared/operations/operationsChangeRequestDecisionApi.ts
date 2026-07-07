import type { OperationsChangeRequestDecision } from "./reviewTypes";
import type { OperationsChangeRequest, OperationsOrderReview } from "./reviewTypes";

export type OperationsChangeRequestDecisionInput = {
  changeRequestId: string;
  decision: OperationsChangeRequestDecision;
};

export type OperationsChangeRequestDecisionApiResult =
  | { ok: true; changeRequest: OperationsChangeRequest; review: OperationsOrderReview | null }
  | { ok: false; message: string; status?: number };

export async function submitOperationsChangeRequestDecision(
  accessToken: string,
  input: OperationsChangeRequestDecisionInput,
): Promise<OperationsChangeRequestDecisionApiResult> {
  try {
    const response = await fetch("/api/operations/change-request-decision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as
      | {
          ok?: boolean;
          changeRequest?: OperationsChangeRequest;
          review?: OperationsOrderReview | null;
          message?: string;
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.changeRequest) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message ?? "Не удалось обработать запрос на изменение.",
      };
    }

    return {
      ok: true,
      changeRequest: payload.changeRequest,
      review: payload.review ?? null,
    };
  } catch {
    return { ok: false, message: "Не удалось обработать запрос на изменение." };
  }
}
