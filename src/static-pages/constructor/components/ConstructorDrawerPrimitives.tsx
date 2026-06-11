import { useId, type HTMLAttributes } from "react";
import type { ConstructorValidationIssue, ConstructorValidationState, StepKey } from "../types";

export function TextInput3D({
  label,
  value,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const describedBy = error ? errorId : undefined;
  return (
    <label
      className={`rzm-3d-field ${error ? "is-error" : ""}`}
      htmlFor={fieldId}
    >
      <span>
        {label}
        {required ? <b aria-hidden="true"> *</b> : null}
      </span>
      <input
        id={fieldId}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small id={errorId}>{error}</small> : null}
    </label>
  );
}

export function InlineIssue({
  issue,
  onAutoFix,
}: {
  issue?: ConstructorValidationIssue | null;
  onAutoFix: (issueId?: string | null) => void;
}) {
  if (!issue) return null;
  return (
    <div
      data-validation-stage="STAGE13"
      className={`rzm-3d-inline-validation rzm-3d-status-card rzm-3d-status-card--${issue.severity} is-${issue.severity}`}
    >
      <div>
        <strong>{issue.title}</strong>
        <span>{issue.message}</span>
      </div>
      <button
        type="button"
        className="rzm-ui-btn rzm-ui-btn--secondary rzm-ui-btn--autofix"
        onClick={() => onAutoFix(issue.id)}
      >
        Исправить
      </button>
    </div>
  );
}

export function ValidationAssist({
  validation,
  onAutoFix,
  step,
  mode = "default",
}: {
  validation: ConstructorValidationState;
  onAutoFix: (issueId?: string | null) => void;
  step?: StepKey;
  mode?: "default" | "checkout";
}) {
  const issues = step
    ? validation.issues.filter((issue) => issue.stepId === step)
    : validation.issues;
  const primary =
    issues.find((issue) => issue.severity === "error") ?? issues[0];
  const statusText =
    validation.status === "valid"
      ? "Готово"
      : validation.status === "warning"
        ? "Есть предупреждение"
        : "Нужно исправить";
  if (!primary) {
    return (
      <section className="rzm-3d-status-card rzm-3d-status-card--valid rzm-3d-validation-panel is-valid">
        <div>
          <span>Проверка</span>
          <strong>{statusText}</strong>
        </div>
      </section>
    );
  }
  return (
    <section
      data-validation-stage="STAGE13"
      className={`rzm-3d-status-card rzm-3d-status-card--${primary.severity} rzm-3d-validation-panel is-${primary.severity} ${mode === "checkout" ? "is-checkout" : ""}`}
    >
      <div>
        <span>{mode === "checkout" ? "Перед заявкой" : "Проверка"}</span>
        <strong>{primary.title}</strong>
        <p>{primary.message}</p>
      </div>
      <button
        type="button"
        className="rzm-ui-btn rzm-ui-btn--secondary rzm-ui-btn--autofix"
        onClick={() => onAutoFix(primary.id)}
      >
        Исправить автоматически
      </button>
    </section>
  );
}

export function StepIntro({ title, text }: { title: string; text: string }) {
  return (
    <header className="rzm-3d-step-intro">
      <span>3D-конструктор</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  );
}

