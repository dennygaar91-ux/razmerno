import Icon from '../../../icons/Icon'

const actions = [
  ['shelves', 'Полка', 'Добавить горизонтальную полку'],
  ['drawers', 'Ящик', 'Добавить выдвижной ящик'],
]

export default function ViewerQuickActions({ activeSection, railDisabled, onSectionPartChange, onRailToggle, onClearSection }) {
  return (
    <div className="rp-ref-quick-actions rp-ref-quick-actions--polished" role="group" aria-label="Быстрые действия с активной секцией">
      {actions.map(([type, title, text]) => (
        <button type="button" key={type} aria-label={`${text} в активную секцию`} onClick={() => onSectionPartChange(type, 1)}>
          <span className="rp-ref-quick-actions__icon"><Icon name="plus" size={15} /></span>
          <span>{title}<small>{text}</small></span>
        </button>
      ))}

      <button className={activeSection.rail ? 'is-active' : ''} type="button" disabled={railDisabled} aria-pressed={activeSection.rail} aria-label={activeSection.rail ? 'Убрать штангу из активной секции' : 'Добавить штангу в активную секцию'} onClick={onRailToggle}>
        <span className="rp-ref-quick-actions__icon"><i className="rp-ref-rail-icon" /></span>
        <span>{activeSection.rail ? 'Штанга есть' : 'Штанга'}<small>{railDisabled ? 'Нужна глубина 520 мм' : 'Для одежды на плечиках'}</small></span>
      </button>

      <button className="is-danger-soft" type="button" aria-label="Очистить активную секцию" onClick={onClearSection}>
        <span className="rp-ref-quick-actions__icon"><Icon name="x" size={14} /></span>
        <span>Очистить<small>Сбросить секцию</small></span>
      </button>
    </div>
  )
}