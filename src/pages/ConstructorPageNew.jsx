import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import PremiumCabinetViewer from "../constructor/PremiumCabinetViewer";
import PricingBreakdown from "../constructor/PricingBreakdown";
import IntelligenceSummary from "../constructor/intelligence/IntelligenceSummary";
import { getCabinetIntelligence } from "../constructor/intelligence/getCabinetIntelligence";
import { useCabinetStore } from "../store/cabinetStore";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
  handleOptions,
} from "../data/constructorOptions";
import "../styles/constructor-premium.css";
import "../styles/constructor-pricing-breakdown.css";
import "../styles/constructor-mobile-action-bar.css";
import "../styles/constructor-intelligence.css";

const DIMENSION_LIMITS = {
  height: { label: "Высота", min: 200, max: 2800 },
  width: { label: "Ширина", min: 200, max: 3600 },
  depth: { label: "Глубина", min: 200, max: 900 },
};

const FILL_PRESETS = [
  { id: "shelves", label: "Полки", desc: "4 полки", shelves: 4, drawers: 0, rails: 0 },
  { id: "wardrobe", label: "Гардероб", desc: "полка + штанга", shelves: 1, drawers: 0, rails: 1 },
  { id: "drawers", label: "Ящики снизу", desc: "3 ящика + 2 полки", shelves: 2, drawers: 3, rails: 0 },
  { id: "mixed", label: "Комбо", desc: "полки, ящики, штанга", shelves: 2, drawers: 2, rails: 1 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

export default function ConstructorPageNew() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState("size");
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [drawerType, setDrawerType] = useState(null);
  const [notice, setNotice] = useState("");
  const [pricePulse, setPricePulse] = useState(false);

  const {
    config,
    result,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
    resizeSectionPair,
    setSectionShelves,
    setSectionDrawers,
    setSectionHangerRails,
    setBodyMaterial,
    setFacadeMaterial,
    setHardwareBrand,
    toggleLegs,
    toggleHandles,
    setHandleVariant,
  } = useCabinetStore();

  const [draft, setDraft] = useState(() => ({
    height: String(config.dimensions.height),
    width: String(config.dimensions.width),
    depth: String(config.dimensions.depth),
  }));

  const sectionCount = config.sections.length;
  const autoSectionWidth = sectionCount > 0 ? Math.round(config.dimensions.width / sectionCount) : config.dimensions.width;
  const activeSection = config.sections.find((section) => section.id === activeSectionId) || config.sections[0];
  const price = result.price?.total ?? 0;

  const bodyMaterial = bodyMaterialOptions.find((item) => item.id === config.materials.bodyMaterialId);
  const facadeMaterial = facadeMaterialOptions.find((item) => item.id === config.materials.facadeMaterialId);
  const bodyName = bodyMaterial?.name || "ЛДСП";
  const facadeName = facadeMaterial?.name || "МДФ";
  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";

  const intelligenceItems = useMemo(() => {
    return getCabinetIntelligence(config, result.validation || []);
  }, [config, result.validation]);

  useEffect(() => {
    if (!activeSectionId && config.sections[0]?.id) setActiveSectionId(config.sections[0].id);
  }, [activeSectionId, config.sections]);

  useEffect(() => {
    setDraft({
      height: String(config.dimensions.height),
      width: String(config.dimensions.width),
      depth: String(config.dimensions.depth),
    });
  }, [config.dimensions.height, config.dimensions.width, config.dimensions.depth]);

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 220);
    return () => window.clearTimeout(timer);
  }, [price]);

  const totals = useMemo(() => {
    return config.sections.reduce(
      (acc, section) => {
        acc.shelves += getItemCount(section, "shelf");
        acc.drawers += getItemCount(section, "drawer");
        acc.rails += getItemCount(section, "hanger_rail");
        return acc;
      },
      { shelves: 0, drawers: 0, rails: 0 }
    );
  }, [config.sections]);

  const activeSectionIsEmpty =
    activeSection &&
    getItemCount(activeSection, "shelf") === 0 &&
    getItemCount(activeSection, "drawer") === 0 &&
    getItemCount(activeSection, "hanger_rail") === 0;

  function commitDimension(key, value) {
    const limits = DIMENSION_LIMITS[key];
    const numeric = Number(value);
    const next = Number.isFinite(numeric) ? clamp(Math.round(numeric), limits.min, limits.max) : limits.min;
    updateDimensions(key, next);
    setDraft((prev) => ({ ...prev, [key]: String(next) }));
  }

  function stepDimension(key, delta) {
    const limits = DIMENSION_LIMITS[key];
    const next = clamp(Number(config.dimensions[key]) + delta, limits.min, limits.max);
    updateDimensions(key, next);
    setDraft((prev) => ({ ...prev, [key]: String(next) }));
  }

  function setSectionCount(nextCount) {
    const safeCount = clamp(nextCount, 1, 6);
    if (safeCount === sectionCount) return;

    if (safeCount > sectionCount) {
      for (let index = sectionCount; index < safeCount; index += 1) addSection();
    } else {
      config.sections.slice(safeCount).forEach((section) => removeSection(section.id));
    }

    autoDistributeSections();
    setNotice(`Секции перераспределены: ${safeCount}`);
  }
}
