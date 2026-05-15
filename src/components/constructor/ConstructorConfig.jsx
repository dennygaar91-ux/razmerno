import Icon from '../../icons/Icon'

const dimensions = [
  ['Высота, мм', '2400'],
  ['Ширина, мм', '1800'],
  ['Глубина, мм', '600'],
]

const steps = [
  ['✓', 'Размеры', 'done'],
  ['2', 'Секции', 'active'],
  ['3', 'Наполнение', ''],
  ['4', 'Материалы', ''],
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

export default function ConstructorConfig() {
  return (
    <aside className="rp-ctor-card rp-ctor-config">
      <div className="rp-ctor-title">
        <h1>Конструктор шкафа</h1>
        <p>Шаг 2 из 4 — Секции</p>
      </div>

      <div className="rp-ctor-steps" aria-label="Этапы настройки шкафа">
        {steps.map(([num, label, state]) => (
          <div className={`rp-ctor-step ${state ? `is-${state}` : ''}`} key={label}>
            <span>{num}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <div className="rp-ctor-block">
        <h2>Параметры шкафа</h2>
        {dimensions.map(([label, value]) => (
          <label className="rp-ctor-field" key={label}>
            <span>{label}</span>
            <input value={value} inputMode="numeric" readOnly />
          </label>
        ))}
      </div>

      <div className="rp-ctor-block">
        <h2>Конфигурация</h2>
        <div className="rp-ctor-schemas">
          <button type="button" aria-label="Одна секция"><MiniSchema variant="one" /></button>
          <button className="is-active" type="button" aria-label="Две секции"><MiniSchema variant="two" /></button>
          <button type="button" aria-label="Три секции"><MiniSchema variant="three" /></button>
        </div>
      </div>

      <div className="rp-ctor-block">
        <h2>Количество секций</h2>
        <div className="rp-ctor-segment rp-ctor-segment--three">
          <button type="button">2 секции</button>
          <button className="is-active" type="button">3 секции</button>
          <button type="button">4 секции</button>
        </div>
      </div>

      <div className="rp-ctor-block">
        <h2>Тип шкафа</h2>
        <div className="rp-ctor-segment">
          <button className="is-active" type="button">Корпусный</button>
          <button type="button">Встроенный</button>
        </div>
      </div>

      <button className="rp-ctor-next" type="button">
        Далее: наполнение
        <Icon name="arrow-right" size={15} />
      </button>
    </aside>
  )
}
