import "../../styles/constructor-kit-panel.css";

function getPartGroups(parts = []) {
  const groups = {
    panels: 0,
    shelves: 0,
    drawers: 0,
    facades: 0,
    backPanels: 0,
    dividers: 0,
  };

  parts.forEach((part) => {
    const id = String(part.id || "");
    const name = String(part.name || "").toLowerCase();

    if (id.includes("back-panel") || name.includes("back")) {
      groups.backPanels += 1;
      return;
    }

    if (id.includes("shelf") || name.includes("shelf")) {
      groups.shelves += 1;
      return;
    }

    if (id.includes("drawer-front") || name.includes("drawer front")) {
      groups.facades += 1;
      return;
    }

    if (id.includes("drawer-cabinet") || name.includes("drawer box")) {
      groups.drawers += 1;
      return;
    }

    if (id.includes("divider") || name.includes("divider")) {
      groups.dividers += 1;
      return;
    }

    groups.panels += 1;
  });

  return groups;
}

function getHardwareCount(hardware = []) {
  return hardware.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export default function ProjectKitPanel({ result }) {
  const parts = result?.parts || [];
  const hardware = result?.hardware || [];
  const groups = getPartGroups(parts);
  const hardwareCount = getHardwareCount(hardware);
  const visibleRows = [
    { label: "Корпусные детали", value: groups.panels + groups.dividers },
    { label: "Полки", value: groups.shelves },
    { label: "Ящики", value: groups.drawers },
    { label: "Фасады", value: groups.facades },
    { label: "Задние стенки", value: groups.backPanels },
    { label: "Фурнитура и крепёж", value: hardwareCount },
  ].filter((row) => row.value > 0);

  return (
    <section className="cp-kit" aria-label="Что входит в комплект">
      <div className="cp-kit-head">
        <div>
          <span>Комплект</span>
          <strong>Что будет в заказе</strong>
        </div>
        <b>{parts.length}</b>
      </div>

      <div className="cp-kit-list">
        {visibleRows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <b>{row.value}</b>
          </div>
        ))}
      </div>

      <p className="cp-kit-note">
        Перед производством проект нужно будет проверить: размеры, фурнитуру, кромку и комплектность.
      </p>
    </section>
  );
}
