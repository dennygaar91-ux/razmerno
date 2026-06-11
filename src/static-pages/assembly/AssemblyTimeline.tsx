export function AssemblyTimeline() {
  return (
  <section className="rzm-info-section rzm-info-timeline rzm-assembly-timeline-v56 rzm-reveal">
    <div className="rzm-assembly-timeline-copy">
      <span className="rzm-how-chip-title">
        <span className="rzm-chip-dot"></span>
        Порядок
      </span>
      <h2>Корпус → наполнение → фасады</h2>
      <p className="rzm-hero-lead">Сначала собирается основа, затем внутренние элементы, после этого фасады и регулировка.</p>
      <div className="rzm-timeline">
        <article>
          <span>1</span>
          <div>
            <h3>Разложите детали</h3>
            <p className="rzm-step-text">Сверьте маркировку и сгруппируйте похожие элементы.</p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <h3>Соберите корпус</h3>
            <p className="rzm-step-text">Проверьте, что боковины, дно, крышка и перегородки стоят ровно.</p>
          </div>
        </article>
        <article>
          <span>3</span>
          <div>
            <h3>Поставьте наполнение</h3>
            <p className="rzm-step-text">Полки, штанги и ящики ставятся после проверки корпуса.</p>
          </div>
        </article>
        <article>
          <span>4</span>
          <div>
            <h3>Навесьте фасады</h3>
            <p className="rzm-step-text">Финально проверьте зазоры и плавность открывания.</p>
          </div>
        </article>
      </div>
    </div>
    <div className="rzm-assembly-timeline-visual" aria-hidden="true">
      <img src="/assets/assembly-timeline-preview.jpeg" alt="" />
      <span>пошаговая сборка</span>
    </div>
  </section>
  );
}
