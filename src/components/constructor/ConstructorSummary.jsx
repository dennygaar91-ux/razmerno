import Icon from '../../icons/Icon'

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export default function ConstructorSummary({ project, summary, onCheckout }) {
  const projectRows = [
    ['Размер (В × Ш × Г)', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Секции', `${project.sections} шт.`],
    ['Наполнение', `${summary.elements} элементов`],
    ['Полки', `${summary.shelves} шт.`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Штанги', `${summary.rails} шт.`],
  ]

  const kitItems = [
    ['Корпус', '36 деталей'],
    ['Полки', `${summary.shelves} шт.`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Фасады', '0 шт.'],
    ['Фурнитура', '1 компл.'],
  ]

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
        <strong>{formatPrice(project.price)} ₽</strong>
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
        <div><span>{project.material.edge}</span><em>Включена</em><b /></div>
        <div><span>Крепление к стене</span><em>Рекомендуем</em><b /></div>
      </section>

      <button className="rp-ref-summary-cta" type="button" onClick={onCheckout}>В корзину</button>
    </aside>
  )
}
