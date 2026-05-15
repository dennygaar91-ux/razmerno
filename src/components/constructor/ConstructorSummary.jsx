import { useState } from 'react'
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
  const [estimateOpen, setEstimateOpen] = useState(false)

  const projectRows = [
    ['Размер', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Секции', `${project.sections} шт.`],
    ['Наполнение', `${summary.shelves} полок · ${summary.drawers} ящиков · ${summary.rails} штанг`],
    ['Материал', project.material.body],
    ['Открывание', project.material.handles],
  ]

  const kitItems = [
    ['Корпус', 'детали'],
    ['Распил', 'включён'],
    ['Кромка', 'ПВХ 2 мм'],
    ['Фурнитура', project.material.handles],
  ]

  const isReady = warnings.length === 0
  const isCalculating = estimateState === 'loading'
  const hasEstimateError = estimateState === 'error'
  const breakdown = project.priceBreakdown ?? {}
  const statusText = isCalculating ? 'Пересчитываем' : hasEstimateError ? 'Расчёт предварительный' : isReady ? 'Готов к оформлению' : 'Есть рекомендации'
  const statusClass = isCalculating ? 'is-loading' : hasEstimateError ? 'has-error' : isReady ? 'is-ready' : 'has-warning'

  return (
    <aside className="rp-ctor-summary rp-ref-summary rp-ref-summary--product">
      <section className={`rp-ctor-card rp-ref-price-card rp-ref-price-card--main ${statusClass}`}>
        <div className="rp-ref-price-topline">
          <span className="rp-ref-summary-status">{statusText}</span>
          <Icon name={isReady ? 'check-circle' : 'clock'} size={18} />
        </div>
        <p>Стоимость комплекта</p>
        <strong>{formatPrice(project.price)} ₽</strong>
        <em>{isCalculating ? 'Обновляем смету после изменения параметров…' : 'Предварительно, финально подтвердит технолог'}</em>
        <button className="rp-ref-summary-cta" type="button" onClick={onCheckout}>В корзину</button>
      </section>

      <section className={`rp-ctor-card rp-ref-check-card ${statusClass}`}>
        <div>
          <h3>Проверка проекта</h3>
          <span>{isCalculating ? 'Идёт пересчёт' : isReady ? 'Без критичных замечаний' : `${warnings.length} рекомендац.`}</span>
        </div>
        <div className="rp-ref-progress"><i style={{ width: isCalculating ? '52%' : isReady ? '92%' : '68%' }} /></div>
        <p>{isCalculating ? 'Проверяем конструкцию' : isReady ? 'Можно переходить к оформлению' : warnings[0]} <b>{isCalculating ? '...' : isReady ? '92%' : '68%'}</b></p>
      </section>

      <section className="rp-ctor-card rp-ref-project-card rp-ref-project-card--compact">
        <div className="rp-ref-card-head">
          <h3>Параметры</h3>
          <span>{summary.elements} элементов</span>
        </div>
        {projectRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>

      <section className="rp-ctor-card rp-ref-kit-card rp-ref-kit-card--product">
        <div className="rp-ref-kit-head">
          <h3>Что входит</h3>
          <button type="button" onClick={() => setEstimateOpen(open => !open)}>{estimateOpen ? 'Скрыть смету' : 'Смета'}</button>
        </div>
        <div className="rp-ref-kit-items rp-ref-kit-items--product">
          {kitItems.map(([title, text]) => (
            <div key={title}>
              <i />
              <span>{title}</span>
              <small>{text}</small>
            </div>
          ))}
        </div>
      </section>

      {estimateOpen && (
        <section className="rp-ctor-card rp-ref-breakdown-card rp-ref-breakdown-card--open">
          <h3>Смета</h3>
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key}>
              <span>{breakdownLabels[key] ?? key}</span>
              <b>{formatPrice(value)} ₽</b>
            </div>
          ))}
        </section>
      )}

      <section className="rp-ctor-card rp-ref-additional-card rp-ref-additional-card--product">
        <h3>Дополнительно</h3>
        <div><span>Задняя стенка</span><em>Рекомендуем</em><b /></div>
        <div><span>{project.material.edge}</span><em>Включена</em><b /></div>
        <div><span>Крепление к стене</span><em>Рекомендуем</em><b /></div>
      </section>
    </aside>
  )
}
