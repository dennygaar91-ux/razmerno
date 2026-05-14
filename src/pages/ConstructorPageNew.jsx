import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import PremiumCabinetViewer from "../constructor/PremiumCabinetViewer";
import ConstructorProgressPanel from "../constructor/components/ConstructorProgressPanel";
import FillCounter from "../constructor/components/FillCounter";
import FillStep from "../constructor/components/FillStep";
import MaterialDrawer from "../constructor/components/MaterialDrawer";
import MaterialStep from "../constructor/components/MaterialStep";
import SizeStep from "../constructor/components/SizeStep";
import SummaryPanel from "../constructor/components/SummaryPanel";
import { DIMENSION_LIMITS, FILL_PRESETS } from "../constructor/config/constructorUiConfig";
import {
  clearConstructorDraft,
  hasConstructorDraft,
  loadConstructorDraft,
  saveConstructorDraft,
} from "../constructor/utils/constructorDraftStorage";
import { clamp, getItemCount } from "../constructor/utils/constructorUiUtils";
import { useCabinetStore } from "../store/cabinetStore";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  handleOptions,
} from "../data/constructorOptions";
import "../styles/constructor-premium.css";
import "../styles/constructor-mobile-action-bar.css";
import "../styles/constructor-desktop-polish.css";
import "../styles/constructor-fill-step-polish.css";
import "../styles/constructor-material-step-polish.css";
import "../styles/constructor-summary-polish.css";
import "../styles/constructor-priority-layout.css";
import "../styles/constructor-left-panel-wizard.css";
import "../styles/constructor-summary-compact.css";
import "../styles/constructor-viewer-premium.css";
import "../styles/constructor-actions-toast.css";
import "../styles/constructor-progress-wizard.css";
import "../styles/constructor-material-drawer-premium.css";
import "../styles/constructor-mobile-polish.css";
import "../styles/constructor-final-ui-cleanup.css";
import "../styles/constructor-step-intro-polish.css";
import "../styles/constructor-fill-preset-visuals.css";
import "../styles/constructor-section-minimap.css";
import "../styles/constructor-summary-client.css";
import "../styles/constructor-client-panels.css";
import "../styles/constructor-advanced-client.css";
import "../styles/constructor-material-textures.css";
import "../styles/constructor-target-layout.css";
import "../styles/constructor-target-components.css";
import "../styles/constructor-fill-controls-premium.css";
import "../styles/constructor-viewer-controls-target.css";

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
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
