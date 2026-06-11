import { ValueStepper } from "./StepControls";

export function MiniCounter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-[14px] bg-[var(--rzm-surface-soft)] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-[var(--rzm-text-main)]">{label}</span>
        <span className="font-mono text-[13px] tabular-nums text-[var(--rzm-text-main)]">{value}</span>
      </div>
      <div className="mt-2">
        <ValueStepper
          value={value}
          min={min}
          max={max}
          label={label}
          onChange={onChange}
          compact
        />
      </div>
    </div>
  );
}
