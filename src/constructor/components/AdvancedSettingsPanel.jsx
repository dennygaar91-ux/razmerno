import "../../styles/constructor-advanced-settings.css";

function StatusBadge({ active, draft, standard }) {
  if (draft) return <em className="is-draft">Скоро</em>;
  if (standard) return <em className="is-on">Входит</em>;
  return <em className={active ? "is-on" : "is-off"}>{active ? "Добавлено" : "Не выбрано"}</em>;
}

export default function AdvancedSettingsPanel({ config, onBackPanel, onWallMount }) {
  const hasBackPanel = config.options?.hasBackPanel !== false;
  const wallMount = Boolean(config.options?.wallMount);
  const hasLegs = Boolean(config.options?.hasLegs);
  const isHighCabinet = Number(config.dimensions?.height) >= 2200;

  return (
    <section className="cp-advanced" aria-label="Дополнительные параметры">
      <div className="cp-advanced-head">
        <div>
          <span>Дополнительно</span>
          <strong>Надёжность и сборка</strong>
          <small>Эти параметры помогают сделать комплект устойчивее и понятнее для самостоятельной сборки.</small>
        </div>
      </div>

      <div className="cp-advanced-list">
        <button type="button" className={`cp-advanced-item is-control ${hasBackPanel ? "active" : ""}`} onClick={() => onBackPanel(!hasBackPanel)}>
          <div>
            <span>Жёсткость корпуса</span>
            <strong>{hasBackPanel ? "Задняя стенка включена" : "Задняя стенка выключена"}</strong>
            <p>{hasBackPanel ? "Помогает шкафу держать форму и делает корпус устойчивее." : "Без задней стенки шкаф менее жёсткий. Обычно её лучше оставить."}</p>
          </div>
          <StatusBadge active={hasBackPanel} />
        </button>

        <article className="cp-advanced-item is-draft">
          <div>
            <span>Основание</span>
            <strong>{hasLegs ? "Ножки выбраны" : "Без ножек"}</strong>
            <p>Позже добавим выбор цоколя, вырез под плинтус и регулировку высоты.</p>
          </div>
          <StatusBadge draft />
        </article>

        <article className="cp-advanced-item is-standard">
          <div>
            <span>Кромка деталей</span>
            <strong>ABS-кромка по стандарту</strong>
            <p>Корпус 0.8 мм, фасады 2 мм. Это уже учтено в логике комплекта.</p>
          </div>
          <StatusBadge standard />
        </article>

        <button type="button" className={`cp-advanced-item is-control ${wallMount ? "active" : ""}`} onClick={() => onWallMount(!wallMount)}>
          <div>
            <span>Устойчивость</span>
            <strong>{wallMount ? "Крепление к стене добавлено" : isHighCabinet ? "Крепление рекомендуется" : "Крепление не выбрано"}</strong>
            <p>{isHighCabinet ? "Для высоких шкафов это важная мера безопасности." : "Можно добавить, если шкаф будет стоять отдельно или рядом с детьми."}</p>
          </div>
          <StatusBadge active={wallMount} />
        </button>
      </div>
    </section>
  );
}
