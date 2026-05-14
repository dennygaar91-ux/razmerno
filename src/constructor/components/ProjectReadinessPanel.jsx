import "../../styles/constructor-readiness.css";

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function getProjectInsights(config, validation = []) {
  const sections = config.sections || [];
  const width = Number(config.dimensions?.width) || 0;
  const height = Number(config.dimensions?.height) || 0;
  const depth = Number(config.dimensions?.depth) || 0;
  const hasBackPanel = config.options?.hasBackPanel !== false;
  const wallMount = Boolean(config.options?.wallMount);
  const emptySections = sections.filter((section) => section.items.length === 0).length;
  const totalDrawers = sections.reduce((sum, section) => sum + getItemCount(section, "drawer"), 0);
  const totalRails = sections.reduce((sum, section) => sum + getItemCount(section, "hanger_rail"), 0);
  const totalShelves = sections.reduce((sum, section) => sum + getItemCount(section, "shelf"), 0);
  const errors = validation.filter((item) => item.type === "error");
  const warnings = validation.filter((item) => item.type === "warning");

  const insights = [];

  if (errors.length === 0) {
    insights.push({ type: "success", text: "Размеры подходят для расчёта комплекта" });
  }

  if (sections.length > 0) {
    insights.push({ type: "success", text: `Секции готовы: ${sections.length}` });
  }

  if (hasBackPanel) {
    insights.push({ type: "success", text: "Задняя стенка добавит жёсткость корпусу" });
  } else {
    insights.push({ type: "warning", text: "Без задней стенки шкаф будет менее устойчивым" });
  }

  if (depth > 0 && depth < 520 && totalRails > 0) {
    insights.push({ type: "warning", text: "Для плечиков лучше глубина от 520 мм" });
  }

  if (height >= 2200 && !wallMount) {
    insights.push({ type: "warning", text: "Высокий шкаф лучше закрепить к стене" });
  }

  if (height >= 2200 && wallMount) {
    insights.push({ type: "success", text: "Крепление к стене добавлено" });
  }

  if (emptySections > 0) {
    insights.push({ type: "warning", text: `Пустые секции: ${emptySections}` });
  }

  if (width > 2600 && sections.length < 3) {
    insights.push({ type: "warning", text: "Для широкого шкафа стоит добавить секции" });
  }

  if (totalDrawers > 0) {
    insights.push({ type: "success", text: `Ящики в проекте: ${totalDrawers}` });
  }

  if (totalShelves > 0) {
    insights.push({ type: "success", text: `Полки в проекте: ${totalShelves}` });
  }

  warnings.slice(0, 2).forEach((item) => {
    if (!insights.some((insight) => insight.text === item.message)) {
      insights.push({ type: "warning", text: item.message });
    }
  });

  errors.slice(0, 2).forEach((item) => {
    insights.unshift({ type: "error", text: item.message });
  });

  const baseScore = 100;
  const score = Math.max(
    0,
    Math.min(
      100,
      baseScore - errors.length * 30 - warnings.length * 8 - emptySections * 10 - (depth < 300 ? 14 : 0) - (!hasBackPanel ? 10 : 0) - (height >= 2200 && !wallMount ? 8 : 0)
    )
  );

  return {
    score,
    status: errors.length > 0 ? "Требует правки" : score >= 82 ? "Можно оформлять" : "Есть рекомендации",
    description:
      errors.length > 0
        ? "Исправьте замечания ниже, чтобы проект можно было передать в заказ."
        : score >= 82
          ? "Основные параметры выглядят корректно. Финальную проверку сделаем перед производством."
          : "Проект можно улучшить перед оформлением.",
    insights: insights.slice(0, 5),
  };
}

export default function ProjectReadinessPanel({ config, validation }) {
  const { score, status, description, insights } = getProjectInsights(config, validation);

  return (
    <section className="cp-readiness" aria-label="Проверка проекта">
      <div className="cp-readiness-head">
        <div>
          <span>Проверка</span>
          <strong>{status}</strong>
          <small>{description}</small>
        </div>
        <b>{score}%</b>
      </div>

      <div className="cp-readiness-meter" aria-hidden="true">
        <i style={{ width: `${score}%` }} />
      </div>

      <div className="cp-readiness-list">
        {insights.map((item, index) => (
          <p key={`${item.type}-${index}`} className={`is-${item.type}`}>
            <span>{item.type === "success" ? "✓" : item.type === "error" ? "!" : "•"}</span>
            {item.text}
          </p>
        ))}
      </div>
    </section>
  );
}
