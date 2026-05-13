import PricingBreakdown from "../PricingBreakdown";
import IntelligenceInlineCard from "../intelligence/IntelligenceInlineCard";

export default function ConstructorSummary({
  config,
  validation,
  result,
  totals,
  sectionCount,
  price,
  pricePulse,
  notice,
  onSaveDraft,
  onGoToOrder,
  onExportNotice,
}) {
  return (
    <aside className={`cp-summary ${pricePulse ? "is-price-updated" : ""}`}>
      <span className="cp-eyebrow">Итого</span>
      <strong>{price.toLocaleString("ru-RU")} ₽</strong>
      <small>Ориентировочная стоимость комплекта</small>

      <div className="cp-summary-list">
        <div>
          <span>Размеры</span>
          <b>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</b>
        </div>
        <div>
          <span>Секции</span>
          <b>{sectionCount}</b>
        </div>
        <div>
          <span>Полки</span>
          <b>{totals.shelves}</b>
        </div>
        <div>
          <span>Ящики</span>
          <b>{totals.drawers}</b>
        </div>
        <div>
          <span>Штанги</span>
          <b>{totals.rails}</b>
        </div>
      </div>

      <PricingBreakdown price={result.price} />
      <IntelligenceInlineCard config={config} validation={validation} />

      {notice ? <p className="cp-notice">{notice}</p> : null}

      <button type="button" className="cp-primary" onClick={onGoToOrder}>В корзину</button>
      <button type="button" onClick={onSaveDraft}>Сохранить проект</button>
      <button type="button" onClick={onExportNotice}>Скачать чертежи</button>
    </aside>
  );
}
