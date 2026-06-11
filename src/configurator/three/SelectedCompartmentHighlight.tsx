import { useMemo } from "react";
import { useConfigStateSelector } from "../store/useConfigSelectors";

const MM_TO_M = 0.001;

export function SelectedCompartmentHighlight() {
  const state = useConfigStateSelector();

  const box = useMemo(() => {
    if (!state.advancedLayout || !state.selectedCompartmentId || !state.layout.sections.length) return null;

    let xOffset = 0;
    for (let sectionIndex = 0; sectionIndex < state.layout.sections.length; sectionIndex++) {
      const section = state.layout.sections[sectionIndex];
      let yOffset = 0;

      for (const compartment of section.compartments) {
        if (compartment.id === state.selectedCompartmentId) {
          return {
            xMm: xOffset,
            yMm: yOffset,
            widthMm: section.widthMm,
            heightMm: compartment.heightMm,
            depthMm: state.depth,
          };
        }

        yOffset += compartment.heightMm;
      }

      xOffset += section.widthMm;
    }

    return null;
  }, [state.advancedLayout, state.depth, state.layout.sections, state.selectedCompartmentId]);

  if (!box) return null;

  return (
    <group
      position={[
        (box.xMm + box.widthMm / 2) * MM_TO_M,
        (box.yMm + box.heightMm / 2) * MM_TO_M,
        (box.depthMm / 2) * MM_TO_M,
      ]}
    >
      <mesh>
        <boxGeometry args={[box.widthMm * MM_TO_M, box.heightMm * MM_TO_M, box.depthMm * MM_TO_M]} />
        <meshBasicMaterial color="#ff5a1f" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[box.widthMm * MM_TO_M, box.heightMm * MM_TO_M, box.depthMm * MM_TO_M]} />
        <meshBasicMaterial color="#ff5a1f" wireframe transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
