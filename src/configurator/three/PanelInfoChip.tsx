import type { ProductionModel } from "../../constructor/geometry";

export function PanelInfoChip({
  productionModel,
  panelId,
  selected,
}: {
  productionModel: ProductionModel;
  panelId: string | null;
  selected: boolean;
}) {
  if (!panelId) return null;
  const panel = productionModel.panels.find((p) => p.id === panelId);
  if (!panel) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-[14px] px-3 py-2 shadow-[0_1px_2px_rgba(10,10,10,0.06)]">
      <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--color-mute)]">
        {selected ? "Выбрана деталь" : "Под курсором"}
      </div>
      <div className="font-display text-[13px] font-semibold text-[var(--color-ink)] mt-0.5">
        {panel.name}
      </div>
      <div className="font-mono text-[10px] text-[var(--color-mute)] tabular-nums mt-1">
        {panel.widthMm} × {panel.heightMm} × {panel.thicknessMm} мм
      </div>
      <div className="font-mono text-[10px] text-[var(--color-mute)] mt-0.5">
        {panel.materialType.toUpperCase()} · {panel.materialId}
      </div>
    </div>
  );
}
