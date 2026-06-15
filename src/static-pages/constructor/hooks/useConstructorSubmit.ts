import { useCallback, useEffect, useState } from "react";
import { submitOrder, validateCustomer } from "../../../shared/lib/order";
import { buildOrderPayloadFromConstructor, type ConstructorSnapshot } from "../adapters/constructorPayload";
import { loadPricingModules } from "../pricingLoader";
import type {
  ConstructorFormErrors,
  QuoteState,
  StepKey,
} from "../types";

interface UseConstructorSubmitArgs {
  snapshot: ConstructorSnapshot;
  quote: QuoteState | null;
  onStepChange: (step: StepKey) => void;
  onDraftSave: () => void;
}

const RESUBMIT_COOLDOWN_MS = 30_000;
const INITIAL_SUBMIT_MESSAGE = "Перед отправкой менеджер всё равно проверит конфигурацию и уточнит детали.";

export function useConstructorSubmit({
  snapshot,
  quote,
  onStepChange,
  onDraftSave,
}: UseConstructorSubmitArgs) {
  const [errors, setErrors] = useState<ConstructorFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState(INITIAL_SUBMIT_MESSAGE);
  const [lastSuccessAt, setLastSuccessAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!lastSuccessAt) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lastSuccessAt]);

  const cooldownRemainingMs = lastSuccessAt
    ? Math.max(0, RESUBMIT_COOLDOWN_MS - (nowMs - lastSuccessAt))
    : 0;
  const isCooldownActive = cooldownRemainingMs > 0;

  const resetSubmitState = useCallback(() => {
    setErrors({});
    setSubmitStatus("idle");
    setSubmitMessage(INITIAL_SUBMIT_MESSAGE);
    setLastSuccessAt(null);
    setNowMs(Date.now());
  }, []);

  const submit = useCallback(async () => {
    if (isCooldownActive) {
      setSubmitStatus("success");
      setSubmitMessage(`Заявка уже отправлена. Повторная отправка будет доступна через ${Math.ceil(cooldownRemainingMs / 1000)} сек.`);
      return;
    }

    setSubmitStatus("idle");
    setSubmitMessage("");

    const pricing = await loadPricingModules();
    const customerErrors = validateCustomer(snapshot.contact);
    const deliveryError = pricing.validateDelivery(snapshot.deliveryEnabled, snapshot.deliveryAddress);
    const nextErrors: ConstructorFormErrors = {
      name: customerErrors.name,
      phone: customerErrors.phone,
      email: customerErrors.email,
      deliveryAddress: deliveryError || undefined,
      consent: snapshot.consent ? undefined : "Нужно согласие на обработку персональных данных",
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.phone || nextErrors.email || nextErrors.deliveryAddress || nextErrors.consent) {
      onStepChange("checkout");
      setSubmitStatus("error");
      setSubmitMessage(nextErrors.consent || "Проверьте обязательные поля.");
      return;
    }

    if (!quote) {
      setSubmitStatus("error");
      setSubmitMessage("Стоимость ещё рассчитывается. Попробуйте через пару секунд.");
      return;
    }

    setSubmitStatus("submitting");
    setSubmitMessage("Отправляем заявку");

    const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
      source: "constructor-store-adapter",
    });

    const result = await submitOrder(payload);

    if (result.ok) {
      setSubmitStatus("success");
      setLastSuccessAt(Date.now());
      setNowMs(Date.now());
      setSubmitMessage(`Заявка ${result.orderId ?? ""} отправлена. Мы свяжемся с вами для проверки размеров и сметы.`);
      onDraftSave();
      return;
    }

    setSubmitStatus("error");
    setSubmitMessage(result.error || "Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram.");
  }, [
    snapshot,
    onDraftSave,
    onStepChange,
    quote,
    isCooldownActive,
    cooldownRemainingMs,
  ]);

  return {
    errors,
    submitStatus,
    submitMessage,
    submit,
    resetSubmitState,
    isCooldownActive,
    cooldownRemainingMs,
  };
}
