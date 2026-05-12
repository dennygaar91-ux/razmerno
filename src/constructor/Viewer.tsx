import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { CabinetPart } from "./engine/types";
import { useMemo } from "react";

const MATERIAL_COLORS: Record<string, string> = {
  hdf_white_3: "#e8e8e3",
  egger_w980_16: "#d8cab7",
  kronospan_oak_16: "#b89a73",
  mdf_white_18: "#f4f4f2"
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

export function CabinetViewer({ parts }: { parts: CabinetPart[] }) {
  const scaledParts = useMemo(() => {
    const scale = 0.002;
    const bounds = computeBounds(parts);
    const center = {
      x: (bounds.x * scale) / 2,
      y: (bounds.y * scale) / 2,
      z: (bounds.z * scale) / 2
    };

    return parts.map((part) => {
      return {
        ...part,
        color: getColor(part.materialId),
        scale,
        center
      };
    });
  }, [parts]);

  const bounds = computeBounds(parts);
  const sceneSize = Math.max(bounds.x, bounds.y, bounds.z) * 0.002;
  const cameraPosition: [number, number, number] = [sceneSize * 1.2, sceneSize * 0.9, sceneSize * 1.8];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", minHeight: 0 }}>
      <Canvas style={{ width: '100%', height: '100%' }} shadows camera={{ position: cameraPosition, fov: 40 }}>
        <color attach="background" args={["#111111"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        <group position={[-0.02, -0.03, -0.02]}>
          {scaledParts.map((part) => {
            const x = (part.position.x + part.size.width / 2) * part.scale - part.center.x;
            const y = (part.position.y + part.size.height / 2) * part.scale - part.center.y;
            const z = (part.position.z + part.size.thickness / 2) * part.scale - part.center.z;

            return (
              <mesh key={part.id} position={[x, y, z]}>
                <boxGeometry args={[part.size.width * part.scale, part.size.height * part.scale, part.size.thickness * part.scale]} />
                <meshStandardMaterial color={part.color} metalness={0.1} roughness={0.65} />
              </mesh>
            );
          })}
        </group>
        <OrbitControls autoRotate={false} enablePan={true} enableZoom={true} />
      </Canvas>
    </div>
  );
}
