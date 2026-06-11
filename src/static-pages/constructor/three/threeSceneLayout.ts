import type { ThreeFurnitureInput } from "./threeTypes";
import { meters } from "./threeScenePrimitives";

export function createSections(input: {
  width: number;
  safeSections: number;
  sectionLayout?: ThreeFurnitureInput["sectionLayout"];
}) {
  const layoutTotalMm =
    input.sectionLayout?.reduce((sum, section) => sum + section.widthMm, 0) ?? 0;
  const useLayout =
    Array.isArray(input.sectionLayout) &&
    input.sectionLayout.length === input.safeSections &&
    layoutTotalMm > 0;
  const sectionWidths = Array.from({ length: input.safeSections }, (_, index) =>
    useLayout
      ? meters(input.sectionLayout?.[index]?.widthMm ?? 0)
      : input.width / input.safeSections,
  );
  const sectionStarts = sectionWidths.reduce<number[]>((starts, _sectionWidth, index) => {
    starts.push(index === 0 ? -input.width / 2 : starts[index - 1] + sectionWidths[index - 1]);
    return starts;
  }, []);

  return { sectionWidths, sectionStarts };
}

export function getSectionId(input: ThreeFurnitureInput, sectionIndex: number) {
  return input.sectionLayout?.[sectionIndex]?.id ?? `section-${sectionIndex + 1}`;
}

export function createCompartmentItems(input: {
  modelInput: ThreeFurnitureInput;
  sectionWidths: number[];
  sectionStarts: number[];
  safeSections: number;
  width: number;
  height: number;
  thickness: number;
}) {
  if (!Array.isArray(input.modelInput.sectionLayout)) return [];

  return input.modelInput.sectionLayout.flatMap((section, sectionIndex) => {
    const compartments = input.modelInput.compartmentLayout?.[section.id] ?? [];
    const totalHeightMm = Math.max(
      1,
      compartments.reduce((sum, compartment) => sum + compartment.heightMm, 0),
    );
    let offsetMm = 0;
    const sectionWidth = input.sectionWidths[sectionIndex] ?? input.width / input.safeSections;
    const x = (input.sectionStarts[sectionIndex] ?? -input.width / 2) + sectionWidth / 2;

    return compartments.map((compartment) => {
      const compartmentHeight = (input.height - input.thickness * 2) * (compartment.heightMm / totalHeightMm);
      const yStart = input.thickness + (input.height - input.thickness * 2) * (offsetMm / totalHeightMm);
      offsetMm += compartment.heightMm;
      return {
        sectionId: section.id,
        compartmentId: compartment.id,
        sectionIndex,
        x,
        yStart,
        height: compartmentHeight,
        width: sectionWidth,
        filling: input.modelInput.fillingLayout?.[section.id]?.[compartment.id],
      };
    });
  });
}

