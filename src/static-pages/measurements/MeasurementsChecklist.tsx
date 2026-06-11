export function MeasurementsChecklist() {
  return (
  <section className="rzm-info-section rzm-info-checklist rzm-measurements-checklist-v54 rzm-reveal">
    <div className="rzm-measurements-checklist-copy">
      <span className="rzm-how-chip-title">
        <span className="rzm-chip-dot"></span>
        Проверка
      </span>
      <h2>Чек-лист перед конструктором</h2>
      <p className="rzm-hero-lead">Проверьте четыре пункта — этого достаточно для понятной заявки.</p>
      <div className="rzm-info-checks">
        <label>
          <input type="checkbox" />
           Ширина измерена сверху, по центру и снизу.
        </label>
        <label>
          <input type="checkbox" />
           Высота измерена слева, по центру и справа.
        </label>
        <label>
          <input type="checkbox" />
           Глубина проверена с учётом прохода и фасадов.
        </label>
        <label>
          <input type="checkbox" />
           Плинтус, трубы и розетки сфотографированы.
        </label>
      </div>
    </div>
    <div className="rzm-measurements-checklist-visual" aria-hidden="true">
      <img src="/assets/measurements-checklist.jpeg" alt="" />
      <span>готово к конструктору</span>
    </div>
  </section>
  );
}
