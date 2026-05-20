import Icon from '../../icons/Icon'

export function UiPillTabs({ tabs, active, onChange }) {
  return (
    <div className="rzm-kit-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`rzm-kit-tab ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.icon && <Icon name={tab.icon} size={15} />}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export function UiStatus({ children, tone = 'default' }) {
  return <span className={`rzm-kit-status is-${tone}`}>{children}</span>
}

export function UiButton({ children, variant = 'primary', className = '', ...props }) {
  return <button type="button" className={`rzm-kit-button is-${variant} ${className}`} {...props}>{children}</button>
}

export function UiCard({ children, className = '' }) {
  return <section className={`rzm-kit-card ${className}`}>{children}</section>
}

export function UiSegmented({ items, active, onChange }) {
  return (
    <div className="rzm-kit-segmented">
      {items.map((item) => (
        <button key={item.id} type="button" className={active === item.id ? 'is-active' : ''} onClick={() => onChange?.(item.id)} aria-label={item.label}>
          {item.icon ? <Icon name={item.icon} size={16} /> : item.label}
        </button>
      ))}
    </div>
  )
}

export function UiEmptyState({ icon = 'grid', title, text }) {
  return (
    <div className="rzm-kit-empty">
      <div className="rzm-kit-empty__icon"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export function UiMaterialCard({ title, subtitle, color, active, onClick }) {
  return (
    <button type="button" className={`rzm-kit-material ${active ? 'is-active' : ''}`} onClick={onClick}>
      <span className="rzm-kit-material__swatch" style={{ background: color }} />
      <span><b>{title}</b><small>{subtitle}</small></span>
    </button>
  )
}

export function UiPriceCard({ price, rows = [], cta = 'Отправить заявку', onSubmit }) {
  return (
    <aside className="rzm-kit-price rzm-kit-card">
      <div>
        <p className="rzm-kit-price__label">Предварительная стоимость</p>
        <strong>{Number(price || 0).toLocaleString('ru-RU')} ₽</strong>
        <span className="rzm-kit-price__note">Финальную сумму подтвердит технолог.</span>
      </div>
      <div className="rzm-kit-price__rows">
        {rows.map((row) => <p key={row.label}><span>{row.label}</span><b>{Number(row.value || 0).toLocaleString('ru-RU')} ₽</b></p>)}
      </div>
      <div className="rzm-kit-price__footer">
        <p><span>Срок изготовления</span><b>14 дней</b></p>
        <UiButton onClick={onSubmit}>{cta} <Icon name="arrow-right" size={16} /></UiButton>
        <small>Оплата сейчас не списывается.</small>
      </div>
    </aside>
  )
}
