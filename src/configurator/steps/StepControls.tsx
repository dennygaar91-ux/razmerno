import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function FieldLabel({
  label,
  meta,
  children,
  className,
}: {
  label: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rzm-field-label", className)}>
      <span>{label}</span>
      {children}
      {meta && <span className="control-meta">{meta}</span>}
    </div>
  );
}


export function SectionTitle({
  title,
  meta,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 mb-2", className)}>
      <div className="control-label">{title}</div>
      {meta && <div className="control-meta text-right">{meta}</div>}
    </div>
  );
}

export function RoundControlButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn("control-icon-btn disabled:opacity-30 focus-ring motion-soft", className)}
      {...props}
    />
  );
}

export function ProgressTrack({
  value,
  min = 0,
  max,
  className,
}: {
  value: number;
  min?: number;
  max: number;
  className?: string;
}) {
  const percent = Math.max(8, ((value - min) / Math.max(1, max - min)) * 100);

  return (
    <div className={cn("h-2 flex-1 rounded-full bg-white overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-[var(--color-ink)] transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}



export function ValueStepper({
  value,
  min,
  max,
  label,
  onChange,
  onFocus,
  onBlur,
  compact = false,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "w-full")}>
      <RoundControlButton
        onClick={() => onChange(Math.max(min, value - 1))}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={value <= min}
        className={compact ? "bg-white" : undefined}
        aria-label={`Уменьшить ${label.toLowerCase()}`}
      >
        −
      </RoundControlButton>
      <div className={cn("relative overflow-hidden rounded-full", compact ? "h-8 flex-1 bg-white" : "h-9 flex-1 bg-white")}>
        <ProgressTrack
          value={value}
          min={min}
          max={max}
          className="absolute inset-y-0 left-0 h-full rounded-none bg-transparent"
        />
        <div className="absolute inset-0 grid place-items-center font-mono text-[13px] text-[var(--rzm-text-main)]">
          {value}
        </div>
      </div>
      <RoundControlButton
        onClick={() => onChange(Math.min(max, value + 1))}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={value >= max}
        className={compact ? "bg-white" : undefined}
        aria-label={`Увеличить ${label.toLowerCase()}`}
      >
        +
      </RoundControlButton>
    </div>
  );
}

type ChoiceButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  selected?: boolean;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
};

export function ChoiceButton({
  selected,
  title,
  description,
  aside,
  children,
  compact,
  className,
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      data-selected={selected ? "true" : undefined}
      className={cn(
        "rzm-choice-option text-left focus-ring",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        selected && "is-selected",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-[14px]">{title}</div>
        {aside && <span className="text-[11px] text-[var(--rzm-text-muted)]">{aside}</span>}
      </div>
      {description && (
        <div className="mt-0.5 text-[12px] leading-snug text-[var(--rzm-text-muted)]">
          {description}
        </div>
      )}
      {children}
    </button>
  );
}


type ModuleOptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  compact?: boolean;
};

export function ModuleOption({
  selected,
  compact,
  className,
  type = "button",
  ...props
}: ModuleOptionProps) {
  return (
    <button
      type={type}
      data-selected={selected ? "true" : undefined}
      className={cn(
        "rzm-module-option focus-ring motion-soft",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        selected && "is-selected",
        className,
      )}
      {...props}
    />
  );
}

export function SectionBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("rzm-module-surface p-3", className)}>{children}</div>;
}

export function SoftSwitch({
  checked,
  onClick,
  onFocus,
  onBlur,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        "relative w-12 h-7 rounded-full transition-colors shrink-0 focus-ring",
        checked ? "bg-[var(--color-ink-soft)]" : "bg-[var(--color-line-2)]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function SummaryRows({
  rows,
  className,
}: {
  rows: Array<[ReactNode, ReactNode]>;
  className?: string;
}) {
  return (
    <div className={cn("rzm-module-surface overflow-hidden", className)}>
      {rows.map(([label, value], index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] border-b border-[var(--rzm-line-soft)]/35 last:border-b-0"
        >
          <span className="text-[var(--rzm-text-muted)]">{label}</span>
          <span className="text-[var(--rzm-text-main)] font-medium text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function QuietNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rzm-module-note px-3 py-2 text-[12.5px] leading-snug", className)}>
      {children}
    </div>
  );
}
