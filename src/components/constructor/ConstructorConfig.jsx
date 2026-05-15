import Icon from '../../icons/Icon'

const constructorSteps = [
  { id: 'dimensions', title: 'Размеры' },
  { id: 'sections', title: 'Секции' },
  { id: 'filling', title: 'Наполнение' },
  { id: 'materials', title: 'Материалы' },
  { id: 'summary', title: 'Расчёт' },
]

const dimensions = [
  ['Высота, мм', '2400', '400–2800 мм'],
  ['Ширина, мм', '1800', '400–3600 мм'],
  ['Глубина, мм', '600', '300–900 мм'],
]

function MiniSchema({ variant }) {
  return (
    <span className={`rp-ctor-schema rp-ctor-schema--${variant}`}>
      <i />
      {variant !== 'one' && <i />}
      {variant === 'three' && <i />}
    </span>
  )
}

function StepIndicator() {
  return (
    <div className="rp-ctor-steps rp-ctor-steps--five" aria-label="Этапы настройки шкафа">
      {constructorSteps.map((step, index) => {
        const state = index === 0 ? 'is-active' : ''
        return (
          <div className={`rp-ctor-step ${state}`} key={step.id}>
            <span>{index + 1}</span>
            <small>{step.title}</small>
          </div>
        )
      })}
    </div>
  )
}

export default function ConstructorConfig({ onCheckout }) {
  return (
    <aside className="rp-ctor-card rp-ctor-config">
      <div className="rp-ctor-title">
        <h1>Конструктор шкафа</h1>
        <p>Шаг 1 из 5 — Размеры</p>
      </div>

      <StepIndicator />

      <div className="rp-ctor-step-panel">
        <div className="rp-ctor-block rp-ctor-block--first">
          <h2>Параметры шкафа</h2>
          <p className="rp-ctor-helptext">Введите точные размеры будущего изделия. Стоимость справа обновляется по мере настройки проекта.</p>
          {dimensions.map(([label, value, hint]) => (
            <label className="rp-ctor-field rp-ctor-field--stacked" key={label}>
              <span>{label}</span>
              <input value={value} inputMode="numeric" readOnly />
              <small>{hint}</small>
            </label>
          ))}
        </div>

        <div className="rp-ctor-block">
          <h2>Быстрый старт</h2>
          <div className="rp-ctor-presets">
            <button className="is-active" type="button">Шкаф для одежды</button>
            <button type="button">Стеллаж</button>
            <button type="button">Комод</button>
          </div>
        </div>

        <details className="rp-ctor-advanced">
          <summary>Расширенные настройки</summary>
          <div>
            <button type="button">Задняя стенка</button>
            <button type="button">Цоколь</button>
            <button type="button">Кромка</button>
            <button type="button">Фурнитура</button>
          </div>
        </details>
      </div>

      <div className="rp-ctor-config-foot">
        <button className="rp-ctor-back" type="button" disabled>Назад</button>
        <button className="rp-ctor-next" type="button">
          Далее: секции
          <Icon name="arrow-right" size={15} />
        </button>
      </div>

      <button className="rp-ctor-mobile-checkout" type="button" onClick={onCheckout}>Оформить проект</button>
    </aside>
  )
}
