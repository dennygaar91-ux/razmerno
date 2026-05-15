import Icon from '../../../icons/Icon'

export default function ViewerQuickActions({ activeSection, railDisabled, onSectionPartChange, onRailToggle, onClearSection }) {
  return (
    <div className="rp-ref-quick-actions">
      <button type="button" onClick={() => onSectionPartChange('shelves', 1)}><Icon name="plus" size={16} />Полка</button>
      <button type="button" onClick={() => onSectionPartChange('drawers', 1)}><Icon name="plus" size={16} />Ящик</button>
      <button className={activeSection.rail ? 'is-active' : ''} type="button" disabled={railDisabled} onClick={onRailToggle}><span className="rp-ref-rail-icon" />Штанга</button>
      <button type="button" onClick={onClearSection}><Icon name="x" size={15} />Очистить</button>
    </div>
  )
}
