export default function FillCounter({ label, value, onMinus, onPlus, icon = "+", desc = "" }) {
  return (
    <div className="cp-fill-counter cp-fill-counter-card">
      <div className="cp-fill-counter-copy">
        <span className="cp-fill-counter-icon" aria-hidden="true">{icon}</span>
        <div>
          <span>{label}</span>
          {desc ? <small>{desc}</small> : null}
        </div>
      </div>
      <div className="cp-fill-counter-stepper" aria-label={`${label}: ${value}`}>
        <button type="button" onClick={onMinus} aria-label={`Уменьшить: ${label}`}>−</button>
        <b>{value}</b>
        <button type="button" onClick={onPlus} aria-label={`Добавить: ${label}`}>+</button>
      </div>
    </div>
  );
}
