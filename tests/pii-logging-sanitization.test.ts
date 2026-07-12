import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { logEvent, safeErrorMessage } from "../api/_shared/logger";

type AsyncTest = () => void | Promise<void>;
type CapturedConsole = {
  errors: string[];
  infos: string[];
  warns: string[];
  restore: () => void;
};

const SAFE_EMAIL = "reserved.user@example.com";
const SAFE_PHONE = "+7 (000) 000-00-00";
const SAFE_ADDRESS = "Москва, ул. Тестовая, д. 1";
const SAFE_REQUEST_ID = "req-m8-p1-03";
const SAFE_ORDER_ID = "RZ-20260619-1234";

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

function captureConsole(): CapturedConsole {
  const originalError = console.error;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const errors: string[] = [];
  const infos: string[] = [];
  const warns: string[] = [];

  console.error = ((...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  }) as typeof console.error;

  console.info = ((...args: unknown[]) => {
    infos.push(args.map(String).join(" "));
  }) as typeof console.info;

  console.warn = ((...args: unknown[]) => {
    warns.push(args.map(String).join(" "));
  }) as typeof console.warn;

  return {
    errors,
    infos,
    warns,
    restore() {
      console.error = originalError;
      console.info = originalInfo;
      console.warn = originalWarn;
    },
  };
}

function parseSingleLogLine(lines: string[]) {
  assert.equal(lines.length, 1, `Expected exactly one log line, got ${lines.length}`);
  return JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
}

function assertNoRawPii(value: string) {
  assert.doesNotMatch(value, new RegExp(SAFE_EMAIL.replace(".", "\\."), "i"));
  assert.doesNotMatch(value, /\+7 \(000\) 000-00-00/);
  assert.doesNotMatch(value, /Москва, ул\. Тестовая, д\. 1/i);
}

test("logger redacts PII content inside strings", () => {
  const captured = captureConsole();

  try {
    logEvent("info", "pii.logging.audit", {
      message: `Contact ${SAFE_EMAIL}, ${SAFE_PHONE}, ${SAFE_ADDRESS}`,
    });

    const record = parseSingleLogLine(captured.infos);
    const line = JSON.stringify(record);

    assert.equal(record.event, "pii.logging.audit");
    assert.match(String(record.message), /\[redacted-email\]/);
    assert.match(String(record.message), /\[redacted-phone\]/);
    assert.match(String(record.message), /\[redacted-address\]/);
    assertNoRawPii(line);
  } finally {
    captured.restore();
  }
});

test("logger redacts sensitive keys and nested payload values", () => {
  const captured = captureConsole();

  try {
    logEvent("warn", "pii.logging.keys", {
      name: "Reserved User",
      phone: SAFE_PHONE,
      email: SAFE_EMAIL,
      address: SAFE_ADDRESS,
      comment: `comment ${SAFE_EMAIL}`,
      customer: {
        contact: `${SAFE_EMAIL} ${SAFE_PHONE}`,
      },
      delivery_address: SAFE_ADDRESS,
      meta: {
        note: `nested ${SAFE_EMAIL} ${SAFE_PHONE} ${SAFE_ADDRESS}`,
        list: [`item ${SAFE_EMAIL}`, SAFE_PHONE, SAFE_ADDRESS],
      },
      requestId: SAFE_REQUEST_ID,
      orderId: SAFE_ORDER_ID,
    });

    const record = parseSingleLogLine(captured.warns);
    const line = JSON.stringify(record);

    assert.equal(record.name, "[redacted]");
    assert.equal(record.phone, "[redacted]");
    assert.equal(record.email, "[redacted]");
    assert.equal(record.address, "[redacted]");
    assert.equal(record.comment, "[redacted]");
    assert.equal(record.customer, "[redacted]");
    assert.equal(record.delivery_address, "[redacted]");
    assert.equal(record.requestId, SAFE_REQUEST_ID);
    assert.equal(record.orderId, SAFE_ORDER_ID);
    assert.match(line, /\[redacted-email\]/);
    assert.match(line, /\[redacted-phone\]/);
    assert.match(line, /\[redacted-address\]/);
    assertNoRawPii(line);
  } finally {
    captured.restore();
  }
});

