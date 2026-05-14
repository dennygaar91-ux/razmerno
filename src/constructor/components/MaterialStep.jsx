import MaterialSelect from "./MaterialSelect";

export default function MaterialStep({
  bodyName,
  bodyColor,
  facadeName,
  facadeColor,
  hardwareName,
  onSelectBody,
  onSelectFacade,
  onSelectHardware,
}) {
  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span>03</span>
        <h2>Материалы</h2>
      </div>

      <MaterialSelect
        title="Корпус"
        name={bodyName}
        color={bodyColor}
        onClick={onSelectBody}
      />

      <MaterialSelect
        title="Фасады"
        name={facadeName}
        color={facadeColor}
        onClick={onSelectFacade}
      />

      <MaterialSelect
        title="Фурнитура"
        name={hardwareName}
        onClick={onSelectHardware}
      />
    </div>
  );
}
