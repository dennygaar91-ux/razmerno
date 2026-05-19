import { useMemo, useState } from 'react'
import { getEstimateRows, groupConstructorWarnings } from '../../utils/constructorPricing'

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

function CheckItem({ done, children, warning }) {
  return (
    <li className={done ? 'is-done' : warning ? 'has-warning' : ''}>
      <span>{done ? '✓' : warning ? '!' : '○'}</span>
      <b>{children}</b>
    </li>
  )
}

function SummaryStatusList({ warnings, warningGroups, isReady }) {
  const critical = warningGroups.critical
  const recommendations = warningGroups.recommendations
  const info = warningGroups.info

  if (isReady) {
    return (
      <div className="rp-summary-status-list rp-summary-status-list--ok">
        <div className="rp-summary-status-list__item is-success">
          <span>✓</span>
          <div>
            <b>Критичных ограничений нет</b>
            <small>Проект можно отправить на проверку технологом.</small>
          </div>
        </div>
      </div>
    )
  }

  if (!warnings.length) {
    return (
      <div className="rp-summary-status-list rp-summary-status-list--ok">
        <div className="rp-summary-status-list__item is-success">
          <span>✓</span>
          <div>
            <b>Ограничений нет</b>
            <small>Заполните оставшиеся шаги, чтобы перейти к заявке.</small>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-summary-status-list">
      {critical.length > 0 && (
        <div className="rp-summary-status-group is-critical">
          <div className="rp-summary-status-group__head">
            <span>Критично</span>
            <b>{critical.length}</b>
          </div>
          {critical.slice(0, 3).map((item) => (
            <div className="rp-summary-status-list__item is-critical" key={item.text}>
              <span>!</span>
              <div>
                <b>{item.text}</b>
                <small>Лучше исправить до заявки, чтобы технолог не вернул проект на доработку.</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="rp-summary-status-group is-recommendation">
          <div className="rp-summary-status-group__head">
            <span>Рекомендации</span>
            <b>{recommendations.length}</b>
          </div>
          {recommendations.slice(0, 3).map((item) => (
            <div className="rp-summary-status-list__item is-recommendation" key={item.text}>
              <span>i</span>
              <div>
                <b>{item.text}</b>
                <small>Можно отправить проект, но лучше проверить параметр.</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {info.length > 0 && (
        <div className="rp-summary-status-group is-info">
          <div className="rp-summary-status-group__head">
            <span>Инфо</span>
            <b>{info.length}</b>
          </div>
          {info.slice(0, 2).map((item) => (
            <div className="rp-summary-status-list__item is-info" key={item.text}>
              <span>i</span>
              <div>
                <b>{item.text}</b>
                <small>Информационная подсказка для проверки проекта.</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 6 && (
        <p className="rp-summary-status-list__more">Показаны основные пункты. Остальные рекомендации видны в левой панели.</p>
      )}
    </div>
  )
}

const nextSteps = [
  ['1', 'Проверим проект', 'Технолог посмотрит размеры, секции и выбранные материалы.'],
  ['2', 'Уточним стоимость', 'Подтвердим цену после проверки материалов, фурнитуры и работ.'],
  ['3', 'Подготовим комплект', 'После согласования подготовим детали, кромку и фурнитуру для сборки.'],
]

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
    ['Детали корпуса', `${summary.parts ?? 36} позиций`],
    ['Полки и перегородки', `${summary.shelves} полок`],
    ['Ящики', `${summary.drawers} шт.`],
    ['Кромка', project.material?.edge ?? 'ABS по выбранной спецификации'],
    ['Фурнитура', project.material?.hardware ?? '1 комплект'],
  ]

  const dimensionsDone = project.dimensions.height > 0 && project.dimensions.width > 0 && project.dimensions.depth > 0
  const fillingDone = summary.elements > 0
  const materialsDone = Boolean(project.material?.materialId && project.material?.edgeId && project.material?.handleId && project.material?.hardwareId)
  const warningGroups = useMemo(() => groupConstructorWarnings(warnings), [warnings])
  const criticalCount = warningGroups.critical.length
  const recommendationCount = warningGroups.recommendations.length
  const infoCount = warningGroups.info.length
  const isReady = warnings.length === 0 && dimensionsDone && fillingDone && materialsDone
  const isCalculating = estimateState === 'loading'
  const hasEstimateError = estimateState === 'error'
  const breakdown = project.priceBreakdown ?? {}
  const estimateRows = useMemo(() => getEstimateRows(project, summary, breakdown), [project, summary, breakdown])
  const estimateTotal = estimateRows.reduce((sum, row) => sum + row.value, 0)
  const statusText = isCalculating
    ? 'Проверяем'
    : hasEstimateError
      ? 'Предварительно'
      : criticalCount
        ? `${criticalCount} критично`
        : recommendationCount
          ? `${recommendationCount} рекомендац.`
          : infoCount
            ? `${infoCount} инфо`
            : isReady
              ? 'Готово к заявке'
              : 'Проверьте пункты'
  const statusClass = isCalculating ? 'is-loading' : hasEstimateError ? 'has-error' : isReady ? 'is-ready' : warnings.length ? 'has-warning' : 'is-neutral'

  return (
    <aside className={`rp-ctor-summary rp-ref-summary rp-target-summary rp-summary-trust ${statusClass}`}>
      <section className="rp-target-card rp-target-ready-card rp-summary-trust-card">
        <div>
          <span>Ваш проект</span>
          <h3>{isReady ? 'Можно отправлять' : 'Почти готово'}</h3>
          <p>{isReady ? 'Параметры заполнены. Заявку можно передать на проверку технологом.' : criticalCount ? 'Есть ограничения, которые лучше исправить до заявки.' : 'Проверьте размеры, наполнение и материалы перед заявкой.'}</p>
        </div>
      </section>

      <section className="rp-target-card rp-target-price-card rp-summary-price-card">
        <p>Предварительная стоимость</p>
        <strong>{formatPrice(project.price)} ₽</strong>
        <span>{isCalculating ? 'Пересчитываем…' : 'Расчёт по текущим размерам, наполнению и выбранной спецификации'}</span>
        <div className="rp-summary-price-card__trust">
          <small>Не финальный счёт</small>
          <small>Проверка технологом</small>
        </div>
        <button type="button" onClick={onCheckout}>Отправить заявку</button>
      </section>

      <section className="rp-target-card rp-target-project-card">
        {projectRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>

      <section className="rp-target-card rp-target-check-card rp-target-check-card--list rp-target-check-card--structured">
        <div className="rp-target-check-card__head">
          <h3>Проверка проекта</h3>
          <span>{statusText}</span>
        </div>
        <ul className="rp-target-checklist rp-target-checklist--base">
          <CheckItem done={dimensionsDone}>Размеры заданы</CheckItem>
          <CheckItem done={fillingDone}>Наполнение настроено</CheckItem>
          <CheckItem done={materialsDone}>Материалы выбраны</CheckItem>
        </ul>
        <SummaryStatusList warnings={warnings} warningGroups={warningGroups} isReady={isReady} />
      </section>

      <section className="rp-target-card rp-target-kit-card rp-summary-kit-card">
        <div className="rp-target-kit-head">
          <h3>Состав комплекта</h3>
          <button type="button" onClick={() => setEstimateOpen(open => !open)}>{estimateOpen ? 'Скрыть смету' : 'Показать смету'}</button>
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

      <section className="rp-target-card rp-summary-next-card">
        <div className="rp-summary-next-card__head">
          <span>После заявки</span>
          <h3>Что будет дальше</h3>
        </div>
        <div className="rp-summary-next-card__steps">
          {nextSteps.map(([num, title, text]) => (
            <div key={num}>
              <b>{num}</b>
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
