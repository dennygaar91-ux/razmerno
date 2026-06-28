import type { OrderPayload } from "../../../shared/lib/order";
import type { ConstructorStoreState } from "../store/constructorStore";
import type { ConstructorLayoutModel } from "../layoutTypes";
import type {
  ConstructorDraft,
  FillKey,
  MaterialOption,
  QuoteState,
} from "../types";
import { facadeOptions, furnitureOptions, materialOptions } from "../options";
import { resolveMaterialId } from "../../../shared/materials/materialCatalog";
import { buildProjectMaterials } from "../rules/projectRules";

export type ConstructorSnapshot = Pick<
  ConstructorStoreState,
  | "furniture"
  | "width"
  | "height"
  | "depth"
  | "fill"
  | "sections"
  | "compartments"
  | "handleless"
  | "material"
  | "deliveryEnabled"
  | "assemblyEnabled"
  | "deliveryAddress"
  | "contact"
  | "consent"
> &
  Partial<
    Pick<
      ConstructorStoreState,
      | "sectionLayout"
      | "selectedSectionId"
      | "compartmentLayout"
      | "fillingLayout"
      | "facadeLayout"
      | "zoneFacadeLayout"
      | "selectedCompartmentId"
      | "facadeMaterial"
      | "backPanelMaterial"
      | "projectMaterials"
      | "validation"
      | "shelvesCount"
      | "drawersCount"
      | "rodsCount"
    >
  >;

export type ConstructorFilling = {
  shelves: number;
  drawers: number;
  hangingRod: boolean;
};

export function getSelectedFurniture(
  snapshot: Pick<ConstructorSnapshot, "furniture">,
) {
  return (
    furnitureOptions.find((item) => item.key === snapshot.furniture) ??
    furnitureOptions[0]
  );
}

export function getSelectedMaterial(
  snapshot: Pick<ConstructorSnapshot, "material">,
): MaterialOption {
  return (
    materialOptions.find(
      (item) => item.materialId === resolveMaterialId(snapshot.material),
    ) ?? materialOptions[0]
  );
}

export function getSelectedFacadeMaterial(
  snapshot: Pick<ConstructorSnapshot, "facadeMaterial" | "material">,
): MaterialOption {
  return (
    facadeOptions.find(
      (item) => item.materialId === resolveMaterialId(snapshot.facadeMaterial),
    ) ?? getSelectedMaterial(snapshot)
  );
}

export function buildConstructorFilling(
  snapshot: Pick<
    ConstructorSnapshot,
    | "fill"
    | "sections"
    | "compartments"
    | "shelvesCount"
    | "drawersCount"
    | "rodsCount"
    | "fillingLayout"
  >,
): ConstructorFilling {
  if (snapshot.fillingLayout) {
    const layoutTotals = Object.values(snapshot.fillingLayout).reduce(
      (totals, section) => {
        for (const filling of Object.values(section)) {
          totals.shelves += Math.max(0, filling.shelvesCount ?? 0);
          totals.drawers += Math.max(0, filling.drawersCount ?? 0);
          totals.rods += Math.max(0, filling.rodsCount ?? 0);
        }
        return totals;
      },
      { shelves: 0, drawers: 0, rods: 0 },
    );

    return {
      shelves: layoutTotals.shelves,
      drawers: layoutTotals.drawers,
      hangingRod: layoutTotals.rods > 0,
    };
  }

  const shelvesCount = snapshot.shelvesCount || 0;
  const drawersCount = snapshot.drawersCount || 0;
  const rodsCount = snapshot.rodsCount || 0;
  const hasExplicitCounts =
    shelvesCount > 0 || drawersCount > 0 || rodsCount > 0;
  if (hasExplicitCounts) {
    return {
      shelves: Math.max(0, shelvesCount),
      drawers: Math.max(0, drawersCount),
      hangingRod: rodsCount > 0,
    };
  }

  return {
    shelves:
      snapshot.fill === "shelves"
        ? Math.max(0, snapshot.sections * Math.max(1, snapshot.compartments))
        : 0,
    drawers: snapshot.fill === "drawers" ? Math.max(1, snapshot.sections) : 0,
    hangingRod: snapshot.fill === "rod",
  };
}

function getCompartmentKind(fill: FillKey) {
  if (fill === "drawers") return "drawers" as const;
  if (fill === "rod") return "rod" as const;
  return "shelves" as const;
}

