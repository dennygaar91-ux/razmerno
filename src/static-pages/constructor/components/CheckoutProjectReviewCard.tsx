import type { ConstructorValidationState } from "../types";
import { buildConstructorCheckoutReviewSummary } from "../adapters/constructorCheckoutReview";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";

export function CheckoutProjectReviewCard({
  snapshot,
  validation,
}: {
  snapshot: ConstructorSnapshot;
  validation: ConstructorValidationState;
}) {
  const summary = buildConstructorCheckoutReviewSummary(snapshot, validation);
  const reviewRows = [
    { label: "Тип", value: summary.furnitureLabel },
    { label: "Размеры", value: summary.dimensionsText },
    { label: "Структура", value: summary.layoutText },
    { label: "Наполнение", value: summary.fillingText },
    { label: "Фасады", value: summary.facadeText },
  ];
  const materialRows = [
    { label: "Корпус", value: summary.bodyMaterialText },
    { label: "Фасады", value: summary.facadeMaterialText },
    { label: "Задняя стенка", value: summary.backPanelMaterialText },
  ];

  return (
    <section className="rzm-constructor-card rzm-checkout-review-card rzm-r18-review-card rzm-r28-review-card">
      <details className="rzm-r28-review-details">
        <summary>
          <span>
            <b>Что отправится менеджеру</b>
            <em>{summary.dimensionsText} · {summary.layoutText}</em>
          </span>
          <strong className={`rzm-checkout-review-status rzm-checkout-review-status--${summary.validationTone}`}>
            {summary.validationStatusText}
          </strong>
        </summary>

        <div className="rzm-r18-review-list rzm-r28-review-list" aria-label="Сводка проекта">
          {reviewRows.map((row) => (
            <span key={row.label}>
              <b>{row.label}</b>
              <strong>{row.value}</strong>
            </span>
          ))}
        </div>

        <div className="rzm-r18-material-strip rzm-r28-material-strip" aria-label="Материалы проекта">
          {materialRows.map((row) => (
            <span key={row.label}>
              <b>{row.label}</b>
              <strong>{row.value}</strong>
            </span>
          ))}
        </div>
      </details>
    </section>
  );
}
