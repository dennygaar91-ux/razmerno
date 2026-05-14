import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
} from "../../data/constructorOptions";

const DRAWER_META = {
  body: {
    title: "Материал корпуса",
    eyebrow: "Корпус",
    description: "Цвет и фактура внутренних деталей шкафа: боковины, полки, перегородки.",
  },
  facade: {
    title: "Материал фасадов",
    eyebrow: "Фасады",
    description: "Внешний вид шкафа. Этот выбор сильнее всего влияет на ощущение мебели в интерьере.",
  },
  hardware: {
    title: "Фурнитура",
    eyebrow: "Механика",
    description: "Петли, направляющие и механизмы открывания. Для MVP показываем простые понятные варианты.",
  },
};

function getOptionBadge(type, option, index) {
  if (type === "hardware") return "фурнитура";
  if (option.badge) return option.badge;
  return index === 0 ? "база" : "премиум";
}

export default function MaterialDrawer({
  type,
  config,
  onClose,
  onBody,
  onFacade,
  onHardware,
}) {
  const meta = DRAWER_META[type] || DRAWER_META.body;

  const options =
    type === "body"
      ? bodyMaterialOptions
      : type === "facade"
        ? facadeMaterialOptions
        : hardwareBrandOptions;

  function isActive(option) {
    if (type === "body") {
      return config.materials.bodyMaterialId === option.id;
    }

    if (type === "facade") {
      return config.materials.facadeMaterialId === option.id;
    }

    return config.options.hardwareBrand === option.id;
  }

  function select(option) {
    if (type === "body") onBody(option.id);
    if (type === "facade") onFacade(option.id);
    if (type === "hardware") onHardware(option.id);

    onClose();
  }

  return (
    <>
      <div className="cp-drawer-overlay" onClick={onClose} />

      <div className="cp-drawer cp-material-drawer">
        <div className="cp-drawer-head">
          <div>
            <span>{meta.eyebrow}</span>
            <h3>{meta.title}</h3>
            <p>{meta.description}</p>
          </div>
          <button type="button" aria-label="Закрыть" onClick={onClose}>✕</button>
        </div>

        <div className="cp-drawer-grid">
          {options.map((option, index) => {
            const active = isActive(option);
            const label = option.name || option.label;
            const badge = getOptionBadge(type, option, index);

            return (
              <button
                key={option.id}
                type="button"
                className={active ? "active" : ""}
                onClick={() => select(option)}
              >
                <div className="cp-drawer-option-visual">
                  {type !== "hardware"
                    ? <span style={{ background: option.color }} />
                    : <i>{label?.slice(0, 1)}</i>}
                </div>

                <div className="cp-drawer-option-copy">
                  <em>{badge}</em>
                  <strong>{label}</strong>
                  <small>{option.subtitle || "петли и направляющие"}</small>
                </div>

                <b>{active ? "Выбрано" : "Выбрать"}</b>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