function getSnapshotSectionWidths(
  snapshot: Pick<ConstructorSnapshot, "width" | "sections" | "sectionLayout">,
) {
  const safeSections = Math.max(1, Math.floor(snapshot.sections || 1));
  if (
    Array.isArray(snapshot.sectionLayout) &&
    snapshot.sectionLayout.length === safeSections
  ) {
    const total = snapshot.sectionLayout.reduce(
      (sum, section) => sum + section.widthMm,
      0,
    );
    if (total === snapshot.width)
      return snapshot.sectionLayout.map((section) => section.widthMm);
  }

  const base = Math.floor(snapshot.width / safeSections);
  const remainder = snapshot.width - base * safeSections;
  return Array.from(
    { length: safeSections },
    (_, index) => base + (index === safeSections - 1 ? remainder : 0),
  );
}

function makeCompartmentHeight(
  totalHeightMm: number,
  compartments: number,
  index: number,
  fill: FillKey,
) {
  const safeCompartments = Math.max(1, Math.floor(compartments || 1));
  if (fill === "rod" && safeCompartments === 1)
    return Math.max(1200, totalHeightMm);

  const base = Math.floor(totalHeightMm / safeCompartments);
  const remainder = totalHeightMm - base * safeCompartments;
  const height = base + (index === safeCompartments - 1 ? remainder : 0);
  if (fill === "rod" && index === 0) return Math.max(1200, height);
  return height;
}

function getSnapshotCompartments(
  snapshot: Pick<ConstructorSnapshot, "height" | "compartments" | "fill" | "compartmentLayout">,
  sectionId: string,
) {
  const explicit = snapshot.compartmentLayout?.[sectionId];
  if (Array.isArray(explicit) && explicit.length > 0) return explicit;

  const safeCompartments = Math.max(1, Math.floor(snapshot.compartments || 1));
  return Array.from({ length: safeCompartments }, (_, compartmentIndex) => ({
    id: `${sectionId}-compartment-${compartmentIndex + 1}`,
    heightMm: makeCompartmentHeight(
      snapshot.height,
      safeCompartments,
      compartmentIndex,
      snapshot.fill,
    ),
  }));
}

export function buildConstructorLayout(
  snapshot: ConstructorSnapshot,
): ConstructorLayoutModel {
  const safeSections = Math.max(1, Math.floor(snapshot.sections || 1));
  const sectionWidths = getSnapshotSectionWidths(snapshot);
  const kind = getCompartmentKind(snapshot.fill);
  const hasAnyExplicitFilling = snapshot.fillingLayout
    ? Object.values(snapshot.fillingLayout).some((section) =>
        Object.values(section).some(
          (filling) =>
            (filling.shelvesCount ?? 0) > 0 ||
            (filling.drawersCount ?? 0) > 0 ||
            (filling.rodsCount ?? 0) > 0,
        ),
      )
    : false;

  return {
    sections: Array.from({ length: safeSections }, (_, sectionIndex) => {
      const sectionId =
        snapshot.sectionLayout?.[sectionIndex]?.id ??
        `section-${sectionIndex + 1}`;

      return {
        id: sectionId,
        widthMm: sectionWidths[sectionIndex] ?? 0,
        facadeMode: snapshot.facadeLayout?.[sectionId] ?? "hinged",
        compartments: getSnapshotCompartments(snapshot, sectionId).map(
          (compartment, compartmentIndex) => {
            const explicitFilling = snapshot.fillingLayout?.[sectionId]?.[compartment.id];
            const explicitShelves = explicitFilling?.shelvesCount ?? 0;
            const explicitDrawers = explicitFilling?.drawersCount ?? 0;
            const explicitRods = explicitFilling?.rodsCount ?? 0;
            const hasExplicitFilling =
              explicitShelves > 0 || explicitDrawers > 0 || explicitRods > 0;
            const isActiveFillCompartment = hasExplicitFilling
              ? true
              : hasAnyExplicitFilling
                ? false
                : snapshot.fill === "shelves" ||
                  (snapshot.fill === "drawers" && compartmentIndex === 0) ||
                  (snapshot.fill === "rod" && compartmentIndex === 0);
            const explicitKind = explicitDrawers > 0
              ? "drawers"
              : explicitRods > 0
                ? "rod"
                : explicitShelves > 0
                  ? "shelves"
                  : kind;

            return {
              id: compartment.id,
              kind: isActiveFillCompartment ? explicitKind : "empty",
              heightMm: compartment.heightMm,
              shelves: hasExplicitFilling
                ? explicitShelves
                : isActiveFillCompartment && snapshot.fill === "shelves"
                  ? 1
                  : 0,
              drawers: hasExplicitFilling
                ? explicitDrawers
                : isActiveFillCompartment && snapshot.fill === "drawers"
                  ? Math.max(2, Math.min(4, snapshot.compartments))
                  : 0,
              hasRod: hasExplicitFilling
                ? explicitRods > 0
                : isActiveFillCompartment && snapshot.fill === "rod",
            };
          },
        ),
      };
    }),
  };
}

