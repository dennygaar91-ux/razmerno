export default function FillCounter({ label, value, onMinus, onPlus }) {
  return (
    <div className="cp-fill-counter">
      <span>{label}</span>
      <div>
        <button type="button" onClick={onMinus}>−</button>
        <b>{value}</b>
        <button type="button" onClick={onPlus}>+</button>
      </div>
    </div>
  );
}
