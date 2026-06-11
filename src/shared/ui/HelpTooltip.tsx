interface HelpTooltipProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function HelpTooltip({ label, tooltip, className }: HelpTooltipProps) {
  return (
    <span
      role="note"
      aria-label={label}
      tabIndex={0}
      data-tooltip={tooltip}
      className={["rzm-help focus-ring", className].filter(Boolean).join(" ")}
    >
      ?
    </span>
  );
}
