import Icon from '../../icons/Icon'

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const breakdownLabels = {
  material: 'Материалы и детали',
  cutting: 'Распил',
  edging: 'Кромление',
  hardware: 'Фурнитура',
  packaging: 'Упаковка',
}

export default function ConstructorSummary({ project, summary, warnings = [], estimateState = 'idle', onCheckout }) {
  const projectRows = [
    ['Размер (В × Ш × Г)', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Секции', `${project.sections} шт.`],
    ['Наполнение', `${summary.elements} элементов`],
    ['Материал', project.material.body],
    ['Открывание', project.material.handles],
    ['Кромка', project.material.edge],
  ]

  const kitItems = [
    ['Корпус', '36 деталей'],
    ['Полки', `${summary.shelves} шт.`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Штанги', `${summary.rails} шт.`],
    ['Фурнитура', project.material.handles],
  ]

  const isReady = warnings.length === 0
  const isCalculating = estimateState === 'loading'
  const hasEstimateError = estimateState === 'error'
  const breakdown = project.priceBreakdown ?? {}

  return (
    <aside className="rp-ctor-summary rp-ref-summary rp-ref-summary--detailed">
      <section className={`rp-ctor-card rp-ref-ready ${isCalculating ? 'is-loading' : ''} ${hasEstimateError ? 'has-error' : ''}`}>
        <div>
          <p>{isCalculating ? 'Пересчёт' : 'Ваш проект'}</p>
          <h2>{isCalculating ? 'Обновляем смету' : isReady ? 'Шкаф почти готов' : 'Нужно проверить проект'}</h2>
          <span>{isCalculating ? 'Стоимость и рекомендации обновляются после изменения параметров.' : hasEstimateError ? 'Показываем предварительный расчёт, backend недоступен.' : isReady ? 'Осталось выбрать материалы и добавить проект в корзину.' : warnings[0]}</span>
        </div>
        <Icon name={isCalculating ? 'clock' : isReady ? 'zap' : 'clock'} size={42} />
      </section>

      <section className={`rp-ctor-card rp-ref-price-card ${isCalculating ? 'is-loading' : ''}`}>
        <p>Стоимость комплекта</p>
        <strong>{formatPrice(project.price)} ₽</strong>
        <span>{isCalculating ? 'Пересчитываем по текущим параметрам…' : 'Предварительно, по текущим размерам и наполнению'}</span>
      </section>

      <section className="rp-ctor-card rp-ref-breakdown-card">
        <h3>Смета</h3>
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key}>
            <span>{breakdownLabels[key] ?? key}</span>
            <b>{formatPrice(value)} ₽</b>
          </div>
        ))}
      </section>

      <section className="rp-ctor-card rp-ref-project-card">
        {projectRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>

      <section className={`rp-ctor-card rp-ref-check-card ${isReady ? 'is-ready' : 'has-warning'} ${isCalculating ? 'is-loading' : ''}`}>
        <div>
          <h3>Проверка</h3>
          <span>{isCalculating ? 'Пересчитываем' : isReady ? 'Можно оформлять' : 'Есть рекомендации'}</span>
        </div>
        <div className="rp-ref-progress"><i style={{ width: isCalculating ? '52%' : isReady ? '92%' : '68%' }} /></div>
        <p>{isCalculating ? 'Проверяем конструкцию и стоимость' : isReady ? 'Конструкция надёжна и готова к сборке' : 'Проверьте рекомендации перед оформлением'} <b>{isCalculating ? '...' : isReady ? '92%' : '68%'}</b></p>
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
