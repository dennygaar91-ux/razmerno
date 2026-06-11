export function HomeFinalCTA() {
  return (
    <section className="rzm-home-final rzm-reveal" aria-label="Попробуйте собрать мебель">
      <div>
        <span className="rzm-kicker rzm-kicker--dark">
          <span className="rzm-chip-dot"></span>
          Готово
        </span>
        <h2>Соберите первый проект</h2>
        <p className="rzm-final-lead">Начните с размеров, выберите наполнение и отправьте заявку на проверку. После этого менеджер согласует детали перед запуском.</p>
      </div>
      <div className="rzm-actions rzm-actions--dark">
        <a className="rzm-cta" href="/configurator">Начать с размеров</a>
        <a className="rzm-secondary-cta" href="/measurements">Посмотреть замеры</a>
      </div>
    </section>
  );
}
