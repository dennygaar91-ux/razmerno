export default function StatusBadge({ tone = 'neutral', children, title, className = '' }) {
  return (
    <span className={`rp-status-badge is-${tone} ${className}`.trim()} title={title}>
      {children}
    </span>
  )
}
