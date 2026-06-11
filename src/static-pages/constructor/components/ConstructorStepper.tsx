import { stepLabels, stepOrder } from "../options";
import type { ConstructorStepStatus, StepKey } from "../types";

export function ConstructorStepper({
  value,
  onChange,
  stepStatuses,
}: {
  value: StepKey;
  onChange: (value: StepKey) => void;
  stepStatuses?: Partial<Record<StepKey, ConstructorStepStatus>>;
}) {
  return (
    <div className="rzm-constructor-stepper rzm-constructor-stepper--horizontal" aria-label="Шаги конструктора">
      {stepOrder.map((item, index) => {
        const activeIndex = stepOrder.indexOf(value);
        const validationStatus = stepStatuses?.[item];
        const stateClass = validationStatus === "error"
          ? "rzm-constructor-step--error"
          : validationStatus === "warning"
            ? "rzm-constructor-step--warning"
            : index < activeIndex
              ? "rzm-constructor-step--done"
              : index === activeIndex
                ? "rzm-constructor-step--active"
                : "rzm-constructor-step--default";

        return (
          <button
            key={item}
            className={`rzm-constructor-step ${stateClass}`}
            type="button"
            aria-pressed={value === item}
            onClick={() => onChange(item)}
          >
            <span className="rzm-constructor-step-index">{index + 1}</span>
            <span className="rzm-constructor-step-title">{stepLabels[item]}</span>
          </button>
        );
      })}
    </div>
  );
}
