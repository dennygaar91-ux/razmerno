import AdvancedSettingsPanel from "./AdvancedSettingsPanel";
import ProjectKitPanel from "./ProjectKitPanel";
import ProjectReadinessPanel from "./ProjectReadinessPanel";

export default function SummaryPanel({
  config,
  validation,
  result,
  totals,
  price,
  sectionCount,
  pricePulse,
  notice,
  onBackPanel,
  onWallMount,
  onSaveDraft,
  onOrder,
  onExport,
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

      <ProjectReadinessPanel config={config} validation={validation} />
      <ProjectKitPanel result={result} />
      <AdvancedSettingsPanel config={config} onBackPanel={onBackPanel} onWallMount={onWallMount} />

      {notice ? <p className="cp-notice">{notice}</p> : null}

      <button type="button" className="cp-primary" onClick={onOrder}>В корзину</button>
      <button type="button" onClick={onSaveDraft}>Сохранить проект</button>
      <button type="button" onClick={onExport}>Скачать чертежи</button>
    </aside>
  );
}
