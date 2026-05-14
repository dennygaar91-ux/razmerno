import "../../styles/constructor-progress-panel.css";

const STEP_META = {
  size: {
    number: "01",
    title: "Размеры",
    shortTitle: "Размеры",
    description: "Задайте габариты и количество секций.",
    hint: "Начните с ширины, высоты и глубины. Модель перестроится автоматически.",
  },
  fill: {
    number: "02",
    title: "Наполнение",
    shortTitle: "Наполнение",
    description: "Добавьте полки, ящики или штангу.",
    hint: "Кликните по секции на модели или выберите её в мини-карте.",
  },
  materials: {
    number: "03",
    title: "Материалы",
    shortTitle: "Материалы",
    description: "Выберите корпус, фасады и фурнитуру.",
    hint: "Показываем только понятные варианты. Производственные параметры остаются ниже.",
  },
};

const STEPS = ["size", "fill", "materials"];

export default function ConstructorProgressPanel({ activeStep, onStepChange, config, totals, price }) {
  const activeIndex = Math.max(0, STEPS.indexOf(activeStep));
  const current = STEP_META[activeStep] || STEP_META.size;
  const sectionCount = config?.sections?.length || 0;
  const formattedPrice = Number(price || 0).toLocaleString("ru-RU");
  const fillCount = totals.shelves + totals.drawers + totals.rails;

  return (
    <section className="cp-progress-panel cp-progress-panel--wizard" aria-label="Шаги конструктора">
      <div className="cp-progress-copy">
        <span>Шаг {activeIndex + 1} из {STEPS.length}</span>
        <h2>{current.title}</h2>
        <p>{current.description}</p>
      </div>

      <div className="cp-progress-steps">
        {STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const isActive = step === activeStep;
          const isDone = index < activeIndex;

          return (
            <button
              key={step}
              type="button"
              className={`${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
              onClick={() => onStepChange(step)}
              aria-current={isActive ? "step" : undefined}
            >
              <i>{isDone ? "✓" : meta.number}</i>
              <span>{meta.shortTitle}</span>
            </button>
          );
        })}
      </div>

      <div className="cp-progress-facts" aria-label="Краткая сводка проекта">
        <div>
          <span>Размер</span>
          <strong>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</strong>
        </div>
        <div>
          <span>Секции</span>
          <strong>{sectionCount}</strong>
        </div>
        <div>
          <span>Элементы</span>
          <strong>{fillCount}</strong>
        </div>
        <div>
          <span>Цена</span>
          <strong>{formattedPrice} ₽</strong>
        </div>
      </div>

      <p className="cp-progress-hint">{current.hint}</p>
    </section>
  );
}
