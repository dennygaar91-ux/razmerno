export function AssemblyHero() {
  return (
  <section className="rzm-info-hero rzm-assembly-hero-v56 rzm-reveal">
    <div>
      <span className="rzm-how-chip-title">
        <span className="rzm-chip-dot"></span>
        Сборка
      </span>
      <h1 className="rzm-info-title">
        Собрать мебель проще, когда комплект 
        <em>разложен по шагам</em>
      </h1>
      <p className="rzm-hero-lead">Комплект приезжает как понятный набор: детали, крепёж, фурнитура и инструкция по шагам.</p>
      <div className="rzm-info-actions">
        <a className="rzm-cta" href="/configurator">Открыть конструктор</a>
        <a className="rzm-secondary-cta" href="/measurements">Проверить замеры</a>
      </div>
      <div className="rzm-assembly-trust-row" aria-label="Что делает сборку понятной">
        <span>детали по размерам</span>
        <span>крепёж и инструкция</span>
      </div>
    </div>
    <div className="rzm-info-visual rzm-info-visual--assembly rzm-assembly-hero-visual" aria-label="Комплект деталей для сборки">
      <img src="/assets/assembly-hero-modules.jpeg" alt="" />
      <span className="rzm-assembly-part rzm-assembly-part--one"></span>
      <span className="rzm-assembly-part rzm-assembly-part--two"></span>
      <span className="rzm-assembly-part rzm-assembly-part--three"></span>
      <span className="rzm-assembly-path"></span>
      <span className="rzm-assembly-hero-label">корпус → наполнение → фасады</span>
    </div>
  </section>
  );
}
