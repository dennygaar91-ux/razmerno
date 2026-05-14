import "../styles/constructor-v2.css";

export default function ConstructorLayout() {
  return (
    <section className="rv2-shell">
      <div className="rv2-hero">
        <div>
          <span className="rv2-eyebrow">Онлайн-конструктор</span>
          <h1>Соберите шкаф под свой размер</h1>
          <p>
            Задайте габариты, выберите наполнение и материалы. Цена рассчитывается сразу,
            а мы подготовим комплект для сборки.
          </p>

          <div className="rv2-meta">
            <span>3 шага</span>
            <span>цена сразу</span>
            <span>комплект для сборки</span>
          </div>
        </div>

        <div className="rv2-actions">
          <button type="button">Загрузить</button>
          <button type="button">Очистить</button>
          <button type="button">Сохранить</button>
          <button type="button" className="is-dark">В корзину</button>
        </div>
      </div>

      <div className="rv2-progress">
        <button type="button" className="active">
          <b>1</b>
          <div>
            <strong>Размеры</strong>
            <span>Укажите габариты и секции</span>
          </div>
        </button>

        <button type="button">
          <b>2</b>
          <div>
            <strong>Наполнение</strong>
            <span>Полки, ящики и штанги</span>
          </div>
        </button>

        <button type="button">
          <b>3</b>
          <div>
            <strong>Материалы</strong>
            <span>Декоры и фурнитура</span>
          </div>
        </button>
      </div>

      <div className="rv2-grid">
        <aside className="rv2-sidebar">
          <div className="rv2-card">
            <span className="rv2-card-index">1</span>
            <h3>Размеры и секции</h3>
          </div>
        </aside>

        <div className="rv2-viewer">
          <div className="rv2-viewer-toolbar">
            <div className="rv2-tabs">
              <button className="active">3D</button>
              <button>2D</button>
            </div>

            <div className="rv2-scale">
              <button>-</button>
              <strong>100%</strong>
              <button>+</button>
            </div>
          </div>

          <div className="rv2-stage">
            <div className="rv2-cabinet-placeholder" />
          </div>
        </div>

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
        </aside>
      </div>
    </section>
  );
}
