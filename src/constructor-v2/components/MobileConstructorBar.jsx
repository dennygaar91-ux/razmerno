import "../styles/constructor-v2-mobile-bar.css";

export default function MobileConstructorBar({ price, dimensions }) {
  return (
    <div className="rv2-mobile-bar" role="region" aria-label="Быстрые действия конструктора">
      <div>
        <span>Стоимость</span>
        <strong>{price.toLocaleString("ru-RU")} ₽</strong>
        <small>{dimensions.width} × {dimensions.height} × {dimensions.depth} мм</small>
      </div>

      <button type="button">В корзину</button>
    </div>
  );
}
