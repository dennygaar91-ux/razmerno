import type { ConstructorValidationIssue, ConstructorValidationState } from "../types";

function getStatusLabel(status: ConstructorValidationState["status"]) {
  if (status === "error") return "Нужно исправить";
  if (status === "warning") return "Есть предупреждение";
  return "Готово";
}

function getIssueTargetLabel(issue: ConstructorValidationIssue) {
  if (issue.targetType === "dimensions") {
    if (issue.targetId === "width") return "Ширина";
    if (issue.targetId === "height") return "Высота";
    if (issue.targetId === "depth") return "Глубина";
    return "Размеры";
  }

  if (issue.targetType === "sections") return "Секции";

  if (issue.targetType === "section" || issue.targetType === "facade") {
    const sectionNumber = issue.targetId?.replace("section-", "");
    return sectionNumber ? `Секция ${sectionNumber}` : "Секция";
  }

  if (issue.targetType === "compartment") {
    const [, sectionNumber, compartmentNumber] =
      issue.targetId?.match(/^section-(\d+)-compartment-(\d+)$/) ?? [];
    if (sectionNumber && compartmentNumber) {
      return `Секция ${sectionNumber} · отсек ${compartmentNumber}`;
    }
    return "Отсек";
  }

  if (issue.targetType === "material") return "Материалы";

  return "Проект";
}

export function ConstructorValidationPanel({
  validation,
  currentStep,
  activeIssueId,
  onIssueSelect,
}: {
  validation: ConstructorValidationState;
  currentStep?: string;
  activeIssueId?: string | null;
  onIssueSelect: (issue: ConstructorValidationIssue) => void;
}) {
  const stepIssues = validation.issues.filter(
    (issue) => !currentStep || issue.stepId === currentStep,
  );
  const visibleIssues = stepIssues.length ? stepIssues : validation.issues;
  const activeIssue =
    visibleIssues.find((issue) => issue.id === activeIssueId) ?? visibleIssues[0] ?? null;

  if (validation.status === "valid" || !activeIssue) {
    return (
      <section className="rzm-constructor-validation-panel rzm-constructor-validation-panel--valid rzm-constructor-validation-panel--compact">
        <div className="rzm-constructor-validation-head">
          <span className="rzm-constructor-validation-eyebrow">Проверка</span>
          <strong>{getStatusLabel("valid")}</strong>
        </div>
      </section>
    );
  }

  return (
    <section className={`rzm-constructor-validation-panel rzm-constructor-validation-panel--${validation.status} rzm-constructor-validation-panel--compact`}>
      <div className="rzm-constructor-validation-head">
        <span className="rzm-constructor-validation-eyebrow">Проверка</span>
        <strong>{getStatusLabel(validation.status)}</strong>
      </div>

      <button
        className={`rzm-constructor-validation-item rzm-constructor-validation-item--${activeIssue.severity} is-active`}
        type="button"
        onClick={() => onIssueSelect(activeIssue)}
      >
        <span className="rzm-constructor-validation-badge">
          {activeIssue.severity === "error" ? "!" : "?"}
        </span>
        <span>
          <strong>{activeIssue.title}</strong>
          <small>{getIssueTargetLabel(activeIssue)} · {activeIssue.fixHint}</small>
        </span>
      </button>

      {visibleIssues.length > 1 && (
        <button
          className="rzm-constructor-validation-more"
          type="button"
          onClick={() => onIssueSelect(visibleIssues[1])}
        >
          Ещё {visibleIssues.length - 1} — показать следующую
        </button>
      )}
    </section>
  );
}
