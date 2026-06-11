import { useEffect, useState } from "react";

export type ThreeSceneQuality = "standard" | "reduced";

function shouldUseReducedQuality() {
  if (typeof window === "undefined") return true;

  const memory = typeof navigator !== "undefined" && "deviceMemory" in navigator
    ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory)
    : undefined;

  const cores = typeof navigator !== "undefined" && "hardwareConcurrency" in navigator
    ? Number(navigator.hardwareConcurrency)
    : undefined;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const narrow = window.matchMedia?.("(max-width: 760px)").matches ?? false;

  return reducedMotion || narrow || Boolean(memory && memory <= 4) || Boolean(cores && cores <= 4);
}

export function useThreeSceneQuality() {
  const [quality, setQuality] = useState<ThreeSceneQuality>("reduced");

  useEffect(() => {
    setQuality(shouldUseReducedQuality() ? "reduced" : "standard");
  }, []);

  return quality;
}
