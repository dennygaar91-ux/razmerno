export function InfoFinalCTA({
  chip = "Готово",
  title,
  lead,
  ctaLabel,
  href = "/configurator",
}: {
  chip?: string;
  title: string;
  lead: string;
  ctaLabel: string;
  href?: string;
}) {
  return (
    <section className="rzm-info-final rzm-reveal">
      <div>
        <span className="rzm-how-chip-title">
          <span className="rzm-chip-dot"></span>
          {chip}
        </span>
        <h2>{title}</h2>
        <p className="rzm-hero-lead">{lead}</p>
      </div>
      <a className="rzm-cta" href={href}>{ctaLabel}</a>
    </section>
  );
}
