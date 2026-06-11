import { assemblySteps, viewerPanelClass } from "./visualSystem";

export function AssemblyTimeline({
  activeStep,
  blocked,
  exploded,
}: {
  activeStep: number;
  blocked: boolean;
  exploded: boolean;
}) {
  if (!blocked && !exploded) return null;

  return (
    <div className={`hidden md:block absolute left-4 top-4 z-10 w-[210px] ${viewerPanelClass} px-3 py-3`}>
      <div className="text-[11px] font-semibold text-[var(--rzm-text-main)] mb-2">
        {blocked ? "Нужно проверить размеры" : "Показываем детали"}
      </div>
      <div className="grid gap-2">
        {assemblySteps.map((item, index) => {
          const done = index < activeStep;
          const active = index === activeStep;
          return (
            <div key={item.label} className="flex items-start gap-2">
              <span
                className={[
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                  active
                    ? "bg-[var(--color-ink)] text-white"
                    : done
                    ? "bg-[#7cb46a] text-white"
                    : "bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-muted)]",
                ].join(" ")}
              >
                {done ? "✓" : index + 1}
              </span>
              <span>
                <span className="block text-[12px] font-semibold text-[var(--rzm-text-main)]">{item.label}</span>
                <span className="block text-[11px] leading-snug text-[var(--rzm-text-muted)]">
                  {active && blocked ? "Подправьте параметры слева" : item.text}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      {exploded && (
        <div className="mt-3 rounded-[14px] bg-[var(--rzm-surface-soft)] px-2.5 py-2 text-[11px] leading-snug text-[var(--rzm-text-muted)]">
          Детали разнесены, чтобы было понятнее, из чего собирается шкаф.
        </div>
      )}
    </div>
  );
}
