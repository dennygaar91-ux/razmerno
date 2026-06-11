import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./viewerTypes";

interface ViewerToolbarProps {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  exploded: boolean;
  setExploded: Dispatch<SetStateAction<boolean>>;
  showDims: boolean;
  setShowDims: Dispatch<SetStateAction<boolean>>;
  placement?: "top" | "bottom";
}

export function ViewerToolbar({
  view,
  setView,
  exploded,
  setExploded,
  showDims,
  setShowDims,
  placement = "top",
}: ViewerToolbarProps) {
  const placementClass =
    placement === "bottom"
      ? "bottom-3 right-3 md:bottom-4 md:right-4"
      : "top-3 right-3 md:top-4 md:right-4";

  return (
    <div className={`absolute ${placementClass} z-10 flex max-w-[calc(100%-24px)] flex-col items-end gap-1.5`}>
      <div className="hidden sm:flex flex-wrap items-center justify-end gap-1.5 rounded-full bg-white/78 p-1 shadow-[0_1px_2px_rgba(10,10,10,0.035)] backdrop-blur-sm">
        <ToolbarBtn active={view === "iso"} onClick={() => setView("iso")} title="Объемный вид">
          3D
        </ToolbarBtn>
        <ToolbarBtn active={view === "front"} onClick={() => setView("front")}>Спереди</ToolbarBtn>
        <ToolbarBtn active={view === "side"} onClick={() => setView("side")}>Сбоку</ToolbarBtn>
        <ToolbarBtn active={view === "top"} onClick={() => setView("top")}>Сверху</ToolbarBtn>
        <ToolbarBtn active={view === "twoD"} onClick={() => setView("twoD")}>2D</ToolbarBtn>
        {view !== "twoD" && (
          <>
            <span className="mx-0.5 h-5 w-px bg-[var(--color-line)]" />
            <ToolbarBtn active={exploded} onClick={() => setExploded((v) => !v)} title="Показать детали отдельно">
              {exploded ? "Собрать" : "Детали"}
            </ToolbarBtn>
            <ToolbarBtn active={showDims} onClick={() => setShowDims((v) => !v)} title="Показать размеры">
              {showDims ? "Размеры ✓" : "Размеры"}
            </ToolbarBtn>
          </>
        )}
      </div>

      <MobileToolbar
        view={view}
        setView={setView}
        exploded={exploded}
        setExploded={setExploded}
        showDims={showDims}
        setShowDims={setShowDims}
      />
    </div>
  );
}

function MobileToolbar({
  view,
  setView,
  exploded,
  setExploded,
  showDims,
  setShowDims,
}: ViewerToolbarProps) {
  return (
    <div className="sm:hidden flex flex-col items-end gap-1.5">
      <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
        <SegmentBtn active={view === "iso"} onClick={() => setView("iso")} title="Объемный вид">
          3D
        </SegmentBtn>
        <SegmentBtn active={view === "front"} onClick={() => setView("front")}>Фасад</SegmentBtn>
        <SegmentBtn active={view === "top"} onClick={() => setView("top")}>Верх</SegmentBtn>
      </div>

      {view !== "twoD" && (
        <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
          <SegmentBtn active={exploded} onClick={() => setExploded((v) => !v)} title="Показать детали отдельно">
            {exploded ? "Собрать" : "Детали"}
          </SegmentBtn>
          <SegmentBtn active={showDims} onClick={() => setShowDims((v) => !v)} title="Показать размеры">
            {showDims ? "мм ✓" : "мм"}
          </SegmentBtn>
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-7 rounded-full px-2.5 text-[11px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink)] text-white"
          : "text-[var(--color-ink-soft)] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function SegmentBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-7 rounded-full px-2 text-[10px] font-semibold transition-colors ${
        active
          ? "bg-[var(--color-ink)] text-white"
          : "text-[var(--color-ink-soft)] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}
