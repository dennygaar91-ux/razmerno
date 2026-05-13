import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Html } from "@react-three/drei";
import type { CabinetConfig, CabinetPart } from "./engine/types";
import { useMemo } from "react";

const SCALE = 0.0038;

const MATERIAL_COLORS: Record<string, string> = {
  hdf_white_3: "#e8e8e3",
  egger_w980_16: "#d8cab7",
  kronospan_oak_16: "#b89a73",
  mdf_white_18: "#f4f4f2",
  mdf_graphite_18: "#474747",
  mdf_beige_18: "#d8cab7",
  mdf_olive_18: "#8a8d7f",
  white_ldsp_16: "#f7f6f3",
  anthracite_ldsp_16: "#4a4a4a",
};

const VIEW_POSITIONS: Record<string, [number, number, number]> = {
  front: [0, 0.15, 1.25],
  side: [1.25, 0.15, 0],
  top: [0, 1.7, 0.01],
  free: [1.3, 0.55, 1.3],
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

function DimensionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "4px 10px",
        background: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        fontSize: 12,
        color: "#111",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function SectionInteriors({
  section,
  sectionX,
  sectionWidth,
  heightMeters,
  depthMeters,
  facadeMaterialColor,
  bodyMaterialColor,
  is2D,
}: {
  section: any;
  sectionX: number;
  sectionWidth: number;
  heightMeters: number;
  depthMeters: number;
  facadeMaterialColor: string;
  bodyMaterialColor: string;
  is2D: boolean;
}) {
  const shelfThickness = 0.012;
  const shelfMargin = 0.018;
  const drawerGap = 0.004;

  const shelves = section.items.find((item: any) => item.type === "shelf");
  const drawers = section.items.find((item: any) => item.type === "drawer");
  const hangerRail = section.items.find((item: any) => item.type === "hanger_rail");

  const shelfCount = shelves?.count || 0;
  const drawerCount = drawers?.count || 0;
  const hasRail = hangerRail && hangerRail.count > 0;

  const interiorHeight = heightMeters - shelfMargin * 2;
  const drawerStackHeight =
    drawerCount > 0 ? Math.min(interiorHeight * 0.45, heightMeters * 0.4) : 0;
  const shelfAreaHeight = interiorHeight - drawerStackHeight;
  const shelfSpacing = shelfCount > 0 ? shelfAreaHeight / (shelfCount + 1) : 0;
  const interiorZ = -depthMeters / 2 + depthMeters * 0.65;

  return (
    <group>
      {Array.from({ length: shelfCount }).map((_, index) => {
        const shelfY = shelfMargin + drawerStackHeight + (index + 1) * shelfSpacing;

        return (
          <mesh key={`shelf-${section.id}-${index}`} position={[sectionX, shelfY, interiorZ]}>
            <boxGeometry args={[sectionWidth - 0.04, shelfThickness, depthMeters * 0.62]} />
            <meshStandardMaterial color={is2D ? "#ffffff" : bodyMaterialColor} metalness={0.05} roughness={0.7} transparent={is2D} opacity={is2D ? 0.18 : 1} />
            <Edges threshold={15} color={is2D ? "#2f5f9f" : "rgba(0,0,0,0.14)"} />
          </mesh>
        );
      })}

      {Array.from({ length: drawerCount }).map((_, index) => {
        const drawerHeight =
          (drawerStackHeight - drawerGap * Math.max(0, drawerCount - 1)) / drawerCount;
        const drawerY =
          shelfMargin + drawerHeight / 2 + index * (drawerHeight + drawerGap);

        return (
          <mesh
            key={`drawer-${section.id}-${index}`}
            position={[sectionX, drawerY, interiorZ - 0.01]}
          >
            <boxGeometry
              args={[sectionWidth - 0.03, drawerHeight - drawerGap / 2, depthMeters * 0.56]}
            />
            <meshStandardMaterial color={is2D ? "#ffffff" : facadeMaterialColor} metalness={0.08} roughness={0.6} transparent={is2D} opacity={is2D ? 0.16 : 1} />
            <Edges threshold={15} color={is2D ? "#2f5f9f" : "rgba(0,0,0,0.16)"} />
          </mesh>
        );
      })}

      {hasRail ? (
        <mesh position={[sectionX, heightMeters * 0.75, interiorZ]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, sectionWidth - 0.05, 16]} />
          <meshStandardMaterial color={is2D ? "#2f5f9f" : "#c0c0c0"} metalness={0.6} roughness={0.4} />
        </mesh>
      ) : null}
    </group>
  );
}

