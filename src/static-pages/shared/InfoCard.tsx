export function InfoCard({
  marker,
  title,
  text,
}: {
  marker: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rzm-info-card rzm-reveal">
      <div className="rzm-info-card-top">
        <span className="rzm-how-step-number">{marker}</span>
        <h3>{title}</h3>
      </div>
      <p className="rzm-step-text">{text}</p>
    </article>
  );
}
