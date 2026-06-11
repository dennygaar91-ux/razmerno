import { useEffect, Suspense, lazy } from "react";
import { ConfigProvider, hasErrors } from "./context";
import { ConfigHeader } from "./ConfigHeader";
import { HorizontalStepper } from "./HorizontalStepper";
import { ActiveStep } from "./steps";
import { Visualization } from "./Visualization";
import { CheckoutDrawer } from "./CheckoutDrawer";
import { QuickStart } from "./QuickStart";
import { useReveal } from "../hooks/useReveal";
import { useConfigBridge } from "./store/useConfigBridge";
import { formatPrice } from "../shared/lib/price";

/**
 * Three.js viewer — основной режим предпросмотра.
 * SVG Visualization оставлена как emergency fallback: VITE_FORCE_SVG_VIEWER=1.
 */
const FORCE_SVG_VIEWER =
  typeof import.meta !== "undefined" &&
  import.meta.env?.VITE_FORCE_SVG_VIEWER === "1";

const LazyThreeViewer = lazy(() =>
  import("./three").then((m) => ({ default: m.ThreeViewer })),
);

function Preview() {
  if (!FORCE_SVG_VIEWER) {
    return (
      <Suspense fallback={<Visualization />}>
        <LazyThreeViewer />
      </Suspense>
    );
  }
  return <Visualization />;
}

export function ConfiguratorPage() {
  return (
    <ConfigProvider>
      <ConfiguratorPageInner />
    </ConfigProvider>
  );
}

function ConfiguratorPageInner() {
  useReveal();
  const { state, actions, bodyMaterial, facadeMaterial, price, validation } = useConfigBridge();
  const blocked = hasErrors(validation);
  const mainIssue = validation.find((message) => message.kind === "error") ?? validation[0];

  useEffect(() => {
    const hashQueryIndex = window.location.hash.indexOf("?");
    const rawQuery = window.location.search || (hashQueryIndex >= 0 ? window.location.hash.slice(hashQueryIndex) : "");
    if (!rawQuery) return;
    const params = new URLSearchParams(rawQuery.startsWith("?") ? rawQuery.slice(1) : rawQuery);

    const t = params.get("type");
    if (t === "wardrobe" || t === "dresser" || t === "nightstand") {
      actions.setType(t);
    }
    const w = parseInt(params.get("w") ?? "", 10);
    const h = parseInt(params.get("h") ?? "", 10);
    const d = parseInt(params.get("d") ?? "", 10);
    if (w) actions.setDimension("width", w);
    if (h) actions.setDimension("height", h);
    if (d) actions.setDimension("depth", d);

    const sec = parseInt(params.get("sections") ?? "", 10);
    if (sec) actions.setSections(sec);

    const shelves = parseInt(params.get("shelves") ?? "", 10);
    const drawers = parseInt(params.get("drawers") ?? "", 10);
    const rodRaw = params.get("rod");
    const filling: { shelves?: number; drawers?: number; hangingRod?: boolean } = {};
    if (!Number.isNaN(shelves)) filling.shelves = shelves;
    if (!Number.isNaN(drawers)) filling.drawers = drawers;
    if (rodRaw !== null) filling.hangingRod = rodRaw === "1" || rodRaw === "true";
    if (Object.keys(filling).length > 0) actions.setFilling(filling);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--rzm-surface-canvas)] text-[var(--rzm-text-main)] flex flex-col rzm-stage-r13-desktop-shell rzm-stage-r14-simple-mode">
      <ConfigHeader />

      {!state.type ? (
        <QuickStart />
      ) : (
        <section className="rzm-r13-workspace" aria-label="Конструктор мебели">
          <aside className="rzm-r13-sidebar" aria-label="Настройки текущего шага">
            <div className="rzm-r13-sidebar-card">
              <ActiveStep />
            </div>
          </aside>

          <main className="rzm-r13-main" aria-label="Рабочая сцена конструктора">
            <div className="rzm-r13-scene-shell">
              <div className="rzm-r13-stepper-shell">
                <HorizontalStepper />
              </div>

              <div className="rzm-r13-workbar" aria-label="Статус сцены и проекта">
                <div className="rzm-r13-mode-note">
                  <span>{state.advancedLayout ? "Точная настройка" : "Обычный режим"}</span>
                  <strong>{state.activeStep === 3 ? "Финальная проверка" : "Настройка проекта"}</strong>
                </div>

                <div className="rzm-r13-scene-status" data-blocked={blocked ? "true" : undefined}>
                  <span aria-hidden="true" />
                  <strong>{blocked ? "Нужно исправить" : "Конфигурация в порядке"}</strong>
                  {mainIssue && <small>{mainIssue.text}</small>}
                </div>

                <button
                  type="button"
                  className="rzm-r13-price-chip"
                  onClick={() => actions.setStep(3)}
                  aria-label="Перейти к заявке и смете"
                >
                  <span>Стоимость</span>
                  <strong>{formatPrice(price.total)}</strong>
                </button>
              </div>

              <div className="rzm-r13-scene-viewport">
                <Preview />
              </div>

              <div className="rzm-r13-scene-meta" aria-label="Краткая информация о проекте">
                <span>{state.width} × {state.height} × {state.depth} мм</span>
                <span>{bodyMaterial.name}</span>
                <span>{facadeMaterial.name}</span>
              </div>
            </div>
          </main>
        </section>
      )}

      <CheckoutDrawer />
    </div>
  );
}
