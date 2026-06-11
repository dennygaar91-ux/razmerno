import type { InputHTMLAttributes } from "react";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="rzm-field-error" role="alert">{message}</div>;
}

export function DimensionField({
  label,
  value,
  onMinus,
  onPlus,
  onChange,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number) => void;
}) {
  const lowerLabel = label.toLowerCase();
  return (
    <label className="rzm-constructor-field">
      <span className="rzm-constructor-label">{label}, мм</span>
      <span className="rzm-constructor-input-control">
        <button className="rzm-constructor-input-btn rzm-constructor-input-btn--minus" type="button" aria-label={`Уменьшить ${lowerLabel}`} onClick={onMinus}>−</button>
        <input className="rzm-constructor-input" value={value} inputMode="numeric" onChange={(event) => onChange(Number(event.target.value || 0))} />
        <button className="rzm-constructor-input-btn rzm-constructor-input-btn--plus" type="button" aria-label={`Увеличить ${lowerLabel}`} onClick={onPlus}>+</button>
      </span>
    </label>
  );
}

export function MiniControl({ label, value, onMinus, onPlus }: { label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  const lowerLabel = label.toLowerCase();
  return (
    <div className="rzm-fill-structure-row">
      <span className="rzm-fill-structure-label">{label}</span>
      <span className="rzm-fill-mini-control">
        <button className="rzm-constructor-input-btn rzm-constructor-input-btn--minus" type="button" aria-label={`Уменьшить ${lowerLabel}`} onClick={onMinus}>−</button>
        <strong>{value}</strong>
        <button className="rzm-constructor-input-btn rzm-constructor-input-btn--plus" type="button" aria-label={`Увеличить ${lowerLabel}`} onClick={onPlus}>+</button>
      </span>
    </div>
  );
}

export function ToggleCard({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <section className="rzm-constructor-card rzm-constructor-advanced-card">
      <div className="rzm-constructor-advanced-row">
        <div>
          <h2 className="rzm-constructor-card-title">{title}</h2>
          <p className="rzm-step-text">{text}</p>
        </div>
        <label className="rzm-constructor-toggle" aria-label={title}>
          <input className="rzm-constructor-toggle-input" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
          <span className="rzm-constructor-toggle-track"><span className="rzm-constructor-toggle-thumb" /></span>
        </label>
      </div>
    </section>
  );
}

export function ContactField({
  label,
  value,
  placeholder,
  error,
  type = "text",
  inputMode,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rzm-constructor-field">
      <span className="rzm-constructor-label">{label}</span>
      <input
        className={`rzm-constructor-input rzm-constructor-input--text ${error ? "is-error" : ""}`}
        placeholder={placeholder}
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </label>
  );
}
