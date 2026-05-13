import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
} from "../../data/constructorOptions";

export default function MaterialDrawer({
  type,
  config,
  onClose,
  onBody,
  onFacade,
  onHardware,
}) {
  const title =
    type === "body"
      ? "Материал корпуса"
      : type === "facade"
        ? "Материал фасадов"
        : "Фурнитура";

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

      <div className="cp-drawer">
        <div className="cp-drawer-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>✕</button>
        </div>

        <div className="cp-drawer-grid">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={isActive(option) ? "active" : ""}
              onClick={() => select(option)}
            >
              {type !== "hardware"
                ? <span style={{ background: option.color }} />
                : null}

              <strong>{option.name || option.label}</strong>
              <small>{option.subtitle || "петли и направляющие"}</small>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
