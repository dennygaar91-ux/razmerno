export function HomeMeasurementsTeaser() {
  return (
    <section className="rzm-home-section rzm-measure-teaser rzm-reveal" aria-label="Инструкция по замерам">
      <div className="rzm-measure-copy">
        <span className="rzm-kicker">
          <span className="rzm-chip-dot"></span>
          Перед конструктором
        </span>
        <h2 className="rzm-home-section-title">Сначала проверьте размеры</h2>
        <p className="rzm-hero-lead">
          Этот блок нужен, чтобы пользователь не начинал проект наугад: за 2–3 минуты можно понять, где измерить ширину, высоту и глубину, какие зазоры оставить и что сфотографировать перед заявкой.
        </p>
      </div>
      <div className="rzm-measure-action-card">
        <div className="rzm-measure-tags" aria-label="Что измерить">
          <span className="rzm-chip">Ширина</span>
          <span className="rzm-chip">Высота</span>
          <span className="rzm-chip">Глубина</span>
        </div>
        <p className="rzm-card-text">Если есть ниша, трубы, плинтус или неровные стены — инструкция подскажет, как не ошибиться до отправки заявки.</p>
        <a className="rzm-secondary-cta" href="/measurements">Открыть инструкцию по замеру</a>
      </div>
    </section>
  );
}
