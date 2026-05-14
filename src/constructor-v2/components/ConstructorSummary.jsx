import "../styles/constructor-v2-summary.css";

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function getPartsCount(result) {
  return result?.parts?.length || 0;
}

export default function ConstructorSummary({ config, result, validation }) {
  const price = result?.price?.total || 0;
  const hasIssues = validation.length > 0;
  const readiness = hasIssues ? 76 : 96;
  const shelves = config.sections.reduce((sum, section) => sum + getItemCount(section, "shelf"), 0);
  const drawers = config.sections.reduce((sum, section) => sum + getItemCount(section, "drawer"), 0);
  const rails = config.sections.reduce((sum, section) => sum + getItemCount(section, "hanger_rail"), 0);
  const totalFill = shelves + drawers + rails;
  const dimensionsText = `${config.dimensions.width} × ${config.dimensions.height} × ${config.dimensions.depth}`;

  return (
    <aside className="rv2-summary">
      <div className="rv2-summary-top">
        <span>Ваш проект</span>
        <h3>{hasIssues ? "Нужно проверить" : "Шкаф почти готов"}</h3>
        <p>
          {hasIssues
            ? "Есть подсказки по конструкции. Проверьте параметры перед оформлением заказа."
            : "Комплект рассчитан. Можно сохранить проект или перейти к оформлению."}
        </p>
      </div>

      <div className="rv2-price-card">
        <span>Стоимость комплекта</span>
        <strong>{price.toLocaleString("ru-RU")} ₽</strong>
      </div>

      <div className="rv2-facts">
        <span>Параметры</span>

        <div className="rv2-fact-row">
          <p>Размеры</p>
          <b>{dimensionsText}</b>
        </div>

        <div className="rv2-fact-row">
          <p>Секции</p>
          <b>{config.sections.length} шт.</b>
        </div>

        <div className="rv2-fact-row">
          <p>Наполнение</p>
          <b>{totalFill} элементов</b>
        </div>
      </div>

      <div className="rv2-check-card">
        <span>Проверка</span>

        <div className="rv2-check-head">
          <p>{hasIssues ? validation[0]?.message || "Проверьте проект" : "Конструкция надёжна и готова к сборке"}</p>
          <strong>{readiness}%</strong>
        </div>

        <div className="rv2-progress-line">
          <i style={{ width: `${readiness}%` }} />
        </div>
      </div>

      <div className="rv2-kit-card">
        <span>Комплект</span>

        <div className="rv2-kit-grid">
          <div>
            <b>Детали</b>
            <p>{getPartsCount(result)} шт.</p>
          </div>

          <div>
            <b>Полки</b>
            <p>{shelves} шт.</p>
          </div>

          <div>
            <b>Ящики</b>
            <p>{drawers} шт.</p>
          </div>
        </div>
      </div>

      <div className="rv2-summary-actions">
        <button type="button" className="primary">
          В корзину
        </button>

        <button type="button">Сохранить</button>

        <button type="button">Чертежи</button>
      </div>
    </aside>
  );
}
