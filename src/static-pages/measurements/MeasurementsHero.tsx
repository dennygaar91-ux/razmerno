export function MeasurementsHero() {
  return (
  <section className="rzm-info-hero rzm-measurements-hero-v54 rzm-reveal">
    <div>
      <span className="rzm-how-chip-title">
        <span className="rzm-chip-dot"></span>
        Замеры
      </span>
      <h1 className="rzm-info-title">
        Снимите размеры так, чтобы мебель 
        <em>точно встала</em>
      </h1>
      <p className="rzm-hero-lead">Перед конструктором проверьте место установки: ширину, высоту, глубину, плинтус, трубы и розетки. Не нужно делать чертёж — достаточно точных размеров и пары фото.</p>
      <div className="rzm-info-actions">
        <a className="rzm-cta" href="/configurator">Начать с размеров</a>
        <a className="rzm-secondary-cta" href="/materials">Посмотреть материалы</a>
      </div>
      <div className="rzm-measurements-trust-row" aria-label="Ключевые правила замера">
        <span>в нескольких точках</span>
        <span>с запасом</span>
        <span>с фото сложных мест</span>
      </div>
    </div>
    <div className="rzm-info-visual rzm-info-visual--measure rzm-measurements-hero-visual" aria-label="Схема замера места">
      <img src="/assets/measurements-hero-room.jpeg" alt="" />
      <span className="rzm-info-line rzm-info-line--w">ширина</span>
      <span className="rzm-info-line rzm-info-line--h">высота</span>
      <span className="rzm-info-line rzm-info-line--d">глубина</span>
      <span className="rzm-measurements-plus rzm-measurements-plus--one">+</span>
      <span className="rzm-measurements-plus rzm-measurements-plus--two">+</span>
    </div>
  </section>
  );
}
