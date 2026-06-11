import { SectionTitle, ValueStepper } from "./StepControls";

export function CounterRow({
  label,
  value,
  min,
  max,
  onChange,
  onHighlight,
  onHighlightEnd,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onHighlight?: () => void;
  onHighlightEnd?: () => void;
}) {
  return (
    <div
      className="mb-3"
      onMouseEnter={onHighlight}
      onMouseLeave={onHighlightEnd}
    >
      <SectionTitle
        title={label}
        meta={<span className="text-[13px] tabular-nums text-[var(--rzm-text-main)] font-medium">{value}</span>}
      />
      <ValueStepper
        value={value}
        min={min}
        max={max}
        label={label}
        onChange={onChange}
        onFocus={onHighlight}
        onBlur={onHighlightEnd}
      />
    </div>
  );
}
