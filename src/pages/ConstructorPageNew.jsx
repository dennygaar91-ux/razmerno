import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import PremiumCabinetViewer from "../constructor/PremiumCabinetViewer";
import FillCounter from "../constructor/components/FillCounter";
import MaterialDrawer from "../constructor/components/MaterialDrawer";
import MaterialSelect from "../constructor/components/MaterialSelect";
import ConstructorSummary from "../constructor/components/ConstructorSummary";
import { useCabinetStore } from "../store/cabinetStore";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
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