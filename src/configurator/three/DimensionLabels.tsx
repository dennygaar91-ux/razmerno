/**
 * Dimension labels (W × H × D) — поверх 3D-модели через drei <Html />.
 * Простые «технические» подписи у соответствующих рёбер шкафа.
 */
import { Html } from "@react-three/drei";

interface DimensionLabelsProps {
  widthMm: number;
  heightMm: number;
  depthMm: number;
  show: boolean;
}

const MM_TO_M = 0.001;

export function DimensionLabels({ widthMm, heightMm, depthMm, show }: DimensionLabelsProps) {
  if (!show) return null;

  const w = widthMm * MM_TO_M;
  const h = heightMm * MM_TO_M;
  const d = depthMm * MM_TO_M;

  return (
    <group>
      {/* Ширина — снизу спереди */}
      <Html
        position={[w / 2, -0.04, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <DimChip>{widthMm} мм</DimChip>
      </Html>

      {/* Высота — слева, сбоку */}
      <Html
        position={[-0.04, h / 2, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <DimChip>{heightMm} мм</DimChip>
      </Html>

      {/* Глубина — снизу сбоку */}
      <Html
        position={[w + 0.04, 0, d / 2]}
        center
        style={{ pointerEvents: "none" }}
      >
        <DimChip>{depthMm} мм</DimChip>
      </Html>
    </group>
  );
}

function DimChip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(4px)",
        padding: "3px 8px",
        borderRadius: "999px",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: "10px",
        letterSpacing: "0.05em",
        color: "#0a0a0a",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(10,10,10,0.06)",
      }}
    >
      {children}
    </div>
  );
}
