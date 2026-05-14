import "../../styles/constructor-advanced-settings.css";

function StatusBadge({ active, draft }) {
  if (draft) return <em className="is-draft">Скоро</em>;
  return <em className={active ? "is-on" : "is-off"}>{active ? "Вкл" : "Выкл"}</em>;
}

export default function AdvancedSettingsPanel({ config, onBackPanel, onWallMount }) {
  const hasBackPanel = config.options?.hasBackPanel !== false;
  const wallMount = Boolean(config.options?.wallMount);
  const hasLegs = Boolean(config.options?.hasLegs);
  const isHighCabinet = Number(config.dimensions?.height) >= 2200;

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
        <button type="button" className={`cp-advanced-item is-control ${hasBackPanel ? "active" : ""}`} onClick={() => onBackPanel(!hasBackPanel)}>
          <div>
            <span>Задняя стенка</span>
            <strong>{hasBackPanel ? "ХДФ 3 мм" : "Без задней стенки"}</strong>
            <p>{hasBackPanel ? "Добавляет жёсткость корпусу и помогает сохранить геометрию шкафа." : "Без задней стенки конструкция менее жёсткая. Для высокого шкафа не рекомендуется."}</p>
          </div>
          <StatusBadge active={hasBackPanel} />
        </button>

        <article className="cp-advanced-item is-draft">
          <div>
            <span>Основание</span>
            <strong>{hasLegs ? "Ножки / без цоколя" : "Без ножек"}</strong>
            <p>Позже добавим цоколь, вырез под плинтус и регулировку высоты.</p>
          </div>
          <StatusBadge draft />
        </article>

        <article className="cp-advanced-item is-standard">
          <div>
            <span>Кромка</span>
            <strong>ABS: корпус 0.8 мм, фасады 2 мм</strong>
            <p>Стандартная схема кромления для DIY-комплекта.</p>
          </div>
          <em className="is-on">Стандарт</em>
        </article>

        <button type="button" className={`cp-advanced-item is-control ${wallMount ? "active" : ""}`} onClick={() => onWallMount(!wallMount)}>
          <div>
            <span>Крепление к стене</span>
            <strong>{wallMount ? "Добавить в комплект" : isHighCabinet ? "Рекомендуется добавить" : "Не выбрано"}</strong>
            <p>{isHighCabinet ? "Для шкафов выше 2200 мм крепление повышает устойчивость." : "Можно добавить для дополнительной устойчивости."}</p>
          </div>
          <StatusBadge active={wallMount} />
        </button>
      </div>
    </section>
  );
}
