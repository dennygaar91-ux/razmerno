import { Html } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import type { ThreeInteractionTarget } from "./threeTypes";

export type ThreeSelectionPayload = {
  sectionId: string;
  compartmentId?: string;
};

const transparentTargetMaterial = new THREE.MeshBasicMaterial({
  color: "#ff724c",
  transparent: true,
  opacity: 0.015,
  depthWrite: false,
});

export function ThreeSelectionLayer({
  targets,
  onSelectTarget,
  onOpenAddMenu,
}: {
  targets: ThreeInteractionTarget[];
  onSelectTarget?: (target: ThreeSelectionPayload) => void;
  onOpenAddMenu?: (target: ThreeSelectionPayload) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <group name="three-selection-layer">
      {targets.map((target) => {
        const isHovered = hoveredId === target.id;
        const showFullLabel = isHovered;
        const showPlus = target.selected;

        return (
          <group key={target.id}>
            <mesh
              position={target.position}
              onClick={(event) => {
                event.stopPropagation();
                onSelectTarget?.({ sectionId: target.sectionId, compartmentId: target.compartmentId });
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHoveredId(target.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHoveredId((current) => (current === target.id ? null : current));
                document.body.style.cursor = "";
              }}
            >
              <boxGeometry args={target.size} />
              <primitive object={transparentTargetMaterial} attach="material" />
            </mesh>

            <Html position={target.labelPosition} center distanceFactor={7.8} zIndexRange={[20, 0]}>
              <span className={`rzm-3d-model-label ${target.selected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""}`}>
                {showFullLabel ? target.fullLabel : target.label}
              </span>
            </Html>

            {showPlus ? (
              <Html position={[target.position[0], target.position[1], target.position[2] + 0.08]} center distanceFactor={6.4} zIndexRange={[30, 0]}>
                <button
                  type="button"
                  className="rzm-3d-model-plus"
                  title="Открыть меню добавления наполнения"
                  onClick={(event) => {
                    event.stopPropagation();
                    const payload = { sectionId: target.sectionId, compartmentId: target.compartmentId };
                    onSelectTarget?.(payload);
                    onOpenAddMenu?.(payload);
                  }}
                >
                  +
                </button>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
