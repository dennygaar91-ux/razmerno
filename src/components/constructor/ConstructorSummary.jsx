import Icon from '../../icons/Icon'

const projectRows = [
  ['Размер (В × Ш × Г)', '2400 × 1800 × 600 мм'],
  ['Секции', '3 шт.'],
  ['Наполнение', '7 элементов'],
  ['Полки', '7 шт.'],
  ['Ящики', '2 шт.'],
  ['Штанги', '1 шт.'],
]

const kitItems = [
  ['Корпус', '36 деталей'],
  ['Полки', '7 шт.'],
  ['Ящики', '2 шт.'],
  ['Фасады', '0 шт.'],
  ['Фурнитура', '1 компл.'],
]

export default function ConstructorSummary({ onCheckout }) {
  return (
    <aside className="rp-ctor-summary rp-ref-summary">
      <section className="rp-ctor-card rp-ref-ready">
        <div>
          <p>Ваш проект</p>
          <h2>Шкаф почти готов</h2>
          <span>Осталось выбрать материалы и добавить проект в корзину.</span>
        </div>
        <Icon name="zap" size={42} />
      </section>

      <section className="rp-ctor-card rp-ref-price-card">
        <p>Стоимость комплекта</p>
        <strong>15 447 ₽</strong>
        <span>Предварительно, по текущим размерам и наполнению</span>
      </section>

      <section className="rp-ctor-card rp-ref-project-card">
        {projectRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>

      <section className="rp-ctor-card rp-ref-check-card">
        <div>
          <h3>Проверка</h3>
          <span>Можно оформлять</span>
        </div>
        <div className="rp-ref-progress"><i /></div>
        <p>Конструкция надёжна и готова к сборке <b>92%</b></p>
      </section>

      <section className="rp-ctor-card rp-ref-kit-card">
        <div className="rp-ref-kit-head">
          <h3>Комплект</h3>
          <button type="button">Подробнее</button>
        </div>
        <div className="rp-ref-kit-items">
          {kitItems.map(([title, text]) => (
            <div key={title}>
              <i />
              <span>{title}</span>
              <small>{text}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="rp-ctor-card rp-ref-additional-card">
        <h3>Дополнительно</h3>
        <div><span>Задняя стенка</span><em>Рекомендуем</em><b /></div>
        <div><span>Кромка</span><em>Включена</em><b /></div>
        <div><span>Крепление к стене</span><em>Рекомендуем</em><b /></div>
      </section>

      <button className="rp-ref-summary-cta" type="button" onClick={onCheckout}>В корзину</button>
    </aside>
  )
}
