import * as THREE from "three";
/**
 * Материалы для Three.js — процедурные canvas-текстуры.
 * Никаких внешних ассетов (ТЗ запрещает).
 *
 * Для каждого materialId создаётся:
 *  - baseColor (hex)
 *  - canvas-paint (для дерева — procedural noise + полосы; для матовых — soft gradient)
 *  - roughness/metalness preset
 *
 * После npm install — переключиться на реальные three.Texture/MeshPhysicalMaterial.
 */

export type MaterialKind = "matte" | "wood" | "stone";

export interface MaterialPreset {
  id: string;
  name: string;
  kind: MaterialKind;
  baseColor: string;
  roughness: number;
  metalness: number;
  /** Параметры для procedural canvas. */
  paint?: {
    stripes?: { count: number; alpha: number; tint: string };
    noise?: { amount: number; tint: string };
  };
}

export const MATERIAL_PRESETS: Record<string, MaterialPreset> = {
  "white-matt": {
    id: "white-matt",
    name: "Белый матовый",
    kind: "matte",
    baseColor: "#f1efe9",
    roughness: 0.78,
    metalness: 0.0,
  },
  cashmere: {
    id: "cashmere",
    name: "Кашемир",
    kind: "matte",
    baseColor: "#d6cfc0",
    roughness: 0.7,
    metalness: 0.0,
  },
  "oak-natural": {
    id: "oak-natural",
    name: "Дуб натуральный",
    kind: "wood",
    baseColor: "#c8a474",
    roughness: 0.65,
    metalness: 0.05,
    paint: {
      stripes: { count: 22, alpha: 0.18, tint: "#7d5d39" },
      noise: { amount: 0.08, tint: "#8a6a45" },
    },
  },
  "oak-dark": {
    id: "oak-dark",
    name: "Дуб тёмный",
    kind: "wood",
    baseColor: "#6b4a2f",
    roughness: 0.62,
    metalness: 0.08,
    paint: {
      stripes: { count: 26, alpha: 0.22, tint: "#2f1d10" },
      noise: { amount: 0.1, tint: "#3a2515" },
    },
  },
  graphite: {
    id: "graphite",
    name: "Графит",
    kind: "matte",
    baseColor: "#3a3a3c",
    roughness: 0.6,
    metalness: 0.0,
  },
  concrete: {
    id: "concrete",
    name: "Бетон светлый",
    kind: "stone",
    baseColor: "#c6c3bc",
    roughness: 0.85,
    metalness: 0.0,
    paint: {
      noise: { amount: 0.22, tint: "#8d8a83" },
    },
  },
};

/**
 * Простой procedural «дуб» в canvas. Возвращает HTMLCanvasElement —
 * three.CanvasTexture использует его как map.
 */
export function makeProceduralTexture(preset: MaterialPreset): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // base fill
  ctx.fillStyle = preset.baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // noise
  if (preset.paint?.noise) {
    const { amount, tint } = preset.paint.noise;
    ctx.fillStyle = tint;
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 1.4;
      ctx.globalAlpha = amount * Math.random();
      ctx.fillRect(x, y, r, r);
    }
    ctx.globalAlpha = 1;
  }

  // wood stripes
  if (preset.paint?.stripes) {
    const { count, alpha, tint } = preset.paint.stripes;
    ctx.strokeStyle = tint;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < count; i++) {
      const y = (i * 512) / count + Math.random() * 6 - 3;
      ctx.lineWidth = 0.8 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      // wavy line
      let yy = y;
      for (let x = 0; x <= 512; x += 16) {
        yy = y + Math.sin(x * 0.02 + i) * 1.4;
        ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  return canvas;
}

export function presetFor(materialId: string): MaterialPreset {
  return MATERIAL_PRESETS[materialId] ?? MATERIAL_PRESETS["white-matt"];
}


const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Возвращает одну shared CanvasTexture на materialId.
 * Важно: отдельные PanelMesh не должны dispose() shared-текстуру.
 */
export function getProceduralTexture(materialId: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const cached = textureCache.get(materialId);
  if (cached) return cached;

  const preset = presetFor(materialId);
  const canvas = makeProceduralTexture(preset);
  if (!canvas) return null;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  textureCache.set(materialId, tex);
  return tex;
}

export function disposeProceduralTextureCache() {
  for (const texture of textureCache.values()) {
    texture.dispose();
  }
  textureCache.clear();
}

export function getProceduralTextureCacheSize(): number {
  return textureCache.size;
}
