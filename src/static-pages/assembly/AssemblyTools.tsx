import { SectionHeader } from "../shared/SectionHeader";

export function AssemblyTools() {
  return (
  <section className="rzm-info-section rzm-assembly-tools-v56">
    <SectionHeader
      variant="info"
      chip="Подготовка"
      title="Что подготовить перед сборкой"
      lead="Для крупной мебели лучше собирать вдвоём. Для тумбы или комода часто достаточно меньше места, но порядок подготовки остаётся тем же."
    />
    <div className="rzm-assembly-tools rzm-reveal">
      <article>
        <span className="rzm-line-icon">↔</span>
        <strong>Свободное место</strong>
        <p className="rzm-step-text">Разложите детали и оставьте проход вокруг будущего корпуса.</p>
      </article>
      <article>
        <span className="rzm-line-icon">▱</span>
        <strong>Мягкая подложка</strong>
        <p className="rzm-step-text">Картон или плед защищает фасады и детали от царапин.</p>
      </article>
      <article>
        <span className="rzm-line-icon">+</span>
        <strong>Инструмент</strong>
        <p className="rzm-step-text">Отвёртка или шуруповёрт на низком усилии, чтобы не повредить крепёж.</p>
      </article>
      <article>
        <span className="rzm-line-icon">2</span>
        <strong>Помощник</strong>
        <p className="rzm-step-text">Для высоких шкафов вдвоём удобнее и безопаснее выставить корпус.</p>
      </article>
    </div>
  </section>
  );
}
