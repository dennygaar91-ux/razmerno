import type { ValidationMessage } from "../engine/types";

type ValidationPanelProps = {
  messages: ValidationMessage[];
};

export function ValidationPanel({ messages }: ValidationPanelProps) {
  if (messages.length === 0) {
    return (
      <div style={{ padding: 16, background: "#eef5ff", borderRadius: 16 }}>
        <strong style={{ color: "#0f5132" }}>Ошибок нет</strong>
        <p style={{ margin: "8px 0 0", color: "#0f5132" }}>
          Конфигурация готова к расчёту.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, borderRadius: 16, background: "#fff4e5", border: "1px solid #f5cda3" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <strong style={{ color: "#92400e" }}>Проверка конфигурации</strong>
        <span style={{ color: "#92400e", fontSize: 13 }}>{messages.length} сообщений</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, color: "#6b4a0f" }}>
        {messages.map((message) => (
          <li key={message.code} style={{ marginBottom: 8 }}>
            <strong>{message.type === "error" ? "Ошибка" : "Предупреждение"}:</strong> {message.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
