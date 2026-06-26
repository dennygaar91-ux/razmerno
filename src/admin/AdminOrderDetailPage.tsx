import type { AdminOrderDetailSummary } from "./orderSummary";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--rzm-line-soft)] py-3 md:grid-cols-[220px_1fr] md:gap-4 last:border-b-0">
      <div className="control-meta">{label}</div>
      <div className="text-[14px] leading-[1.55]">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rzm-card-soft p-4">
      <div className="control-meta">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold tracking-[-0.04em]">{value}</div>
    </div>
  );
}

export function AdminOrderDetailPage({
  summary,
  loading,
  onBack,
}: {
  summary: AdminOrderDetailSummary | null;
  loading: boolean;
  onBack: () => void;
}) {
  if (!summary) {
    return (
      <section className="mt-6 rzm-card p-4 md:p-5">
        <div className="eyebrow mb-2">Admin order detail</div>
        <p className="text-[14px] text-[var(--rzm-text-muted)]">
          {loading ? "Загружаю заявку..." : "Заявка не найдена в текущем списке."}
        </p>
        <button type="button" onClick={onBack} className="mt-4 btn btn-outline focus-ring">
          К списку заявок
        </button>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="rzm-card-soft p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="eyebrow mb-2">Admin order detail</div>
            <h2 className="font-display text-[26px] font-bold leading-[1] tracking-[-0.04em] md:text-[34px]">
              Заявка {summary.orderId}
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
              Read-only просмотр для менеджера. Полные PII и raw payload не показываются.
            </p>
          </div>
          <button type="button" onClick={onBack} className="btn btn-outline focus-ring w-fit">
            К списку заявок
          </button>
        </div>
      </div>

      {loading && (
        <div className="rzm-status" data-status="warning">
          <span>Обновляю production summary...</span>
        </div>
      )}

      <div className="rzm-card p-4 md:p-5">
        <div className="mb-1 font-semibold">Основное</div>
        <DetailRow label="№ заявки" value={summary.orderId} />
        <DetailRow label="Создана" value={summary.createdAt} />
        <DetailRow label="Статус" value={summary.status} />
        <DetailRow label="Email менеджера" value={summary.managerEmailStatus} />
        <DetailRow label="Email клиента" value={summary.customerEmailStatus} />
      </div>

      <div className="rzm-card p-4 md:p-5">
        <div className="mb-1 font-semibold">Клиент (masked)</div>
        <DetailRow label="Имя" value={summary.customerNameMasked} />
        <DetailRow label="Телефон" value={summary.phoneMasked} />
        <DetailRow label="Email" value={summary.emailMasked} />
      </div>

      <div className="rzm-card p-4 md:p-5">
        <div className="mb-1 font-semibold">Конфигурация</div>
        <DetailRow label="Тип изделия" value={summary.productType} />
        <DetailRow label="Габариты" value={summary.dimensionsSummary} />
        <DetailRow label="Материалы" value={summary.materialsSummary} />
        <DetailRow label="Сумма" value={summary.totalPrice} />
        <DetailRow label="Pricing status" value={summary.pricingLabel} />
        <DetailRow label="Pricing source" value={summary.pricingSource} />
        <DetailRow label="Доставка" value={summary.deliverySummary} />
        <DetailRow label="Сборка" value={summary.assemblySummary} />
      </div>

      <div className="rzm-card p-4 md:p-5">
        <div className="mb-1 font-semibold">Production / Basis</div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Metric label="Review" value={summary.productionReviewStatus} />
          <Metric label="Basis" value={summary.basisStatus} />
          <Metric label="Errors" value={String(summary.validationErrorsCount)} />
          <Metric label="Warnings" value={String(summary.validationWarningsCount)} />
        </div>
        <p className="mt-4 text-[12px] leading-[1.55] text-[var(--rzm-text-muted)]">
          Basis readiness не выводится из plan length. Детальная ручная проверка production JSON остаётся в списке заявок через кнопку «Проверить».
        </p>
      </div>
    </section>
  );
}
