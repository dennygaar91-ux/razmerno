import { Html } from "@react-three/drei";
import { useConfigBridge } from "../store/useConfigBridge";

const MM_TO_M = 0.001;

export function ThreeLayoutMarkers() {
  const { state, actions } = useConfigBridge();

  if (!state.advancedLayout || !state.layout.sections.length) return null;

  const widthM = state.width * MM_TO_M;
  const heightM = state.height * MM_TO_M;
  const depthM = state.depth * MM_TO_M;

  return (
    <group>
      <Html
        position={[widthM + 0.08, heightM * 0.55, depthM * 0.5]}
        center
        distanceFactor={5}
        zIndexRange={[20, 0]}
      >
        <button
          type="button"
          className="three-plus-marker"
          onClick={(event) => {
            event.stopPropagation();
            actions.addSectionByWidth();
          }}
          aria-label="Добавить секцию по ширине"
          title="Добавить секцию по ширине"
        >
          +
        </button>
      </Html>

      {state.layout.sections.map((section, index) => {
        const sectionCenterX =
          state.layout.sections.slice(0, index).reduce((sum, item) => sum + item.widthMm, 0) * MM_TO_M +
          section.widthMm * MM_TO_M * 0.5;

        return (
          <Html
            key={section.id}
            position={[sectionCenterX, heightM + 0.08, depthM * 0.5]}
            center
            distanceFactor={5}
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              className="three-plus-marker three-plus-marker--small"
              onClick={(event) => {
                event.stopPropagation();
                actions.addCompartmentByHeight({ sectionId: section.id });
              }}
              aria-label={`Добавить отсек в секцию ${index + 1}`}
              title={`Добавить отсек в секцию ${index + 1}`}
            >
              +
            </button>
          </Html>
        );
      })}
    </group>
  );
}
