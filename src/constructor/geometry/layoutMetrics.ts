import type { FurnitureProject, GeometrySection } from "./types.js";

export type SectionMetric = {
  section: GeometrySection | null;
  sectionIndex: number;
  xStartMm: number;
  innerWidthMm: number;
};

function hasUsableLayout(sections: GeometrySection[] | undefined): sections is GeometrySection[] {
  return Array.isArray(sections) && sections.length > 0;
}

export function getSectionMetrics(project: FurnitureProject): SectionMetric[] {
  const bodyThicknessMm = project.material.bodyThicknessMm;
  const sectionCount = Math.max(1, project.structure.sectionCount || project.structure.layout?.sections.length || 1);
  const partitionCount = Math.max(0, sectionCount - 1);
  const availableInnerWidthMm = Math.max(
    0,
    project.dimensions.widthMm - bodyThicknessMm * 2 - partitionCount * bodyThicknessMm,
  );
  const layoutSections = project.structure.layout?.sections;

  if (hasUsableLayout(layoutSections)) {
    const sourceTotalMm = layoutSections.reduce(
      (sum, section) => sum + Math.max(0, section.widthMm || 0),
      0,
    );
    const equalFallbackWidthMm = availableInnerWidthMm / layoutSections.length;
    let cursorX = bodyThicknessMm;

    return layoutSections.map((section, sectionIndex) => {
      const proportionalWidthMm = sourceTotalMm > 0
        ? (Math.max(0, section.widthMm || 0) / sourceTotalMm) * availableInnerWidthMm
        : equalFallbackWidthMm;
      const innerWidthMm = sectionIndex === layoutSections.length - 1
        ? Math.max(0, project.dimensions.widthMm - bodyThicknessMm - cursorX)
        : Math.max(0, proportionalWidthMm);
      const metric = {
        section,
        sectionIndex,
        xStartMm: cursorX,
        innerWidthMm,
      };
      cursorX += innerWidthMm + bodyThicknessMm;
      return metric;
    });
  }

  const equalWidthMm = sectionCount > 0 ? availableInnerWidthMm / sectionCount : 0;
  return Array.from({ length: sectionCount }, (_, sectionIndex) => ({
    section: null,
    sectionIndex,
    xStartMm: bodyThicknessMm + sectionIndex * (equalWidthMm + bodyThicknessMm),
    innerWidthMm: equalWidthMm,
  }));
}

export function getSectionMetric(project: FurnitureProject, sectionIndex: number): SectionMetric {
  return getSectionMetrics(project)[sectionIndex] ?? {
    section: null,
    sectionIndex,
    xStartMm: project.material.bodyThicknessMm,
    innerWidthMm: Math.max(0, project.dimensions.widthMm - project.material.bodyThicknessMm * 2),
  };
}
