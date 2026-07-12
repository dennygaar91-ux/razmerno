import { formatWorkspaceDate } from "../../shared/workspace/formatWorkspace";
import type { CustomerOrderStatus } from "../../shared/workspace/customerOrderStatus";
import { getCustomerOrderStatusFallbackLabel } from "../../shared/workspace/customerOrderStatus";

const HAPPY_PATH_STEPS = [
  { id: "review", label: "На проверке" },
  { id: "payment", label: "Ожидает оплаты" },
  { id: "in_progress", label: "В работе" },
  { id: "completed", label: "Завершено" },
] as const;

const HAPPY_PATH_STAGE_ORDER = ["review", "payment", "in_progress", "completed"] as const;

function getCustomerOrderStatusTimelineSteps(status: CustomerOrderStatus) {
  if (status.stage === "cancelled") {
    return [{ id: "cancelled", label: "Отменён", state: "current" as const }];
  }

  const currentIndex = HAPPY_PATH_STAGE_ORDER.indexOf(
    status.stage as (typeof HAPPY_PATH_STAGE_ORDER)[number],
  );

  if (currentIndex === -1) {
    return HAPPY_PATH_STEPS.map((step) => ({
      ...step,
      state: step.id === status.stage ? ("current" as const) : ("inactive" as const),
    }));
  }

  return HAPPY_PATH_STEPS.map((step, index) => {
    if (index < currentIndex) {
      return { ...step, state: "complete" as const };
    }
    if (index === currentIndex) {
      return { ...step, state: "current" as const };
    }
    return { ...step, state: "inactive" as const };
  });
}

export function CustomerOrderStatusTimeline({
  status,
  createdAt,
}: {
  status: CustomerOrderStatus;
  createdAt: string;
}) {
  const steps = getCustomerOrderStatusTimelineSteps(status);
  const label = status.label || getCustomerOrderStatusFallbackLabel();

  return (
    <section className="rzm-account-section" aria-labelledby="order-status-timeline-title">
      <div className="rzm-account-section-head">
        <h2 id="order-status-timeline-title">Статус заявки</h2>
        <p className="rzm-step-text">{status.description}</p>
      </div>

      <div className="rzm-account-order-status-current" data-status-stage={status.stage}>
        <p className="rzm-account-order-status-label">{label}</p>
        <p className="rzm-account-notification-meta">Обновлено: {formatWorkspaceDate(createdAt)}</p>
      </div>

      <ol className="rzm-account-order-status-timeline">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`rzm-account-order-status-step rzm-account-order-status-step--${step.state}`}
            aria-current={step.state === "current" ? "step" : undefined}
          >
            <span className="rzm-account-order-status-step-label">{step.label}</span>
          </li>
        ))}
      </ol>

      {status.nextStep ? (
        <p className="rzm-account-order-status-next">{status.nextStep}</p>
      ) : (
        <p className="rzm-account-order-status-next">Дополнительных действий с вашей стороны пока не требуется.</p>
      )}
    </section>
  );
}
