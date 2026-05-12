import type { CabinetSection } from "../engine/types";

type SectionsEditorProps = {
  sections: CabinetSection[];
  onUpdateWidth: (sectionId: string, value: number) => void;
  onUpdateShelves: (sectionId: string, value: number) => void;
  onUpdateDrawers: (sectionId: string, value: number) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onAutoDistribute: () => void;
};

export function SectionsEditor({
  sections,
  onUpdateWidth,
  onUpdateShelves,
  onUpdateDrawers,
  onAddSection,
  onRemoveSection,
  onAutoDistribute
}: SectionsEditorProps) {
  return (
    <div className="cst-panel">
      <div className="cst-section-title">Секции шкафа</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="cst-hw-btn" type="button" onClick={onAutoDistribute}>
          Распределить автоматически
        </button>
        <button className="cst-hw-btn" type="button" onClick={onAddSection}>
          Добавить секцию
        </button>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {sections.map((section, index) => {
          const shelfItem = section.items.find((item) => item.type === "shelf");
          const drawerItem = section.items.find((item) => item.type === "drawer");

          return (
            <div
              key={section.id}
              style={{
                border: "1px solid rgba(17,17,17,.08)",
                borderRadius: 14,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 14,
                alignItems: "end"
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Секция {index + 1}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  ширина секции
                </div>
              </div>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>
                  Ширина, мм
                </span>
                <input
                  type="number"
                  min={200}
                  value={section.width}
                  onChange={(event) => onUpdateWidth(section.id, Number(event.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    fontSize: 14
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>
                  Полки
                </span>
                <input
                  type="number"
                  min={0}
                  value={shelfItem?.count || 0}
                  onChange={(event) => onUpdateShelves(section.id, Number(event.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    fontSize: 14
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>
                  Ящики
                </span>
                <input
                  type="number"
                  min={0}
                  value={drawerItem?.count || 0}
                  onChange={(event) => onUpdateDrawers(section.id, Number(event.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    fontSize: 14
                  }}
                />
              </label>

              <button
                type="button"
                className="cst-back"
                style={{ width: 120, height: 36, marginTop: 4 }}
                onClick={() => onRemoveSection(section.id)}
              >
                Удалить
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
