export function MaterialsHero() {
  return (
  <section className="rzm-info-hero rzm-materials-hero-v55 rzm-reveal">
    <div>
      <span className="rzm-how-chip-title">
        <span className="rzm-chip-dot"></span>
        Материалы
      </span>
      <h1 className="rzm-info-title">
        Выберите декор, который делает мебель 
        <em>частью интерьера</em>
      </h1>
      <p className="rzm-hero-lead">В конструкторе доступны спокойные базовые декоры: светлые, тёплые и тёмные. Оранжевый остаётся акцентом интерфейса, а мебель выглядит нейтрально и предметно.</p>
      <div className="rzm-info-actions">
        <a className="rzm-cta" href="/configurator">Выбрать материал</a>
        <a className="rzm-secondary-cta" href="/assembly">Смотреть сборку</a>
      </div>
      <div className="rzm-materials-trust-row" aria-label="Принципы выбора материала">
        <span>7 базовых декоров</span>
        <span>без случайных цветов</span>
        <span>можно уточнить после заявки</span>
      </div>
    </div>
    <div className="rzm-info-visual rzm-info-visual--materials rzm-materials-hero-visual" aria-label="Материалы и мебель">
      <img src="/assets/materials-hero-samples.jpeg" alt="" />
      <span className="rzm-material-chip rzm-material-chip--a">белый матовый</span>
      <span className="rzm-material-chip rzm-material-chip--b">тёплый дуб</span>
      <span className="rzm-material-chip rzm-material-chip--c">графит</span>
    </div>
  </section>
  );
}