export function CabinetViewer({
  parts,
  config,
  viewMode,
  viewType,
  zoom,
  userHeight,
  activeSectionId,
  onSectionSelect,
}: {
  parts: CabinetPart[];
  config: CabinetConfig;
  viewMode: "3D" | "2D";
  viewType: "front" | "side" | "top" | "free";
  zoom: number;
  userHeight: number;
  activeSectionId?: string | null;
  onSectionSelect?: (sectionId: string) => void;
}) {
  const bounds = useMemo(() => computeBounds(parts), [parts]);

  const scaledParts = useMemo(() => {
    const center = {
      x: (bounds.x * SCALE) / 2,
      y: (bounds.y * SCALE) / 2,
      z: (bounds.z * SCALE) / 2,
    };

    return parts.map((part) => ({
      ...part,
      color: getColor(part.materialId),
      scale: SCALE,
      center,
    }));
  }, [parts, bounds.x, bounds.y, bounds.z]);

  const is2D = viewMode === "2D";
  const canRotate = viewMode === "3D" || viewType === "free";

  const cameraBase = VIEW_POSITIONS[viewType] || VIEW_POSITIONS.free;
  const zoomFactor = 1 / zoom;

  const cameraPosition: [number, number, number] = [
    cameraBase[0] * zoomFactor,
    cameraBase[1] * zoomFactor,
    cameraBase[2] * zoomFactor,
  ];

  const centerOffset = scaledParts[0]?.center ?? { x: 0, y: 0, z: 0 };

  const widthMeters = bounds.x * SCALE;
  const heightMeters = bounds.y * SCALE;
  const depthMeters = bounds.z * SCALE;

  const sceneSize = Math.max(widthMeters, heightMeters, depthMeters) || 1;
  const sectionCount = config.sections?.length || 0;
  const sectionWidthMeters =
    sectionCount > 0 ? widthMeters / sectionCount : widthMeters;

  const sectionOverlayY = heightMeters / 2;
  const sectionOverlayZ = -depthMeters / 2 - 0.022;
  const facadeZ = -depthMeters / 2 - 0.026;
  const facadeGap = Math.min(0.018, Math.max(0.008, sectionWidthMeters * 0.025));

  const silhouetteHeight = userHeight * SCALE;

  const bodyColor = getColor(config.materials.bodyMaterialId);
  const facadeColor = getColor(
    config.materials.facadeMaterialId || config.materials.bodyMaterialId
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", minHeight: 0 }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        shadows
        camera={{
          position: cameraPosition,
          fov: is2D ? 20 : 34,
        }}
      >
        <color attach="background" args={[is2D ? "#ffffff" : "#f2efe8"]} />

        <ambientLight intensity={is2D ? 1 : 0.72} />
        <directionalLight position={[5, 10, 5]} intensity={is2D ? 0.35 : 1.05} />
        {!is2D ? <directionalLight position={[-4, 4, 7]} intensity={0.28} /> : null}

        {is2D ? (
          <gridHelper
            args={[sceneSize * 2.2, 28, "#d7dde8", "#eef1f6"]}
            position={[0, -0.72, -depthMeters / 2 - 0.22]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ) : null}

        <group position={[-centerOffset.x - 0.18, -centerOffset.y + 0.16, -centerOffset.z]}>
          {scaledParts.map((part) => {
            const x =
              (part.position.x + part.size.width / 2) * part.scale - part.center.x;
            const y =
              (part.position.y + part.size.height / 2) * part.scale - part.center.y;
            const z =
              (part.position.z + part.size.thickness / 2) * part.scale - part.center.z;

            const materialProps = is2D
              ? { color: "#ffffff", opacity: 0.07, transparent: true }
              : { color: part.color, metalness: 0.08, roughness: 0.68 };

            return (
              <mesh key={part.id} position={[x, y, z]} castShadow={!is2D} receiveShadow={!is2D}>
                <boxGeometry
                  args={[
                    part.size.width * part.scale,
                    part.size.height * part.scale,
                    part.size.thickness * part.scale,
                  ]}
                />
                <meshStandardMaterial {...materialProps} />
                <Edges threshold={15} color={is2D ? "#2f5f9f" : "rgba(0,0,0,0.2)"} />
              </mesh>
            );
          })}

          {(viewType === "front" || viewType === "free") && bounds.x > 0 ? (
            <group
              position={[
                -widthMeters / 2 - 0.34,
                silhouetteHeight / 2,
                -depthMeters / 2 + Math.min(depthMeters * 0.55, 0.18) / 2 + 0.02,
              ]}
            >
              <mesh position={[0, silhouetteHeight / 2 + 0.05, 0]}>
                <sphereGeometry args={[0.08, 24, 24]} />
                <meshStandardMaterial color="#8f8f8f" transparent opacity={is2D ? 0.22 : 0.78} />
              </mesh>

              <mesh position={[0, silhouetteHeight * 0.28, 0]}>
                <boxGeometry
                  args={[0.1, silhouetteHeight * 0.36, Math.min(depthMeters * 0.55, 0.18)]}
                />
                <meshStandardMaterial color="#8f8f8f" transparent opacity={is2D ? 0.14 : 0.58} />
              </mesh>

              <mesh position={[-0.035, silhouetteHeight * 0.12, 0]}>
                <boxGeometry
                  args={[0.06, silhouetteHeight * 0.24, Math.min(depthMeters * 0.55, 0.18)]}
                />
                <meshStandardMaterial color="#8f8f8f" transparent opacity={is2D ? 0.14 : 0.58} />
              </mesh>

              <mesh position={[0.035, silhouetteHeight * 0.12, 0]}>
                <boxGeometry
                  args={[0.06, silhouetteHeight * 0.24, Math.min(depthMeters * 0.55, 0.18)]}
                />
                <meshStandardMaterial color="#8f8f8f" transparent opacity={is2D ? 0.14 : 0.58} />
              </mesh>
            </group>
          ) : null}

          <mesh position={[0, 0.01, -depthMeters / 2 - 0.06]}>
            <boxGeometry args={[widthMeters + 0.08, 0.004, 0.004]} />
            <meshStandardMaterial color={is2D ? "#2f5f9f" : "#5f5f5f"} />
          </mesh>

          <Html position={[0, -0.22, -depthMeters / 2 - 0.12]} center>
            <DimensionLabel>Ширина {Math.round(bounds.x)} мм</DimensionLabel>
          </Html>

          <mesh position={[widthMeters / 2 + 0.06, heightMeters / 2, -depthMeters / 2]}>
            <boxGeometry args={[0.004, heightMeters, 0.004]} />
            <meshStandardMaterial color={is2D ? "#2f5f9f" : "#5f5f5f"} />
          </mesh>

          <Html position={[widthMeters / 2 + 0.12, heightMeters / 2, -depthMeters / 2]} center>
            <DimensionLabel>Высота {Math.round(bounds.y)} мм</DimensionLabel>
          </Html>

          {viewType !== "front" ? (
            <>
              <mesh position={[widthMeters / 2 + 0.06, 0.01, 0]}>
                <boxGeometry args={[0.004, 0.004, depthMeters]} />
                <meshStandardMaterial color={is2D ? "#2f5f9f" : "#5f5f5f"} />
              </mesh>

              <Html position={[widthMeters / 2 + 0.12, 0.03, 0]} center>
                <DimensionLabel>Глубина {Math.round(bounds.z)} мм</DimensionLabel>
              </Html>
            </>
          ) : null}

          {config.options.hasLegs ? (
            <group>
              {[0, 1, 2, 3].map((index) => {
                const x =
                  index % 2 === 0
                    ? -sceneSize / 2 + 0.08
                    : sceneSize / 2 - 0.08;
                const z =
                  index < 2
                    ? -sceneSize / 2 + 0.08
                    : sceneSize / 2 - 0.08;

                return (
                  <mesh key={`leg-${index}`} position={[x, 0.08, z]} castShadow={!is2D}>
                    <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
                    <meshStandardMaterial color="#333" metalness={0.4} roughness={0.7} />
                  </mesh>
                );
              })}
            </group>
          ) : null}

          {config.sections?.slice(1).map((section, index) => {
            const x = -widthMeters / 2 + sectionWidthMeters * (index + 1);

            return (
              <mesh key={`divider-${section.id}`} position={[x, heightMeters / 2, 0]} castShadow={!is2D} receiveShadow={!is2D}>
                <boxGeometry args={[0.02, heightMeters, Math.max(depthMeters * 0.9, 0.08)]} />
                <meshStandardMaterial color={is2D ? "#ffffff" : bodyColor} metalness={0.04} roughness={0.72} transparent={is2D} opacity={is2D ? 0.1 : 1} />
                <Edges threshold={15} color={is2D ? "#2f5f9f" : "rgba(0,0,0,0.2)"} />
              </mesh>
            );
          })}

          {!is2D && config.facade?.enabled ? (
            <group>
              {config.sections?.map((section, index) => {
                const x = -widthMeters / 2 + sectionWidthMeters / 2 + index * sectionWidthMeters;
                const handleX = x + sectionWidthMeters * 0.34;

                return (
                  <group key={`facade-${section.id}`}>
                    <mesh position={[x, heightMeters / 2, facadeZ]} castShadow receiveShadow>
                      <boxGeometry args={[sectionWidthMeters - facadeGap, heightMeters - 0.044, 0.018]} />
                      <meshStandardMaterial color={facadeColor} metalness={0.03} roughness={0.76} transparent opacity={0.58} />
                      <Edges threshold={15} color="rgba(0,0,0,0.18)" />
                    </mesh>

                    <mesh position={[x, heightMeters / 2, facadeZ - 0.012]}>
                      <boxGeometry args={[sectionWidthMeters - facadeGap - 0.018, heightMeters - 0.064, 0.004]} />
                      <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.9} />
                    </mesh>

                    {config.facade.openingType === "with_handles" ? (
                      <mesh position={[handleX, heightMeters * 0.52, facadeZ - 0.026]} castShadow>
                        <boxGeometry args={[0.018, heightMeters * 0.18, 0.016]} />
                        <meshStandardMaterial color="#1f1f1f" metalness={0.35} roughness={0.55} />
                      </mesh>
                    ) : null}
                  </group>
                );
              })}
            </group>
          ) : null}

          {config.sections?.map((section, index) => {
            const sectionId = String(section.id);
            const isActive = activeSectionId === sectionId;
            const x =
              -widthMeters / 2 + sectionWidthMeters / 2 + index * sectionWidthMeters;

            return (
              <group key={`section-${sectionId}`}>
                <SectionInteriors
                  section={section}
                  sectionX={x}
                  sectionWidth={sectionWidthMeters}
                  heightMeters={heightMeters}
                  depthMeters={depthMeters}
                  facadeMaterialColor={facadeColor}
                  bodyMaterialColor={bodyColor}
                  is2D={is2D}
                />

                <group key={`section-hit-${sectionId}`}>
                  <mesh
                    position={[x, sectionOverlayY, sectionOverlayZ]}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSectionSelect?.(sectionId);
                    }}
                    onPointerOver={(event) => {
                      event.stopPropagation();
                      document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = "default";
                    }}
                  >
                    <boxGeometry args={[sectionWidthMeters - 0.01, heightMeters, 0.014]} />
                    <meshStandardMaterial
                      color={isActive ? "#E8612C" : "#ffffff"}
                      transparent
                      opacity={isActive ? 0.045 : 0.01}
                    />
                    {isActive ? <Edges threshold={15} color="#E8612C" /> : null}
                  </mesh>

                  <Html position={[x, heightMeters + 0.12, sectionOverlayZ]} center>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: isActive ? "#E8612C" : "rgba(255,255,255,0.9)",
                        color: isActive ? "#fff" : "#111",
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      }}
                    >
                      Секция {index + 1}
                    </div>
                  </Html>
                </group>
              </group>
            );
          })}
        </group>

        <OrbitControls enablePan={canRotate} enableRotate={canRotate} enableZoom />
      </Canvas>
    </div>
  );
}
