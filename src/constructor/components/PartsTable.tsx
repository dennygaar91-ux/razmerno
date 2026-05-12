import type { CabinetPart } from "../engine/types";

type PartsTableProps = {
  parts: CabinetPart[];
};

function formatSize(part: CabinetPart) {
  return `${part.size.width} × ${part.size.height} × ${part.size.thickness} мм`;
}

function formatEdge(edge: CabinetPart["edge"]) {
  const sides = [];

  if (edge.top) sides.push(`верх: ${edge.top}`);
  if (edge.bottom) sides.push(`низ: ${edge.bottom}`);
  if (edge.left) sides.push(`лево: ${edge.left}`);
  if (edge.right) sides.push(`право: ${edge.right}`);

  return sides.length ? sides.join(", ") : "—";
}

function formatPosition(position: CabinetPart["position"]) {
  return `x: ${position.x}, y: ${position.y}, z: ${position.z}`;
}

export function PartsTable({ parts }: PartsTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={thStyle}>№</th>
            <th style={thStyle}>Деталь</th>
            <th style={thStyle}>Материал</th>
            <th style={thStyle}>Размер</th>
            <th style={thStyle}>Кромка</th>
            <th style={thStyle}>Позиция</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part, index) => (
            <tr key={part.id}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{part.name}</td>
              <td style={tdStyle}>{part.materialId}</td>
              <td style={tdStyle}>{formatSize(part)}</td>
              <td style={tdStyle}>{formatEdge(part.edge)}</td>
              <td style={tdStyle}>{formatPosition(part.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #eee",
  fontWeight: 700,
  color: "#333",
  background: "#fcfcfc"
};

const tdStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #f1f1f1",
  color: "#444",
  verticalAlign: "top"
};
