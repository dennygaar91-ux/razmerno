import { useMemo, useState } from 'react'
import Icon from '../../icons/Icon'
import { getEstimateRows } from '../../utils/constructorPricing'

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function EstimateRow({ row, total }) {
  const percent = total > 0 ? Math.round((row.value / total) * 100) : 0

  return (
    <div className="rp-ref-estimate-row">
      <div className="rp-ref-estimate-row__top">
        <span>{row.title}</span>
        <b>{formatPrice(row.value)} ₽</b>
      </div>
      <p>{row.hint}</p>
      <div className="rp-ref-estimate-row__bar"><i style={{ width: `${Math.max(6, percent)}%` }} /></div>
      <small>{row.formula}</small>
    </div>
  )
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
    ['Кромка', project.material.edge],
    ['Фурнитура', project.material.handles],
  ]

  const isReady = warnings.length === 0
  const isCalculating = estimateState === 'loading'
  const hasEstimateError = estimateState === 'error'
  const breakdown = project.priceBreakdown ?? {}
  const estimateRows = useMemo(() => getEstimateRows(project, summary, breakdown), [project, summary, breakdown])
  const estimateTotal = estimateRows.reduce((sum, row) => sum + row.value, 0)
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
        <section className="rp-ctor-card rp-ref-breakdown-card rp-ref-breakdown-card--open rp-ref-breakdown-card--detailed">
          <div className="rp-ref-breakdown-card__head">
            <h3>Предварительная смета</h3>
            <span>{formatPrice(estimateTotal)} ₽</span>
          </div>
          <p className="rp-ref-breakdown-note">Сейчас это frontend-оценка. Backend позже будет считать по актуальным ценам материалов, фурнитуры и работ.</p>
          {estimateRows.map(row => <EstimateRow key={row.key} row={row} total={estimateTotal} />)}
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
