import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeFurnitureInput, ThreeSceneProductMode } from "./threeTypes";
import { buildThreeFurnitureModel } from "./threeSceneAdapter";
import { createThreeMaterials } from "./threeMaterials";
import { ThreeFurniturePanels } from "./ThreeFurniturePanels";

export function ThreeFurnitureModel({
  input,
  sceneMode = "fill",
}: {
  input: ThreeFurnitureInput;
  sceneMode?: ThreeSceneProductMode;
}) {
  const model = useMemo(() => buildThreeFurnitureModel(input), [input]);
  const materials = useMemo(() => createThreeMaterials(input.material, input.facadeMaterial), [input.facadeMaterial, input.material]);
  const [width, , depth] = model.dimensions;
  const floorWidth = Math.max(width * 1.85, 3.1);
  const floorDepth = Math.max(depth * 2.35, 2.7);

  return (
    <group position={[0, 0, 0]}>
      <ThreeFurniturePanels panels={model.panels} materials={materials} sceneMode={sceneMode} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.078, 0]} receiveShadow>
        <planeGeometry args={[floorWidth, floorDepth]} />
        <meshStandardMaterial
          color={sceneMode === "materials" || sceneMode === "checkout" ? "#eee9df" : "#f1eee7"}
          roughness={0.94}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.076, 0]}>
        <ringGeometry args={[Math.max(width, depth) * 0.48, Math.max(width, depth) * 0.72, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
