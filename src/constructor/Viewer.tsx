import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Html } from "@react-three/drei";
import type { CabinetConfig, CabinetPart } from "./engine/types";
import { useMemo } from "react";

const MATERIAL_COLORS: Record<string, string> = {
  hdf_white_3: "#e8e8e3",
  egger_w980_16: "#d8cab7",
  kronospan_oak_16: "#b89a73",
  mdf_white_18: "#f4f4f2",
  mdf_graphite_18: "#474747",
  mdf_beige_18: "#d8cab7",
  mdf_olive_18: "#8a8d7f",
  white_ldsp_16: "#f7f6f3",
  anthracite_ldsp_16: "#4a4a4a"
};

function getColor(materialId: string) {
  return MATERIAL_COLORS[materialId] || "#b8b8b8";
}

function computeBounds(parts: CabinetPart[]) {
  const box = { x: 0, y: 0, z: 0 };
  parts.forEach((part) => {
    box.x = Math.max(box.x, part.position.x + part.size.width);
    box.y = Math.max(box.y, part.position.y + part.size.height);
    box.z = Math.max(box.z, part.position.z + part.size.thickness);
  });
  return box;
}

const viewPositions: Record<string, [number, number, number]> = {
  front: [0, 0.8, 2.5],
  side: [2.5, 0.8, 0],
  top: [0, 2.6, 0.1],
  free: [2.2, 1.2, 2.2]
};

