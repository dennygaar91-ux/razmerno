export function HomeHero() {
  return (
    <section className="rzm-home-hero rzm-reveal" aria-label="Первый экран">
      <div className="rzm-home-hero-copy">
        <span className="rzm-kicker">
          <span className="rzm-chip-dot"></span>
          Онлайн-конструктор корпусной мебели
        </span>
        <h1 className="rzm-home-hero-title">
          Соберите мебель под свой размер — <em>как понятный конструктор</em>
        </h1>
        <p className="rzm-hero-lead rzm-home-hero-lead">
          Выберите шкаф, тумбу или комод, задайте размеры, наполнение и декор. Без сложных чертежей: проект уйдёт менеджеру на проверку перед запуском.
        </p>
        <div className="rzm-actions">
          <a className="rzm-cta" href="/configurator">Начать с размеров</a>
          <a className="rzm-secondary-cta" href="#how">Как это работает</a>
        </div>
        <div className="rzm-chip-row" aria-label="Преимущества">
          <span className="rzm-chip">Под ваши размеры</span>
          <span className="rzm-chip">Понятная сборка</span>
          <span className="rzm-chip">Без сложных чертежей</span>
        </div>
      </div>

      <div className="rzm-home-hero-visual" aria-label="Модульная мебель Размерно">
        <span className="rzm-visual-glow"></span>
        <img className="rzm-home-hero-photo" src="/assets/home-hero-furniture-scene.jpeg" alt="" />
        <span className="rzm-ui-marker rzm-ui-marker--hero rzm-ui-marker--top">Проверим перед запуском</span>
        <span className="rzm-ui-marker rzm-ui-marker--hero rzm-ui-marker--bottom">Под ваш размер</span>
      </div>
    </section>
  );
}
