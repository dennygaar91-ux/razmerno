import type { AdminProductionDetail, ProductionExportDetail, ProductionReviewStatus } from "./types";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rzm-card-soft p-4">
      <div className="control-meta">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold tracking-[-0.04em]">{value}</div>
    </div>
  );
}

export function ProductionReviewPanel({
  orderId,
  detail,
  status,
  note,
  loading,
  onStatusChange,
  onNoteChange,
  onSave,
  onClose,
}: {
  orderId: string | null;
  detail: AdminProductionDetail | null;
  status: ProductionReviewStatus;
  note: string;
  loading: boolean;
  onStatusChange: (value: ProductionReviewStatus) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!orderId) return null;

  const production = detail?.productionExport;
  const panels = production?.productionModel?.panels?.length ?? 0;
  const hardware = production?.productionModel?.hardware?.length ?? 0;
  const drilling = production?.productionModel?.drilling?.length ?? 0;
  const edges = production?.productionModel?.edgeBanding?.length ?? 0;
  const warnings = production?.rules?.autoWarnings?.length ?? 0;
  const rejects = production?.rules?.autoRejects?.length ?? 0;
  const repairs = production?.rules?.autoRepairs?.length ?? 0;
  const latestRevision = production?.revisions?.[production.revisions.length - 1];

  return (
    <div className="mt-6 rzm-card p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="eyebrow mb-2">Production review</div>
          <div className="font-semibold">Ручная проверка production JSON</div>
          <div className="mt-1 text-[13px] text-[var(--rzm-text-muted)]">
            Заявка {orderId}. Клиент не видит эти данные.
          </div>
        </div>
        <button type="button" onClick={onClose} className="btn btn-outline btn-sm focus-ring">
          Закрыть
        </button>
      </div>

      {loading && (
        <div className="mt-4 rzm-status" data-status="warning">
          <span>Загружаю production JSON...</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Metric label="Панели" value={String(panels)} />
        <Metric label="Фурнитура" value={String(hardware)} />
        <Metric label="Присадка" value={String(drilling)} />
        <Metric label="Кромка" value={String(edges)} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="rzm-status" data-status="warning"><span>Warnings: {warnings}</span></div>
        <div className="rzm-status" data-status={rejects > 0 ? "error" : "warning"}><span>Rejects: {rejects}</span></div>
        <div className="rzm-status" data-status="warning"><span>Auto repairs: {repairs}</span></div>
      </div>

      <div className="mt-4 rounded-[18px] bg-[var(--rzm-surface-soft)] p-3 text-[12px] text-[var(--rzm-text-muted)]">
        Последняя ревизия: {latestRevision?.version ?? "—"} · {latestRevision?.status ?? "—"} · {latestRevision?.note ?? "нет заметки"}
      </div>

      <ProductionDetailBreakdown production={production} />

      <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
        <label>
          <span className="rzm-field-label mb-2">Production status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as ProductionReviewStatus)}
            className="control-field h-11 px-3 w-full outline-none"
          >
            <option value="requires-review">Требует проверки</option>
            <option value="manually-adjusted">Изменено вручную</option>
            <option value="approved-for-basis">Готово для БАЗИС</option>
            <option value="blocked">Заблокировано</option>
          </select>
        </label>
        <label>
          <span className="rzm-field-label mb-2">Заметка технолога</span>
          <input
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            className="control-field h-11 px-3 w-full outline-none"
            placeholder="Что изменено или подтверждено"
          />
        </label>
        <button type="button" disabled={loading || note.trim().length < 3} onClick={onSave} className="btn btn-primary focus-ring">
          Сохранить проверку
        </button>
      </div>
    </div>
  );
}

function ProductionDetailBreakdown({
  production,
}: {
  production: ProductionExportDetail | null | undefined;
}) {
  if (!production) {
    return (
      <div className="mt-4 rzm-status" data-status="warning">
        <span>Production JSON ещё не сформирован.</span>
      </div>
    );
  }

  const panels = production.productionModel?.panels ?? [];
  const hardware = production.productionModel?.hardware ?? [];
  const drilling = production.productionModel?.drilling ?? [];
  const edgeBanding = production.productionModel?.edgeBanding ?? [];
  const plan = production.basis?.plan ?? [];
  const revisions = production.revisions ?? [];

  return (
    <div className="mt-5 grid gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProductionMiniTable
          title="Панели"
          empty="Панели не найдены"
          rows={panels.slice(0, 8).map((item) => [
            item.name ?? item.id ?? "панель",
            `${item.widthMm ?? "?"}×${item.heightMm ?? "?"}×${item.thicknessMm ?? "?"} мм`,
            item.role ?? "role",
          ])}
        />
        <ProductionMiniTable
          title="Фурнитура"
          empty="Фурнитура не найдена"
          rows={hardware.slice(0, 8).map((item) => [
            item.name ?? item.id ?? "позиция",
            item.type ?? "тип",
            `×${item.quantity ?? 1}`,
          ])}
        />
        <ProductionMiniTable
          title="Присадка"
          empty="Операции присадки не найдены"
          rows={drilling.slice(0, 8).map((item) => [
            item.purpose ?? item.id ?? "операция",
            item.panelId ?? "panel",
            item.requiresTechnologistCheck ? "проверить" : "ок",
          ])}
        />
        <ProductionMiniTable
          title="Кромка"
          empty="Кромление не найдено"
          rows={edgeBanding.slice(0, 8).map((item) => [
            item.panelId ?? "panel",
            item.side ?? "side",
            `${item.thicknessMm ?? "?"} мм`,
          ])}
        />
      </div>

      <ProductionMiniTable
        title="BASIS manual plan"
        empty="План БАЗИС не найден"
        rows={plan.slice(0, 8).map((item, index) => [
          `${index + 1}. ${item.title ?? "Шаг"}`,
          item.description ?? "описание отсутствует",
          "manual-json-ready",
        ])}
      />

      <ProductionMiniTable
        title="Ревизии"
        empty="Ревизии не найдены"
        rows={revisions.slice(-6).reverse().map((item) => [
          `rev.${item.version ?? "?"}`,
          item.status ?? "статус",
          item.note ?? "без заметки",
        ])}
      />
    </div>
  );
}

function ProductionMiniTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<[string, string, string]>;
  empty: string;
}) {
  return (
    <div className="rounded-[18px] border border-[var(--rzm-line-soft)] bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--rzm-line-soft)] font-semibold text-[13px]">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-3 py-3 text-[12px] text-[var(--rzm-text-muted)]">{empty}</div>
      ) : (
        <div className="divide-y divide-[var(--rzm-line-soft)]">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-2 px-3 py-2 text-[11.5px]">
              <span className="font-medium text-[var(--rzm-text-main)] truncate">{row[0]}</span>
              <span className="text-[var(--rzm-text-muted)] truncate">{row[1]}</span>
              <span className="text-[var(--rzm-text-muted)] truncate text-right">{row[2]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
