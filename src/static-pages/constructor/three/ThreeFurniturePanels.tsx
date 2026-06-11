import { useMemo } from "react";
import * as THREE from "three";
import type { ThreePanel, ThreeSceneProductMode } from "./threeTypes";
import type { createThreeMaterials } from "./threeMaterials";

type MaterialMap = ReturnType<typeof createThreeMaterials>;

function PanelEdges({ panel, material }: { panel: ThreePanel; material: THREE.LineBasicMaterial }) {
  const geometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...panel.size), 18), [panel.size]);

  return (
    <lineSegments geometry={geometry}>
      <primitive object={material} attach="material" />
    </lineSegments>
  );
}

function CylindricalPanel({ panel, material }: { panel: ThreePanel; material: THREE.Material }) {
  const isLeg = panel.kind === "leg";
  const isVerticalHandle = panel.kind === "handle" && panel.size[1] > panel.size[0];
  const radius = isLeg
    ? Math.min(panel.size[0], panel.size[2]) / 2
    : panel.kind === "hinge" || panel.kind === "screw"
      ? Math.max(panel.size[0], panel.size[1]) / 2
      : Math.max(panel.size[1], panel.size[2]) / 2;
  const length = isLeg || isVerticalHandle
    ? panel.size[1]
    : panel.kind === "hinge" || panel.kind === "screw"
      ? panel.size[2]
      : panel.size[0];
  const rotation: [number, number, number] = panel.rotation ?? (
    isLeg || isVerticalHandle
      ? [0, 0, 0]
      : panel.kind === "hinge" || panel.kind === "screw"
        ? [Math.PI / 2, 0, 0]
        : [0, 0, Math.PI / 2]
  );

  return (
    <mesh key={panel.id} position={panel.position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, panel.kind === "screw" ? 20 : 28]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function ThreeFurniturePanels({
  panels,
  materials,
  sceneMode = "fill",
}: {
  panels: ThreePanel[];
  materials: MaterialMap;
  sceneMode?: ThreeSceneProductMode;
}) {
  return (
    <group>
      {panels.map((panel) => {
        const material = materials[panel.material];
        const isCylindrical = ["rod", "handle", "leg", "hinge", "screw"].includes(panel.kind);
        const isSceneHardwareFocus = sceneMode === "checkout" && ["handle", "hinge", "rod", "slide"].includes(panel.kind);
        const isSelection = panel.kind === "selection";
        const shouldShowEdges =
          !isCylindrical &&
          !isSelection &&
          panel.kind !== "back" &&
          panel.kind !== "slide" &&
          panel.kind !== "plinth";

        if (isCylindrical) {
          return <CylindricalPanel key={panel.id} panel={panel} material={material} />;
        }

        return (
          <mesh key={panel.id} position={panel.position} rotation={panel.rotation ?? [0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={panel.size} />
            <primitive object={material} attach="material" />
            {shouldShowEdges || isSceneHardwareFocus ? <PanelEdges panel={panel} material={materials.edge} /> : null}
          </mesh>
        );
      })}
    </group>
  );
}
