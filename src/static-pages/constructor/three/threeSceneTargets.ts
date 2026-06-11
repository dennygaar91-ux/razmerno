import type {
  ThreeFurnitureInput,
  ThreeInteractionTarget,
} from "./threeTypes";
import { getSectionId, type createCompartmentItems } from "./threeSceneLayout";

type ExplicitFillingItems = ReturnType<typeof createCompartmentItems>;

export function createInteractionTargets(input: {
  modelInput: ThreeFurnitureInput;
  explicitFillingItems: ExplicitFillingItems;
  sectionWidths: number[];
  sectionStarts: number[];
  safeSections: number;
  width: number;
  height: number;
  depth: number;
  thickness: number;
}): ThreeInteractionTarget[] {
  const targets: ThreeInteractionTarget[] = [];
  const targetZ = input.depth / 2 + 0.16;
  const labelZ = input.depth / 2 + 0.24;

  for (let sectionIndex = 0; sectionIndex < input.safeSections; sectionIndex += 1) {
    const sectionId = getSectionId(input.modelInput, sectionIndex);
    const sectionWidth = input.sectionWidths[sectionIndex] ?? input.width / input.safeSections;
    const sectionStart = input.sectionStarts[sectionIndex] ?? -input.width / 2;
    const x = sectionStart + sectionWidth / 2;
    const isSelectedSection = input.modelInput.selectedSectionId === sectionId;

    targets.push({
      id: `target-section-${sectionId}`,
      kind: "section",
      sectionId,
      index: sectionIndex + 1,
      label: `${sectionIndex + 1}`,
      fullLabel: `Секция ${sectionIndex + 1}`,
      position: [x, input.height / 2, targetZ],
      labelPosition: [x, input.height + input.thickness * 2.4, labelZ],
      size: [Math.max(input.thickness, sectionWidth - input.thickness * 1.4), Math.max(input.thickness, input.height - input.thickness * 3), input.thickness],
      selected: isSelectedSection && !input.modelInput.selectedCompartmentId,
    });
  }

  const usedCompartmentIds = new Set<string>();
  input.explicitFillingItems.forEach((item, itemIndex) => {
    const key = `${item.sectionId}:${item.compartmentId}`;
    if (usedCompartmentIds.has(key)) return;
    usedCompartmentIds.add(key);
    const sectionIndex = item.sectionIndex;
    const sectionId = item.sectionId;
    const sectionCompartments = input.explicitFillingItems.filter((candidate) => candidate.sectionId === sectionId);
    const zoneIndex = Math.max(1, sectionCompartments.findIndex((candidate) => candidate.compartmentId === item.compartmentId) + 1) || itemIndex + 1;
    const y = item.yStart + item.height / 2;
    const isSelected = input.modelInput.selectedCompartmentId === item.compartmentId;

    targets.push({
      id: `target-compartment-${sectionId}-${item.compartmentId}`,
      kind: "compartment",
      sectionId,
      compartmentId: item.compartmentId,
      index: zoneIndex,
      label: `${sectionIndex + 1}.${zoneIndex}`,
      fullLabel: `Секция ${sectionIndex + 1} · зона ${zoneIndex}`,
      position: [item.x, y, targetZ + 0.012],
      labelPosition: [item.x, y, labelZ + 0.018],
      size: [Math.max(input.thickness, item.width - input.thickness * 2.2), Math.max(input.thickness, item.height - input.thickness * 1.6), input.thickness],
      selected: isSelected,
    });
  });

  return targets;
}

