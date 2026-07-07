import { formatWorkspaceDate } from "../../shared/workspace/formatWorkspace";
import type { CustomerOrderStatus } from "../../shared/workspace/customerOrderStatus";
import { getCustomerOrderStatusFallbackLabel } from "../../shared/workspace/customerOrderStatus";

function getCustomerOrderStatusTimelineSteps(status: CustomerOrderStatus) {
  const steps = [
    { id: "review", label: "На проверке" },
    { id: "payment", label: "Ожидает оплаты" },
    { id: "cancelled", label: "Отменён" },
  ] as const;

  if (status.stage === "cancelled") {
    return steps.map((step) => ({
      ...step,
      state: step.id === "cancelled" ? ("current" as const) : ("inactive" as const),
    }));
  }

  return steps
    .filter((step) => step.id !== "cancelled")
    .map((step) => ({
      ...step,
      state:
        step.id === status.stage
          ? ("current" as const)
          : status.stage === "payment" && step.id === "review"
            ? ("complete" as const)
            : ("inactive" as const),
    }));
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
