export default function ConstructorProgress() {
  return (
    <div className="rv2-progress">
      <button type="button" className="active">
        <b>1</b>
        <div>
          <strong>Размеры</strong>
          <span>Укажите габариты и секции</span>
        </div>
      </button>

      <button type="button">
        <b>2</b>
        <div>
          <strong>Наполнение</strong>
          <span>Полки, ящики и штанги</span>
        </div>
      </button>

      <button type="button">
        <b>3</b>
        <div>
          <strong>Материалы</strong>
          <span>Декоры и фурнитура</span>
        </div>
      </button>
    </div>
  );
}
