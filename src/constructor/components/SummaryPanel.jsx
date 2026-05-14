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

  return (
    <aside className={`cp-summary ${pricePulse ? "is-price-updated" : ""}`}>
      <div className="cp-summary-hero">
        <span className="cp-eyebrow">Ваш проект</span>
        <h3>{hasIssues ? "Нужно проверить" : "Шкаф почти готов"}</h3>
        <p>
          {hasIssues
            ? "Проверьте подсказки ниже — после исправления проект можно будет отправить в заказ."
            : "Мы уже посчитали комплект. Осталось сохранить проект или перейти к оформлению."}
        </p>
      </div>

      <div className="cp-summary-price-block">
        <span>Стоимость комплекта</span>
        <strong>{price.toLocaleString("ru-RU")} ₽</strong>
        <small>Предварительно, по текущим размерам и наполнению</small>
      </div>

      <div className="cp-summary-list">
        <div>
          <span>Габариты</span>
          <b>{config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}</b>
        </div>
        <div>
          <span>Секции</span>
          <b>{sectionCount}</b>
        </div>
        <div>
          <span>Наполнение</span>
          <b>{totalFill}</b>
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

      <button type="button" className="cp-primary" onClick={onOrder}>Оформить заказ</button>
      <button type="button" onClick={onSaveDraft}>Сохранить проект</button>
      <button type="button" onClick={onExport}>Получить чертежи</button>
    </aside>
  );
}
