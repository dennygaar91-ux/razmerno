export default function MaterialSelect({ title, name, color, onClick }) {
  return (
    <button type="button" className="cp-material-select" onClick={onClick}>
      {color ? <span style={{ background: color }} /> : <i />}

      <div>
        <small>{title}</small>
        <strong>{name}</strong>
      </div>

      <em>Изменить</em>
    </button>
  );
}