export function CabinetViewer({
  parts,
  config,
  viewMode,
  viewType,
  zoom,
  userHeight
}: {
  parts: CabinetPart[];
  config: CabinetConfig;
  viewMode: "3D" | "2D";
  viewType: "front" | "side" | "top" | "free";
  zoom: number;
  userHeight: number;
}) {
  const scaledParts = useMemo(() => {
    const scale = 0.0018;
    const bounds = computeBounds(parts);
    const center = {
      x: (bounds.x * scale) / 2,
      y: (bounds.y * scale) / 2,
      z: (bounds.z * scale) / 2
    };

    return parts.map((part) => ({
      ...part,
      color: getColor(part.materialId),
      scale,
      center
    }));
  }, [parts]);

  const bounds = computeBounds(parts);
  const sceneSize = Math.max(bounds.x, bounds.y, bounds.z) * 0.0018;
  const cameraBase = viewPositions[viewType];
  const cameraPosition: [number, number, number] = [
    cameraBase[0] * sceneSize * (1 / zoom),
    cameraBase[1] * sceneSize * (1 / zoom),
    cameraBase[2] * sceneSize * (1 / zoom)
  ];
  const is2D = viewMode === "2D";

  const centerOffset = scaledParts[0]?.center ?? { x: 0, y: 0, z: 0 };
  const widthMeters = bounds.x * 0.0018;
  const heightMeters = bounds.y * 0.0018;
  const depthMeters = bounds.z * 0.0018;
  const silhouetteHeight = userHeight * 0.0018;
  const canRotate = viewMode === "3D" || viewType === "free";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", minHeight: 0 }}>
      <Canvas style={{ width: "100%", height: "100%" }} shadows camera={{ position: cameraPosition, fov: is2D ? 28 : 45 }}>
        <color attach="background" args={[is2D ? "#f7f5ef" : "#f2efe8"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        <group position={[-centerOffset.x, -centerOffset.y, -centerOffset.z]}>
          {scaledParts.map((part) => {
            const x = (part.position.x + part.size.width / 2) * part.scale - part.center.x;
            const y = (part.position.y + part.size.height / 2) * part.scale - part.center.y;
            const z = (part.position.z + part.size.thickness / 2) * part.scale - part.center.z;
            const materialProps = is2D
              ? { color: "#ffffff", opacity: 0.18, transparent: true }
              : { color: part.color, metalness: 0.1, roughness: 0.65 };

            return (
              <mesh key={part.id} position={[x, y, z]}>
                <boxGeometry args={[part.size.width * part.scale, part.size.height * part.scale, part.size.thickness * part.scale]} />
                <meshStandardMaterial {...materialProps} />
                {is2D ? <Edges threshold={15} color="#4a4a4a" /> : null}
              </mesh>
            );
          })}

          {((viewType === "front" || viewType === "free") && bounds.x > 0) && (() => {
            const silhouetteDepth = Math.min(depthMeters * 0.55, 0.18);
            const silhouetteWidth = 0.14;
            const silhouetteX = -widthMeters / 2 - silhouetteWidth - 0.08;
            const silhouetteZ = -depthMeters / 2 + silhouetteDepth / 2 + 0.02;

            return (
              <group position={[silhouetteX, silhouetteHeight / 2, silhouetteZ]}>
                <mesh position={[0, silhouetteHeight / 2 + 0.05, 0]}>
                  <sphereGeometry args={[0.08, 24, 24]} />
                  <meshStandardMaterial color="#8f8f8f" transparent opacity={0.85} />
                </mesh>
                <mesh position={[0, silhouetteHeight * 0.28, 0]}>
                  <boxGeometry args={[silhouetteWidth, silhouetteHeight * 0.36, silhouetteDepth]} />
                  <meshStandardMaterial color="#8f8f8f" transparent opacity={0.7} />
                </mesh>
                <mesh position={[-silhouetteWidth * 0.22, silhouetteHeight * 0.12, 0]}>
                  <boxGeometry args={[0.06, silhouetteHeight * 0.24, silhouetteDepth]} />
                  <meshStandardMaterial color="#8f8f8f" transparent opacity={0.7} />
                </mesh>
                <mesh position={[silhouetteWidth * 0.22, silhouetteHeight * 0.12, 0]}>
                  <boxGeometry args={[0.06, silhouetteHeight * 0.24, silhouetteDepth]} />
                  <meshStandardMaterial color="#8f8f8f" transparent opacity={0.7} />
                </mesh>
              </group>
            );
          })()}

          <mesh position={[0, 0.01, -depthMeters / 2 - 0.06]}>
            <boxGeometry args={[widthMeters + 0.08, 0.004, 0.004]} />
            <meshStandardMaterial color="#5f5f5f" />
          </mesh>
          <Html position={[0, 0.03, -depthMeters / 2 - 0.14]} center>
            <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.88)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: '#111' }}>
              Ширина {Math.round(bounds.x)} мм
            </div>
          </Html>

          <mesh position={[widthMeters / 2 + 0.06, heightMeters / 2, -depthMeters / 2]}>
            <boxGeometry args={[0.004, heightMeters, 0.004]} />
            <meshStandardMaterial color="#5f5f5f" />
          </mesh>
          <Html position={[widthMeters / 2 + 0.12, heightMeters / 2, -depthMeters / 2]} center>
            <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.88)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: '#111' }}>
              Высота {Math.round(bounds.y)} мм
            </div>
          </Html>

          {viewType !== "front" && (
            <>
              <mesh position={[widthMeters / 2 + 0.06, 0.01, -depthMeters / 2 + depthMeters / 2]}>
                <boxGeometry args={[0.004, 0.004, depthMeters]} />
                <meshStandardMaterial color="#5f5f5f" />
              </mesh>
              <Html position={[widthMeters / 2 + 0.12, 0.03, -depthMeters / 2 + depthMeters / 2]} center>
                <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.88)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: '#111' }}>
                  Глубина {Math.round(bounds.z)} мм
                </div>
              </Html>
            </>
          )}

          {config.options.hasLegs && (
            <group>
              {[0, 1, 2, 3].map((index) => {
                const x = index % 2 === 0 ? -sceneSize / 2 + 0.08 : sceneSize / 2 - 0.08;
                const z = index < 2 ? -sceneSize / 2 + 0.08 : sceneSize / 2 - 0.08;
                return (
                  <mesh key={`leg-${index}`} position={[x, 0.08, z]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
                    <meshStandardMaterial color="#333" metalness={0.4} roughness={0.7} />
                  </mesh>
                );
              })}
            </group>
          )}
        </group>

        <OrbitControls enablePan={canRotate} enableRotate={canRotate} enableZoom={true} />
      </Canvas>
    </div>
  );
}
