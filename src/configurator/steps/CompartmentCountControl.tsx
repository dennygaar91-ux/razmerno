import { trackEvent } from "../../shared/lib/analytics";
import { createEqualCompartments } from "../model/compartments";
import { useConfigBridge } from "../store/useConfigBridge";
import { ModuleOption, QuietNote, SectionTitle } from "./StepControls";

export function CompartmentCountControl() {
  const { state, actions } = useConfigBridge();
  const firstSection = state.layout.sections[0];
  const count = firstSection?.compartments.length ?? 1;
  const options = [1, 2, 3, 4];

  const applyCount = (nextCount: number) => {
    const layout = {
      sections: state.layout.sections.map((section) => ({
        ...section,
        compartments: createEqualCompartments({
          sectionId: section.id,
          count: nextCount,
          heightMm: state.height,
        }),
      })),
    };
    actions.setLayout(layout);
    trackEvent("filling_changed", { compartments: nextCount });
  };

  return (
    <div className="mb-4">
      <SectionTitle title="Отсеки в секции" meta="по высоте" />
      <div className="grid grid-cols-4 gap-2">
        {options.map((n) => (
          <ModuleOption
            key={n}
            onClick={() => applyCount(n)}
            selected={count === n}
            compact
            className="h-9 justify-center text-center text-[13px] font-medium tabular-nums"
          >
            {n}
          </ModuleOption>
        ))}
      </div>
      <QuietNote className="mt-2">
        Отсеки распределяются равномерно по высоте. Каждый отсек можно настроить отдельно.
      </QuietNote>
    </div>
  );
}
