export function SectionHeader({
  chip,
  title,
  lead,
  variant = "home",
}: {
  chip: string;
  title: string;
  lead: string;
  variant?: "home" | "info";
}) {
  const className = variant === "info" ? "rzm-info-section-head rzm-reveal" : "rzm-home-section-head";

  return (
    <div className={className}>
      <div>
        <span className="rzm-how-chip-title">
          <span className="rzm-chip-dot"></span>
          {chip}
        </span>
        <h2 className={variant === "home" ? "rzm-home-section-title" : undefined}>{title}</h2>
      </div>
      <p className="rzm-hero-lead">{lead}</p>
    </div>
  );
}
