import {
  getStepIssueCount,
  getStepVisualState,
  stepDescriptions,
  stepLabels,
  stepStateLabels,
} from "./Constructor3DPageMeta";
import type { ConstructorValidationState, StepKey } from "../types";

export function ConstructorStagebar({
  step,
  stepOrder,
  validation,
  runtimeLabel,
  canRenderThree,
  onStepChange,
}: {
  step: StepKey;
  stepOrder: StepKey[];
  validation: ConstructorValidationState;
  runtimeLabel: string;
  canRenderThree: boolean;
  onStepChange: (step: StepKey) => void;
}) {
  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <div className="rzm-3d-stagebar rzm-3d-stagebar--stage05 rzm-3d-stagebar--stage06 rzm-3d-stagebar--stage08">
      <div className="rzm-3d-stepper-block">
        <span className="rzm-3d-stagebar-eyebrow">Шаги конструктора</span>
        <div className="rzm-3d-stepper" aria-label="Шаги конструктора" role="list">
          {stepOrder.map((item, index) => {
            const state = getStepVisualState(item, index, currentStepIndex, validation);
            const issueCount = getStepIssueCount(item, validation);
            const isCompleted = state === "completed";
            const isActive = item === step;
            return (
              <div className="rzm-3d-step-wrap" role="listitem" key={item}>
                <button
                  type="button"
                  className={`rzm-3d-step rzm-ui-btn rzm-ui-btn--step is-${state}${issueCount > 0 ? " has-issues" : ""}`}
                  onClick={() => onStepChange(item)}
                  aria-label={`Открыть шаг ${index + 1}: ${stepLabels[item]}, ${stepStateLabels[state]}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="rzm-3d-step-index" aria-hidden="true">
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span className="rzm-3d-step-copy">
                    <span className="rzm-3d-step-title">{stepLabels[item]}</span>
                    <small>{stepDescriptions[item]}</small>
                  </span>
                  {issueCount > 0 ? (
                    <span className="rzm-3d-step-issue" aria-label={`${issueCount} замечаний`}>
                      {issueCount}
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rzm-3d-stagebar-meta" aria-label="Статус сцены">
        <span className={`rzm-3d-status-badge rzm-3d-status-badge--runtime is-${canRenderThree ? "ready" : "fallback"}`}>
          {runtimeLabel}
        </span>
      </div>
    </div>
  );
}
