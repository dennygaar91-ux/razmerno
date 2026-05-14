import "../../styles/constructor-advanced-settings.css";

const ADVANCED_ITEMS = [
  {
    id: "back-panel",
    title: "Задняя стенка",
    value: "ХДФ 3 мм",
    status: "standard",
    description: "Добавляет жёсткость корпусу и помогает сохранить геометрию шкафа.",
  },
  {
    id: "base",
    title: "Основание",
    value: "Ножки / без цоколя",
    status: "draft",
    description: "Позже добавим цоколь, вырез под плинтус и регулировку высоты.",
  },
  {
    id: "edge",
    title: "Кромка",
    value: "ABS: корпус 0.8 мм, фасады 2 мм",
    status: "standard",
    description: "Стандартная схема кромления для DIY-комплекта.",
  },
  {
    id: "wall-fix",
    title: "Крепление к стене",
    value: "Рекомендовано для высоких шкафов",
    status: "recommendation",
    description: "Для шкафов выше 2200 мм крепление повышает устойчивость.",
  },
];

function getStatusLabel(status) {
  if (status === "standard") return "Стандарт";
  if (status === "recommendation") return "Совет";
  return "Скоро";
}

export default function AdvancedSettingsPanel() {
  return (
    <section className="cp-advanced" aria-label="Расширенные настройки">
      <div className="cp-advanced-head">
        <div>
          <span>Расширенные настройки</span>
          <strong>Производственная логика</strong>
        </div>
        <b>Beta</b>
      </div>

      <div className="cp-advanced-list">
        {ADVANCED_ITEMS.map((item) => (
          <article key={item.id} className={`cp-advanced-item is-${item.status}`}>
            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <p>{item.description}</p>
            </div>
            <em>{getStatusLabel(item.status)}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
