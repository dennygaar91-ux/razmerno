import MaterialSelect from "./MaterialSelect";

export default function MaterialControls({
  bodyMaterial,
  facadeMaterial,
  hardwareBrand,
  onBody,
  onFacade,
  onHardware,
}) {
  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span>03</span>
        <h2>Материалы</h2>
      </div>

      <MaterialSelect
        title="Корпус"
        name={bodyMaterial.name}
        color={bodyMaterial.color}
        onClick={onBody}
      />

      <MaterialSelect
        title="Фасады"
        name={facadeMaterial.name}
        color={facadeMaterial.color}
        onClick={onFacade}
      />

      <MaterialSelect
        title="Фурнитура"
        name={hardwareBrand}
        onClick={onHardware}
      />
    </div>
  );
}
