export function ClientValidationCard({
  status,
  isLoading,
  error,
}: {
  status: "ready" | "warning";
  isLoading: boolean;
  error: string;
}) {
  return (
    <div className="rzm-client-validation-card" aria-label="Автопроверка конфигурации">
      <div className="rzm-client-validation-head">
        <div>
          <span className="rzm-how-chip-title"><span className="rzm-chip-dot" />Автопроверка</span>
          <p className="rzm-step-text">Конструктор помогает заранее проверить конфигурацию перед заявкой.</p>
        </div>
        <span className={`rzm-client-validation-status rzm-client-validation-status--${status}`}>
          {isLoading ? "Проверяем" : status === "warning" ? "Уточним" : "В порядке"}
        </span>
      </div>

      <div className="rzm-client-validation-list">
        <span><i>✓</i>Размеры приняты для расчёта</span>
        <span><i>✓</i>Наполнение собрано по секциям</span>
        <span><i>✓</i>Перед запуском заказ проверит менеджер</span>
      </div>

      {error && (
        <p className="rzm-step-text rzm-client-validation-note">Есть техническое предупреждение. Его увидит менеджер при проверке заявки.</p>
      )}
    </div>
  );
}
