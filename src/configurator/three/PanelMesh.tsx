/**
 * PanelMesh — отображает одну Panel из productionModel как Three.js mesh.
 *
 * MVP-визуал:
 *  - <boxGeometry args={[w,h,t]} /> в локальных координатах
 *  - position берём из panel.position (нижний-левый-передний угол),
 *    в Three.js сдвигаем на половину размера, чтобы получить центр меша
 *  - rotation как в panel.rotation
 *  - материал — MeshStandardMaterial с canvas-текстурой через materials.ts
 *  - подсветка (highlight): boost color на 1.15, остальное приглушено через opacity
 */
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import type { Panel } from "../../constructor/geometry";
import { getProceduralTexture, presetFor } from "./materials";

interface PanelMeshProps {
  panel: Panel;
  highlight?: boolean;
  dimmed?: boolean;
  exploded?: boolean;
  explodedFactor?: number;
  onClick?: (panelId: string) => void;
  onPointerOver?: (panelId: string) => void;
  onPointerOut?: () => void;
}

const MM_TO_M = 0.001;

export function PanelMesh({
  panel,
  highlight = false,
  dimmed = false,
  exploded = false,
  explodedFactor = 0.1,
  onClick,
  onPointerOver,
  onPointerOut,
}: PanelMeshProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Shared cached procedural texture by materialId.
  // Do not dispose it from PanelMesh: cache lifecycle is managed globally.
  const texture = useMemo(() => getProceduralTexture(panel.materialId), [panel.materialId]);

  const preset = presetFor(panel.materialId);

  // Compute mesh center: panel.position is corner, we need center for Three.js
  // After rotation, the local axes of the panel point differently in world.
  // For simplicity we apply the rotation, then add half of local extents.
  const localExtents = useMemo(() => {
    return new THREE.Vector3(panel.widthMm, panel.heightMm, panel.thicknessMm).multiplyScalar(MM_TO_M);
  }, [panel.widthMm, panel.heightMm, panel.thicknessMm]);

  const worldOffset = useMemo(() => {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(panel.rotation.x, panel.rotation.y, panel.rotation.z, "XYZ"),
    );
    // half of local extents, rotated to world space
    const half = localExtents.clone().multiplyScalar(0.5);
    half.applyQuaternion(q);
    return half;
  }, [panel.rotation.x, panel.rotation.y, panel.rotation.z, localExtents]);

  const meshPosition: [number, number, number] = [
    panel.position.xMm * MM_TO_M + worldOffset.x,
    panel.position.yMm * MM_TO_M + worldOffset.y,
    panel.position.zMm * MM_TO_M + worldOffset.z,
  ];

  // Exploded offset: shift along rotated +Y for top/bottom, along +X for sides, etc.
  const explodedShift = useMemo(() => {
    if (!exploded) return new THREE.Vector3();
    const factor = explodedFactor;
    const direction = new THREE.Vector3();
    switch (panel.role) {
      case "top":
        direction.set(0, factor, 0);
        break;
      case "bottom":
        direction.set(0, -factor, 0);
        break;
      case "side-left":
        direction.set(-factor, 0, 0);
        break;
      case "side-right":
        direction.set(factor, 0, 0);
        break;
      case "back-panel":
        direction.set(0, 0, factor);
        break;
      case "facade-door":
      case "drawer-front":
        direction.set(0, 0, -factor);
        break;
      case "shelf":
        direction.set(0, factor * 0.4, 0);
        break;
      case "vertical-partition":
        direction.set(0, 0, -factor * 0.4);
        break;
      case "plinth":
        direction.set(0, -factor, 0);
        break;
      default:
        direction.set(0, 0, 0);
    }
    return direction;
  }, [exploded, explodedFactor, panel.role]);

  // update material highlight
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    const baseColor = new THREE.Color(preset.baseColor);
    if (highlight) {
      mat.color.copy(baseColor).multiplyScalar(1.12);
      mat.emissive = new THREE.Color("#ff5a1f");
      mat.emissiveIntensity = 0.08;
      mat.opacity = 1;
      mat.transparent = false;
    } else if (dimmed) {
      mat.color.copy(baseColor);
      mat.emissive = new THREE.Color("#000000");
      mat.emissiveIntensity = 0;
      mat.opacity = 0.25;
      mat.transparent = true;
    } else {
      mat.color.copy(baseColor);
      mat.emissive = new THREE.Color("#000000");
      mat.emissiveIntensity = 0;
      mat.opacity = 1;
      mat.transparent = false;
    }
    mat.needsUpdate = true;
  }, [highlight, dimmed, preset.baseColor]);

  if (!panel.visible) return null;

  const finalPosition: [number, number, number] = [
    meshPosition[0] + explodedShift.x,
    meshPosition[1] + explodedShift.y,
    meshPosition[2] + explodedShift.z,
  ];

  return (
    <mesh
      position={finalPosition}
      rotation={[panel.rotation.x, panel.rotation.y, panel.rotation.z]}
      castShadow
      receiveShadow
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onClick?.(panel.id);
      }}
      onPointerOver={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPointerOver?.(panel.id);
      }}
      onPointerOut={() => onPointerOut?.()}
    >
      <boxGeometry
        args={[
          panel.widthMm * MM_TO_M,
          panel.heightMm * MM_TO_M,
          panel.thicknessMm * MM_TO_M,
        ]}
      />
      <meshStandardMaterial
        ref={materialRef}
        color={preset.baseColor}
        map={texture ?? undefined}
        roughness={preset.roughness}
        metalness={preset.metalness}
      />
    </mesh>
  );
}
