import "../../styles/constructor-progress-panel.css";

const STEP_META = {
  size: {
    number: "01",
    title: "Размеры",
    shortTitle: "Размеры",
    description: "Введите ширину, высоту, глубину и количество секций. Конструктор сразу перестроит модель.",
    hint: "Начните с внешних габаритов шкафа. Значения ограничены безопасным диапазоном.",
  },
  fill: {
    number: "02",
    title: "Наполнение",
    shortTitle: "Наполнение",
    description: "Выберите секцию и добавьте полки, ящики или штангу. Можно использовать готовые пресеты.",
    hint: "Кликните по секции на модели или выберите её в мини-карте.",
  },
  materials: {
    number: "03",
    title: "Материалы",
    shortTitle: "Материалы",
    description: "Выберите корпус, фасады и фурнитуру. На следующем этапе подключим цены из прайс-листа.",
    hint: "Обычному клиенту показываем только понятные варианты, экспертные параметры скрываем ниже.",
  },
};

const STEPS = ["size", "fill", "materials"];

export default function ConstructorProgressPanel({ activeStep, onStepChange, config, totals, price }) {
  const activeIndex = Math.max(0, STEPS.indexOf(activeStep));
  const current = STEP_META[activeStep] || STEP_META.size;
  const sectionCount = config?.sections?.length || 0;
  const formattedPrice = Number(price || 0).toLocaleString("ru-RU");

  return (
    <section className="cp-progress-panel" aria-label="Шаги конструктора">
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
            >
              <i>{isDone ? "✓" : meta.number}</i>
              <span>{meta.shortTitle}</span>
            </button>
          );
        })}
      </div>

      <div className="cp-progress-facts">
        <div>
          <span>Габариты</span>
          <strong>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</strong>
        </div>
        <div>
          <span>Секции</span>
          <strong>{sectionCount}</strong>
        </div>
        <div>
          <span>Наполнение</span>
          <strong>{totals.shelves + totals.drawers + totals.rails}</strong>
        </div>
        <div>
          <span>Итого</span>
          <strong>{formattedPrice} ₽</strong>
        </div>
      </div>

      <p className="cp-progress-hint">{current.hint}</p>
    </section>
  );
}
