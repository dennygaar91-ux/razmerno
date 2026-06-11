import { useMemo, useState } from "react";
import { useConfigBridge } from "./store/useConfigBridge";
import { buildCabinetGeometry, fromConfigState, type ProductionModel } from "../constructor/geometry";

/**
 * Production debug panel — отладочные действия для технолога/разработчика.
 *
 * Видна только когда:
 *   - URL содержит ?debug=1
 *   - ИЛИ hash содержит debug=1
 *   - ИЛИ запущено в dev-режиме
 *
 * НЕ показывается обычному пользователю.
 */
export function ProductionDebugPanel() {
  const { state } = useConfigBridge();
  const [open, setOpen] = useState(false);

  const debugEnabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (import.meta.env?.VITE_ENABLE_PRODUCTION_DEBUG !== "1") return false;
    const url = new URL(window.location.href);
    if (url.searchParams.get("debug") === "1") return true;
    if (url.hash.includes("debug=1")) return true;
    return false;
  }, []);

  const productionModel = useMemo(() => {
    if (!state.type) return null;
    const project = fromConfigState(state, "rzm.config.v3");
    return buildCabinetGeometry(project);
  }, [state]);

  if (!debugEnabled || !productionModel) return null;

  const totals = productionModel.totals;
  const warnings = productionModel.warnings;
  const safeModel = toTechnologyExport(productionModel);

  return (
    <div className="bg-white rounded-[18px] border border-[var(--color-line)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[var(--color-bg-soft)] transition-colors focus-ring"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-mute)]" />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-mute)]">
            Tech export
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Панелей" value={totals.panelCount} />
            <Stat label="Фурнитуры" value={totals.hardwareCount} />
            <Stat label="Присадок" value={totals.drillingCount} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Корпус, м²" value={totals.bodyAreaM2.toFixed(2)} />
            <Stat label="Фасады, м²" value={totals.facadeAreaM2.toFixed(2)} />
          </div>
          <div className="font-mono text-[10px] text-[var(--color-mute)]">
            Кромка: {Math.round(totals.edgeBandingLengthMm / 1000)} м
          </div>

          {warnings.length > 0 && (
            <div className="rounded-[10px] bg-[var(--color-bg-soft)] p-2">
              <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--color-mute)] mb-1">
                Заметки модели ({warnings.length})
              </div>
              <ul className="space-y-1 text-[11px] leading-snug">
                {warnings.slice(0, 5).map((w, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span
                      className={`shrink-0 mt-1 w-1 h-1 rounded-full ${
                        w.severity === "error"
                          ? "bg-[var(--color-accent)]"
                          : w.severity === "warn"
                          ? "bg-[#d8a73a]"
                          : "bg-[var(--color-mute)]"
                      }`}
                    />
                    <span className="text-[var(--color-ink-soft)]">{w.message}</span>
                  </li>
                ))}
                {warnings.length > 5 && (
                  <li className="text-[var(--color-mute)] text-[10px]">… ещё {warnings.length - 5}</li>
                )}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <ExportButton
              title="Production JSON"
              description="Полная модель: панели, фурнитура, кромка, присадка и предупреждения."
              onClick={() => downloadJson(`production-model-${Date.now()}.json`, safeModel)}
            />
            <ExportButton
              title="Basis plan JSON"
              description="Пошаговый план для будущего БАЗИС-адаптера. Это не .b3d."
              onClick={() =>
                downloadJson(`basis-export-plan-${Date.now()}.json`, {
                  schema: productionModel.schema,
                  units: productionModel.units,
                  meta: productionModel.meta,
                  basisExportPlan: productionModel.basisExportPlan,
                  warning: "MVP plan. Requires technologist verification before production.",
                })
              }
            />
          </div>

          <p className="font-mono text-[9px] text-[var(--color-mute)] leading-snug">
            Данные скрыты от клиента и нужны только для разработки/технолога.
            <br />
            Присадка сохраняется в JSON, но координаты MVP требуют проверки перед БАЗИС/.b3d.
          </p>
        </div>
      )}
    </div>
  );
}

function ExportButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[12px] border border-[var(--color-line)] bg-white px-3 py-2 text-left hover:bg-[var(--color-bg-soft)] transition-colors focus-ring"
    >
      <span className="flex items-center justify-between gap-3">
        <span>
          <span className="block font-display text-[13px] font-semibold text-[var(--color-ink)]">
            {title}
          </span>
          <span className="block mt-0.5 text-[11px] leading-snug text-[var(--color-mute)]">
            {description}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-[var(--color-ink-soft)]">
          <path
            d="M8 3v8m0 0l-3-3m3 3l3-3M3 13h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-bg-soft)] rounded-[10px] px-2 py-1.5">
      <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-mute)]">
        {label}
      </div>
      <div className="font-display text-[14px] tabular-nums font-semibold text-[var(--color-ink)] mt-0.5">
        {value}
      </div>
    </div>
  );
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toTechnologyExport(model: ProductionModel) {
  return {
    ...model,
    exportNote: "Technology export only. Drilling coordinates are MVP and require technologist verification before production/BASIS.",
  };
}
