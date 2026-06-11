export const viewerSurfaceClass =
  "relative w-full h-full min-h-[320px] md:min-h-[520px] rounded-[32px] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.68)_30%,rgba(255,255,255,0)_58%),linear-gradient(180deg,#fcfbf8_0%,#f2efe8_100%)] overflow-hidden"

export const viewerGlassChipClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/86 backdrop-blur-sm shadow-[0_1px_2px_rgba(10,10,10,0.035)]"

export const viewerPanelClass =
  "rounded-[18px] bg-white/88 backdrop-blur-sm shadow-[0_1px_2px_rgba(10,10,10,0.045)]"

export const assemblySteps = [
  { label: "Каркас", text: "Собираем основу" },
  { label: "Отсеки", text: "Раскладываем хранение" },
  { label: "Фасады", text: "Подбираем внешний вид" },
  { label: "Заявка", text: "Готовим смету" },
] as const