test("safeErrorMessage redacts email, phone and address fragments", () => {
  const safeMessage = safeErrorMessage(
    new Error(`submit failed for ${SAFE_EMAIL}, ${SAFE_PHONE}, ${SAFE_ADDRESS}`),
  );

  assert.match(safeMessage, /\[redacted-email\]/);
  assert.match(safeMessage, /\[redacted-phone\]/);
  assert.match(safeMessage, /\[redacted-address\]/);
  assertNoRawPii(safeMessage);
});

test("orders API generic catch uses safe generic message and safe logging", () => {
  const source = readFileSync("api/orders.ts", "utf8");

  assert.match(source, /const GENERIC_ORDER_SUBMIT_FAILED\s*=/);
  assert.match(
    source,
    /logEvent\('error', 'orders\.submit_failed', \{ reason: safeErrorMessage\(error\) \}\)/,
  );
  assert.match(source, /message:\s*GENERIC_ORDER_SUBMIT_FAILED/);
  assert.doesNotMatch(source, /message:\s*safeErrorMessage\(error\)/);
  assert.doesNotMatch(source, /message:\s*error instanceof Error \? error\.message/);
});

test("frontend analytics uses stable submit error markers instead of raw exception text", () => {
  const source = readFileSync("src/shared/lib/order.ts", "utf8");
  const analyticsBlockMatch = source.match(
    /trackEvent\("order_submit_error",\s*\{[\s\S]*?\}\);/,
  );

  assert.match(source, /const ORDER_SUBMIT_ERROR_EVENT = "order_submit_failed"/);
  assert.match(source, /const GENERIC_SUBMIT_FAILURE_REASON = "generic_submit_failure"/);
  assert.ok(analyticsBlockMatch, "Expected order_submit_error analytics block");

  const analyticsBlock = analyticsBlockMatch?.[0] ?? "";
  assert.match(analyticsBlock, /error:\s*ORDER_SUBMIT_ERROR_EVENT/);
  assert.match(analyticsBlock, /reason:\s*GENERIC_SUBMIT_FAILURE_REASON/);
  assert.doesNotMatch(analyticsBlock, /String\(e\)/);
  assert.doesNotMatch(analyticsBlock, /e\.message/);
});

const PII_SAFE_API_SOURCES = [
  "api/orders.ts",
  "api/operations/order-decision.ts",
  "api/operations/payment-confirmation.ts",
  "api/operations/order-completion.ts",
  "api/customer/notifications.ts",
  "api/customer/change-request.ts",
  "api/profile.ts",
] as const;

test("PII contract: key API handlers avoid logging customer identity fields in logEvent payloads", () => {
  for (const file of PII_SAFE_API_SOURCES) {
    const source = readFileSync(file, "utf8");
    const logBlocks = source.match(/logEvent\([^)]+\{[\s\S]*?\}\)/g) ?? [];
    for (const block of logBlocks) {
      const payload = block.slice(block.indexOf("{"));
      assert.doesNotMatch(payload, /customer_name|customer_phone|customer_email|delivery_address/);
      assert.doesNotMatch(payload, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY|process\.env\./);
    }
  }
});

test("PII contract: idempotency conflict and email failure paths use safe logging", () => {
  const orders = readFileSync("api/orders.ts", "utf8");
  assert.match(orders, /logEvent\('warn', 'orders\.customer_email_failed'/);
  assert.match(orders, /reason: safeErrorMessage/);
  assert.doesNotMatch(orders, /logEvent\([^)]*\{[^}]*customer_email\s*:/);
});

test("PII contract: logger blocks secret-like keys from structured output", () => {
  const captured = captureConsole();
  try {
    logEvent("warn", "pii.logging.secrets", {
      token: "secret-token-value",
      key: "api-key-value",
      secret: "hidden-secret",
      authorization: "Bearer abc.def.ghi",
      requestId: SAFE_REQUEST_ID,
    });
    const record = parseSingleLogLine(captured.warns);
    const line = JSON.stringify(record);
    assert.equal(record.token, "[redacted]");
    assert.equal(record.key, "[redacted]");
    assert.equal(record.secret, "[redacted]");
    assert.equal(record.authorization, "[redacted]");
    assert.equal(record.requestId, SAFE_REQUEST_ID);
    assert.doesNotMatch(line, /secret-token-value|api-key-value|hidden-secret|abc\.def\.ghi/);
  } finally {
    captured.restore();
  }
});

for (const item of tests) {
  await item.run();
  console.log(`OK ${item.name}`);
}

console.log(`${tests.length} pii/logging sanitization tests passed.`);
