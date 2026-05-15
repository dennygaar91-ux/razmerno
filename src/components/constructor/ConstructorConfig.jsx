import Icon from '../../icons/Icon'

const dimensions = [
  ['Высота, мм', '2400', '200–2800'],
  ['Ширина, мм', '1800', '400–3000'],
  ['Глубина, мм', '600', '300–800'],
  ['Количество секций', '3', 'от 1 до 6'],
]

function CounterField({ label, value, hint }) {
  return (
    <div className="rp-ref-field">
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="rp-ref-counter">
        <button type="button">−</button>
        <input value={value} readOnly inputMode="numeric" />
        <button type="button">+</button>
      </div>
    </div>
  )
}

export default function ConstructorConfig() {
  return (
    <aside className="rp-ctor-card rp-ctor-config rp-ref-config">
      <div className="rp-ref-panel-head">
        <span>1</span>
        <div>
          <h2>Размеры и секции</h2>
          <p>Укажите габариты шкафа и количество секций. Конструктор сразу пересчитает проект.</p>
        </div>
      </div>

      <div className="rp-ref-fields">
        {dimensions.map(([label, value, hint]) => (
          <CounterField label={label} value={value} hint={hint} key={label} />
        ))}
      </div>

      <div className="rp-ref-block">
        <h3>Ширина секции</h3>
        <p>Автоматическое распределение</p>
        <div className="rp-ref-section-widths">
          <button type="button">600 мм</button>
          <button type="button">600 мм</button>
          <button type="button">600 мм</button>
        </div>
      </div>

      <div className="rp-ref-block rp-ref-info">
        <Icon name="clock" size={16} />
        <span>Размеры можно изменить на любом шаге</span>
      </div>
    </aside>
  )
}
