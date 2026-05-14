import "../styles/constructor-v2-summary.css";

export default function ConstructorSummary() {
  return (
    <aside className="rv2-summary">
      <div className="rv2-summary-top">
        <span>Ваш проект</span>
        <h3>Шкаф почти готов</h3>
        <p>Осталось выбрать материалы и добавить проект в корзину.</p>
      </div>

      <div className="rv2-price-card">
        <span>Стоимость комплекта</span>
        <strong>15 447 ₽</strong>
      </div>

      <div className="rv2-facts">
        <span>Параметры</span>

        <div className="rv2-fact-row">
          <p>Размеры</p>
          <b>2400 × 1800 × 600</b>
        </div>

        <div className="rv2-fact-row">
          <p>Секции</p>
          <b>3 шт.</b>
        </div>

        <div className="rv2-fact-row">
          <p>Наполнение</p>
          <b>7 элементов</b>
        </div>
      </div>

      <div className="rv2-check-card">
        <span>Проверка</span>

        <div className="rv2-check-head">
          <p>Конструкция надёжна и готова к сборке</p>
          <strong>92%</strong>
        </div>

        <div className="rv2-progress-line">
          <i />
        </div>
      </div>

      <div className="rv2-kit-card">
        <span>Комплект</span>

        <div className="rv2-kit-grid">
          <div>
            <b>Корпус</b>
            <p>36 деталей</p>
          </div>

          <div>
            <b>Полки</b>
            <p>7 шт.</p>
          </div>

          <div>
            <b>Ящики</b>
            <p>2 шт.</p>
          </div>
        </div>
      </div>

      <div className="rv2-summary-actions">
        <button type="button" className="primary">
          В корзину
        </button>

        <button type="button">Сохранить</button>

        <button type="button">Чертежи</button>
      </div>
    </aside>
  );
}
