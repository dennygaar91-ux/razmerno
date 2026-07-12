type LogLevel = "info" | "warn" | "error";

type Primitive = string | number | boolean | null | undefined;
type LogValue = Primitive | LogValue[] | { [key: string]: LogValue };
type LogPayload = Record<string, LogValue>;

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

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const RU_PHONE_PATTERN = /(?:\+?7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}/g;
const STREET_ADDRESS_PATTERN =
  /(?:ул\.?|улица|проспект|пр-т|дом|д\.?|квартира|кв\.?)\s*[^,;\n]{1,80}/gi;
const REGION_ADDRESS_PATTERN =
  /(?:Москва|Московская область)\s*,\s*[^;\n]{1,120}/gi;

function truncate(value: string): string {
  return value.length > 500 ? `${value.slice(0, 500)}...` : value;
}

function redactText(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(RU_PHONE_PATTERN, "[redacted-phone]")
    .replace(REGION_ADDRESS_PATTERN, "[redacted-address]")
    .replace(STREET_ADDRESS_PATTERN, "[redacted-address]");
}

function redactValue(key: string, value: LogValue): LogValue {
  const lower = key.toLowerCase();
  if (BLOCKED_KEYS.some((item) => lower.includes(item))) return "[redacted]";

  if (typeof value === "string") return truncate(redactText(value));
  if (Array.isArray(value)) return value.map((item) => redactValue(key, item));
  if (value && typeof value === "object") return sanitize(value as Record<string, LogValue>);

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
  const message = error instanceof Error ? error.message : String(error);
  return truncate(redactText(message));
}
