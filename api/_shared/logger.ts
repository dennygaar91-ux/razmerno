type LogLevel = "info" | "warn" | "error";

type Primitive = string | number | boolean | null | undefined;
type LogPayload = Record<string, Primitive>;

const BLOCKED_KEYS = [
  "name",
  "phone",
  "email",
  "address",
  "comment",
  "customer",
  "customer_email",
  "customer_phone",
  "delivery_address",
  "token",
  "key",
  "secret",
  "authorization",
];

function redactValue(key: string, value: Primitive): Primitive {
  const lower = key.toLowerCase();
  if (BLOCKED_KEYS.some((item) => lower.includes(item))) return "[redacted]";
  if (typeof value === "string" && value.length > 500) return `${value.slice(0, 500)}...`;
  return value;
}

function sanitize(payload: LogPayload = {}): LogPayload {
  const safe: LogPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    safe[key] = redactValue(key, value);
  }

  return safe;
}

function normalizeEvent(event: string): string {
  return event
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "_")
    .slice(0, 120) || "unknown";
}

export function logEvent(level: LogLevel, event: string, payload: LogPayload = {}) {
  const record = {
    level,
    event: normalizeEvent(event),
    ts: new Date().toISOString(),
    service: "razmerno-api",
    ...sanitize(payload),
  };

  const line = JSON.stringify(record);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return String(error).slice(0, 500);
}
