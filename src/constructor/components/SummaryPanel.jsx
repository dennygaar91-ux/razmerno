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
  const hasIssues = validation.length > 0;
  const totalFill = totals.shelves + totals.drawers + totals.rails;
  const dimensionsText = `${config.dimensions.width}×${config.dimensions.height}×${config.dimensions.depth}`;

  return (
    <aside className={`cp-summary cp-summary-target ${pricePulse ? "is-price-updated" : ""}`}>
      <div className="cp-summary-hero">
        <span className="cp-eyebrow">Ваш проект</span>
        <h3>{hasIssues ? "Нужно проверить" : "Шкаф почти готов"}</h3>
        <p>
          {hasIssues
            ? "Проверьте подсказки ниже — после исправления проект можно будет отправить в заказ."
            : "Комплект рассчитан. Можно сохранить проект или перейти к оформлению."}
        </p>
      </div>

      <div className="cp-summary-price-block">
        <span>Стоимость комплекта</span>
        <strong>{price.toLocaleString("ru-RU")} ₽</strong>
        <small>Предварительная цена по текущей конфигурации</small>
      </div>

      <div className="cp-summary-strip" aria-label="Краткая сводка">
        <div>
          <span>Размер</span>
          <b>{dimensionsText}</b>
        </div>
        <div>
          <span>Секции</span>
          <b>{sectionCount}</b>
        </div>
        <div>
          <span>Элементы</span>
          <b>{totalFill}</b>
        </div>
      </div>

      <ProjectReadinessPanel config={config} validation={validation} />
      <ProjectKitPanel result={result} />
      <AdvancedSettingsPanel config={config} onBackPanel={onBackPanel} onWallMount={onWallMount} />

      {notice ? <p className="cp-notice">{notice}</p> : null}

      <div className="cp-summary-actions">
        <button type="button" className="cp-primary" onClick={onOrder}>Оформить заказ</button>
        <button type="button" onClick={onSaveDraft}>Сохранить</button>
        <button type="button" onClick={onExport}>Чертежи</button>
      </div>
    </aside>
  );
}