export function buildConstructorDraft(
  snapshot: ConstructorSnapshot,
): ConstructorDraft {
  return {
    dimensions: [snapshot.width, snapshot.height, snapshot.depth],
    furnitureType: getSelectedFurniture(snapshot).label,
    material: getSelectedMaterial(snapshot).label,
    materialId: resolveMaterialId(snapshot.material),
    facadeMaterialId: resolveMaterialId(snapshot.facadeMaterial),
    handleless: snapshot.handleless,
    sections: snapshot.sections,
    compartments: snapshot.compartments,
    sectionLayout: snapshot.sectionLayout,
    facadeLayout: snapshot.facadeLayout,
    zoneFacadeLayout: snapshot.zoneFacadeLayout,
    compartmentLayout: snapshot.compartmentLayout,
    fillingLayout: snapshot.fillingLayout,
    filling: snapshot.fill,
  };
}

export function buildOrderPayloadFromConstructor(
  snapshot: ConstructorSnapshot,
  quote: QuoteState,
  options?: {
    acceptedAt?: string;
    source?: string;
  },
): OrderPayload {
  // State flow contract:
  // - payload = final submission layer
  // - payload must be assembled from snapshot (projection) + quote (derived pricing), not from ad-hoc UI values.
  const selectedFurniture = getSelectedFurniture(snapshot);
  const selectedMaterial = getSelectedMaterial(snapshot);
  const selectedFacadeMaterial = getSelectedFacadeMaterial(snapshot);
  const projectMaterials = snapshot.projectMaterials ?? buildProjectMaterials({
    bodyMaterialId: selectedMaterial.materialId,
    facadeMaterialId: selectedFacadeMaterial.materialId,
  });
  const filling = buildConstructorFilling(snapshot);
  const payload = {
    productType: selectedFurniture.productType,
    dimensions: {
      width: snapshot.width,
      height: snapshot.height,
      depth: snapshot.depth,
    },
    sections: snapshot.sections,
    filling,
    layout: buildConstructorLayout(snapshot),
    materials: {
      bodyId: selectedMaterial.materialId,
      facadeId: selectedFacadeMaterial.materialId,
      facadeKind: (selectedFacadeMaterial.kind === "mdf" ? "mdf" : "ldsp") as "ldsp" | "mdf",
      backPanelId: projectMaterials.backPanelMaterialId,
      backPanelKind: "hdf" as const,
    },
    style: {
      facadeStyleId: snapshot.handleless ? "no-handle" : "regular",
      hardwareId: snapshot.handleless ? "comfort" : "base",
    },
    priceBreakdown: {
      body: quote.price.body,
      facades: quote.price.facades,
      filling: quote.price.filling,
      hardware: quote.price.hardware,
      production: quote.price.production,
      materials: quote.price.materials,
      edgeBanding: quote.price.edgeBanding,
      services: quote.price.services,
      delivery: quote.deliveryQuote.price,
      assembly: quote.assemblyQuote.price,
    },
    totalPrice: quote.total,
    customer: {
      name: snapshot.contact.name.trim(),
      phone: snapshot.contact.phone.trim(),
      email: snapshot.contact.email.trim(),
    },
    delivery: {
      enabled: quote.deliveryQuote.enabled,
      address: quote.deliveryQuote.enabled
        ? quote.deliveryQuote.address || undefined
        : undefined,
      price: quote.deliveryQuote.price,
    },
    assembly: {
      enabled: quote.assemblyQuote.enabled,
      price: quote.assemblyQuote.price,
      rate: quote.assemblyQuote.rate,
      basePrice: quote.assemblyQuote.basePrice,
    },
    consent: {
      personalData: snapshot.consent,
      privacyVersion: "2026-05-24",
      acceptedAt: options?.acceptedAt ?? new Date().toISOString(),
    },
    source: options?.source ?? "constructor-store-adapter",
    honeypot: snapshot.contact.company,
  };

  return payload;
}
