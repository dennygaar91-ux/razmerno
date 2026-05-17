import { useMemo, useState } from 'react'
import { getEstimateRows } from '../../utils/constructorPricing'

function formatPrice(value) {
  const numericValue = Number(value)
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0
  return new Intl.NumberFormat('ru-RU').format(safeValue)
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

function ConfettiIcon() {
  return (
    <div className="rp-target-ready-icon" aria-hidden="true">
      <span />
      <i />
      <b />
      <em />
    </div>
  )
}

export default function ConstructorSummary({ project, summary, warnings = [], estimateState = 'idle', onCheckout }) {
  const [estimateOpen, setEstimateOpen] = useState(false)

  const projectRows = [
    ['Размер (В × Ш × Г)', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Секции', `${project.sections} шт.`],
    ['Наполнение', `${summary.elements} элементов`],
    ['Полки', `${summary.shelves} шт.`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Штанги', `${summary.rails} шт.`],
  ]

  const kitItems = [
    ['Корпус', `${summary.parts ?? 36} деталей`],
    ['Полки', `${summary.shelves} шт.`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Фасады', '0 шт.'],
    ['Фурнитура', '1 компл.'],
  ]

  const isReady = warnings.length === 0
  const isCalculating = estimateState === 'loading'
  const hasEstimateError = estimateState === 'error'
  const breakdown = project.priceBreakdown ?? {}
  const estimateRows = useMemo(() => getEstimateRows(project, summary, breakdown), [project, summary, breakdown])
  const estimateTotal = estimateRows.reduce((sum, row) => sum + row.value, 0)
  const checkPercent = isCalculating ? 52 : isReady ? 92 : 68
  const statusText = isCalculating ? 'Проверяем' : hasEstimateError ? 'Предварительно' : isReady ? 'Можно оформлять' : `${warnings.length} рекомендац.`
  const statusClass = isCalculating ? 'is-loading' : hasEstimateError ? 'has-error' : isReady ? 'is-ready' : 'has-warning'

  return (
    <aside className={`rp-ctor-summary rp-ref-summary rp-target-summary ${statusClass}`}>
      <section className="rp-target-card rp-target-ready-card">
        <div>
          <span>Ваш проект</span>
          <h3>Шкаф почти готов</h3>
          <p>Осталось выбрать материалы и добавить проект в корзину.</p>
        </div>
        <ConfettiIcon />
      </section>

      <section className="rp-target-card rp-target-price-card">
        <p>Стоимость комплекта</p>
        <strong>{formatPrice(project.price)} ₽</strong>
        <span>{isCalculating ? 'Пересчитываем…' : 'Предварительно, по текущим размерам и наполнению'}</span>
        <button type="button" onClick={onCheckout}>В корзину</button>
      </section>

      <section className="rp-target-card rp-target-project-card">
        {projectRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>

      <section className="rp-target-card rp-target-check-card">
        <div className="rp-target-check-card__head">
          <h3>Проверка</h3>
          <span>{statusText}</span>
        </div>
        <div className="rp-target-progress"><i style={{ width: `${checkPercent}%` }} /></div>
        <p>{isReady ? 'Конструкция надёжна и готова к сборке' : warnings[0]} <b>{checkPercent}%</b></p>
      </section>

      <section className="rp-target-card rp-target-kit-card">
        <div className="rp-target-kit-head">
          <h3>Комплект <span>/ Что получите</span></h3>
          <button type="button" onClick={() => setEstimateOpen(open => !open)}>{estimateOpen ? 'Скрыть' : 'Подробнее'}</button>
        </div>
        <div className="rp-target-kit-items">
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
        <section className="rp-target-card rp-ref-breakdown-card rp-ref-breakdown-card--open rp-ref-breakdown-card--detailed">
          <div className="rp-ref-breakdown-card__head">
            <h3>Предварительная смета</h3>
            <span>{formatPrice(estimateTotal)} ₽</span>
          </div>
          <p className="rp-ref-breakdown-note">Сейчас это frontend-оценка. Backend позже будет считать по актуальным ценам материалов, фурнитуры и работ.</p>
          {estimateRows.map(row => <EstimateRow key={row.key} row={row} total={estimateTotal} />)}
        </section>
      )}
    </aside>
  )
}