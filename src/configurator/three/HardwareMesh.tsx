/**
 * HardwareMesh — визуальное представление фурнитуры.
 * Видимая в viewer фурнитура: штанга, ручки, держатели штанги.
 * Остальное (петли, направляющие, конфирматы) — скрыто, но есть в productionModel.
 */
import type { HardwareItem } from "../../constructor/geometry";

const MM_TO_M = 0.001;

interface HardwareMeshProps {
  hardware: HardwareItem;
  exploded?: boolean;
  explodedFactor?: number;
}

export function HardwareMesh({ hardware, exploded = false, explodedFactor = 0.15 }: HardwareMeshProps) {
  const p: [number, number, number] = [
    hardware.position.xMm * MM_TO_M + (exploded && hardware.type === "rod" ? 0 : 0),
    hardware.position.yMm * MM_TO_M,
    hardware.position.zMm * MM_TO_M + (exploded && hardware.type === "handle" ? -explodedFactor : 0),
  ];

  switch (hardware.type) {
    case "rod":
      return (
        <mesh position={p} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.0125, 0.0125, 0.6, 12]} />
          <meshStandardMaterial color="#9a9690" metalness={0.6} roughness={0.4} />
        </mesh>
      );
    case "handle":
      return (
        <mesh position={p} castShadow>
          <boxGeometry args={[0.005, 0.12, 0.012]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      );
    case "rod-holder":
      return (
        <mesh position={p}>
          <boxGeometry args={[0.012, 0.032, 0.032]} />
          <meshStandardMaterial color="#9a9690" metalness={0.5} roughness={0.5} />
        </mesh>
      );
    default:
      return null;
  }
}
