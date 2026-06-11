import * as THREE from "three";
import type { MaterialToken } from "../types";
import { getBackPanelMaterialForBody } from "../../../shared/materials/materialMapping";
import { getRequiredMaterial } from "../../../shared/materials/materialCatalog";
import { getTextureRepeatForMaterial } from "../../../shared/materials/materialPresentation";

const textureCache = new Map<string, THREE.Texture>();

function createTexture(url: string, repeat: [number, number] = [1.8, 1.8]) {
  if (typeof document === "undefined") return null;
  const cached = textureCache.get(url);
  if (cached) return cached;

  const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  textureCache.set(url, texture);
  return texture;
}

function createBoardMaterial(materialToken: MaterialToken, roughness = 0.66) {
  const material = getRequiredMaterial(materialToken);
  const texture = createTexture(material.textureUrl, getTextureRepeatForMaterial(material));

  return new THREE.MeshPhysicalMaterial({
    color: material.fallbackHex,
    map: texture ?? undefined,
    roughness,
    metalness: 0.015,
    clearcoat: material.kind === "mdf" ? 0.18 : 0.08,
    clearcoatRoughness: 0.72,
    sheen: 0.08,
    sheenRoughness: 0.9,
  });
}

export function createThreeMaterials(material: MaterialToken, facadeMaterial: MaterialToken = material) {
  const backPanel = getBackPanelMaterialForBody(material);
  const body = createBoardMaterial(material, 0.7);
  const facade = createBoardMaterial(facadeMaterial, 0.58);
  const facadeGhost = createBoardMaterial(facadeMaterial, 0.62);
  facadeGhost.transparent = true;
  facadeGhost.opacity = 0.34;
  facadeGhost.depthWrite = false;
  const backTexture = createTexture(backPanel.textureUrl, getTextureRepeatForMaterial(backPanel));

  const back = new THREE.MeshPhysicalMaterial({
    color: backPanel.fallbackHex,
    map: backTexture ?? undefined,
    roughness: 0.9,
    metalness: 0,
    clearcoat: 0.02,
    clearcoatRoughness: 0.9,
  });

  const hardware = new THREE.MeshStandardMaterial({
    color: "#202230",
    roughness: 0.22,
    metalness: 0.72,
  });

  const hardwareLight = new THREE.MeshStandardMaterial({
    color: "#d7d4cb",
    roughness: 0.2,
    metalness: 0.86,
    envMapIntensity: 0.72,
  });

  const accent = new THREE.MeshStandardMaterial({
    color: "#ff724c",
    emissive: "#ff724c",
    emissiveIntensity: 0.18,
    roughness: 0.42,
    metalness: 0.08,
  });

  const shadow = new THREE.MeshStandardMaterial({
    color: "#d9dbe3",
    roughness: 0.92,
    metalness: 0,
  });

  const edge = new THREE.LineBasicMaterial({
    color: "#2a2c41",
    transparent: true,
    opacity: 0.12,
  });

  return { body, facade, facadeGhost, back, hardware, hardwareLight, accent, shadow, edge };
}
