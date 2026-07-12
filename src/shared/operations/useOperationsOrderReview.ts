import { useCallback, useEffect, useState } from "react";
import { fetchOperationsOrderReview } from "./operationsReviewApi";
import type { OperationsOrderReview, OperationsOrderReviewLoadState } from "./reviewTypes";
import {
  getOperationsOrderReviewErrorMessage,
  getOperationsOrderReviewNotFoundMessage,
} from "./reviewTypes";

export function useOperationsOrderReview(accessToken: string | null, orderId: string | null) {
  const [state, setState] = useState<OperationsOrderReviewLoadState>("idle");
  const [review, setReview] = useState<OperationsOrderReview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken || !orderId) {
      setReview(null);
      setState("idle");
      setErrorMessage(null);
      return;
    }

    setState("loading");
    setErrorMessage(null);

    const result = await fetchOperationsOrderReview(accessToken, orderId);
    if (!result.ok) {
      setReview(null);
      if (result.status === 401) {
        setState("unauthorized");
        setErrorMessage("Сессия истекла. Войдите снова.");
      } else if (result.status === 404) {
        setState("not_found");
        setErrorMessage(getOperationsOrderReviewNotFoundMessage());
      } else {
        setState("error");
        setErrorMessage(result.message || getOperationsOrderReviewErrorMessage());
      }
      return;
    }

    setReview(result.data);
    setState("success");
  }, [accessToken, orderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    state,
    review,
    errorMessage,
    reload,
  };
}
