import Icon from '../../icons/Icon'

const railItems = [
  ['cube', 'Конструктор', true],
  ['layers', 'Материалы', false],
  ['projects', 'Проекты', false],
  ['star', 'Избранное', false],
]

export default function ConstructorRail() {
  return (
    <aside className="rp-ctor-rail">
      <button className="rp-ctor-rail-step" type="button">①</button>
      <nav className="rp-ctor-rail-nav" aria-label="Разделы конструктора">
        {railItems.map(([icon, label, active]) => (
          <button className={active ? 'is-active' : ''} type="button" key={label}>
            <Icon name={icon} size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="rp-ctor-help" type="button">
        <Icon name="message" size={22} />
        <span>Помощь</span>
      </button>
    </aside>
  )
}
