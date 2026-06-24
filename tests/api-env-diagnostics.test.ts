import assert from "node:assert/strict";
import test from "node:test";
import { getRuntimeName, getServerEnvReport } from "../api/_shared/env.js";

const REQUIRED_ENV = [
  "ALLOWED_ORIGINS",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "ORDER_MANAGER_EMAIL",
  "MAIL_FROM",
  "ADMIN_API_KEY",
] as const;

const OPTIONAL_ENV = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"] as const;

function buildDiagnosticsContractPayload() {
  const env = getServerEnvReport();
  return {
    ok: env.ok,
    service: "razmerno-api",
    runtime: env.runtime,
    node: process.version,
    env: {
      ok: env.ok,
      missing: env.missing,
      checks: env.checks.map((item) => ({
        name: item.name,
        required: item.required,
        present: item.present,
      })),
    },
    features: {
      orders: true,
      admin: true,
      statusAudit: true,
      metrika: Boolean(process.env.VITE_YANDEX_METRIKA_ID),
      rateLimitExternal: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    },
  };
}

function snapshotEnv(): Record<string, string | undefined> {
  return Object.fromEntries([...REQUIRED_ENV, ...OPTIONAL_ENV].map((name) => [name, process.env[name]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const name of [...REQUIRED_ENV, ...OPTIONAL_ENV]) {
    const value = snapshot[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

test("env report: all required missing yields ok=false and full missing list", () => {
  const saved = snapshotEnv();
  try {
    for (const name of REQUIRED_ENV) delete process.env[name];
    const report = getServerEnvReport();
    assert.equal(report.ok, false);
    assert.deepEqual(report.missing, [...REQUIRED_ENV]);
    assert.equal(report.checks.filter((item) => item.required && !item.present).length, REQUIRED_ENV.length);
  } finally {
    restoreEnv(saved);
  }
});

test("env report: partial configuration lists only missing required keys", () => {
  const saved = snapshotEnv();
  try {
    for (const name of REQUIRED_ENV) delete process.env[name];
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.MAIL_FROM = "orders@example.com";
    const report = getServerEnvReport();
    assert.equal(report.ok, false);
    assert.ok(report.missing.includes("SUPABASE_SERVICE_ROLE_KEY"));
    assert.ok(report.missing.includes("ADMIN_API_KEY"));
    assert.ok(!report.missing.includes("SUPABASE_URL"));
    assert.ok(!report.missing.includes("MAIL_FROM"));
  } finally {
    restoreEnv(saved);
  }
});

test("env report: fully configured required env yields ok=true", () => {
  const saved = snapshotEnv();
  try {
    process.env.ALLOWED_ORIGINS = "https://example.com";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.RESEND_API_KEY = "resend-key";
    process.env.ORDER_MANAGER_EMAIL = "manager@example.com";
    process.env.MAIL_FROM = "orders@example.com";
    process.env.ADMIN_API_KEY = "admin-api-key-012345678901234567890";
    const report = getServerEnvReport();
    assert.equal(report.ok, true);
    assert.deepEqual(report.missing, []);
  } finally {
    restoreEnv(saved);
  }
});

test("env report: safe values never expose secrets", () => {
  const saved = snapshotEnv();
  try {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "super-secret-key";
    process.env.RESEND_API_KEY = "re_secret";
    process.env.ORDER_MANAGER_EMAIL = "manager@example.com";
    const report = getServerEnvReport();
    const secretChecks = report.checks.filter((item) =>
      ["SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "ORDER_MANAGER_EMAIL"].includes(item.name),
    );
    for (const item of secretChecks) {
      assert.equal(item.safeValue, "[set]");
      assert.ok(!String(item.safeValue).includes("secret"));
      assert.ok(!String(item.safeValue).includes("@"));
    }
  } finally {
    restoreEnv(saved);
  }
});

test("diagnostics contract: payload shape and readiness flags", () => {
  const payload = buildDiagnosticsContractPayload();
  assert.equal(payload.service, "razmerno-api");
  assert.equal(typeof payload.ok, "boolean");
  assert.equal(typeof payload.runtime, "string");
  assert.ok(payload.runtime.length > 0);
  assert.equal(typeof payload.node, "string");
  assert.equal(typeof payload.env.ok, "boolean");
  assert.ok(Array.isArray(payload.env.missing));
  assert.ok(Array.isArray(payload.env.checks));
  assert.equal(payload.features.orders, true);
  assert.equal(payload.features.admin, true);
  assert.equal(payload.features.statusAudit, true);
  assert.equal(typeof payload.features.metrika, "boolean");
  assert.equal(typeof payload.features.rateLimitExternal, "boolean");
  assert.equal(payload.env.ok, payload.ok);
});

test("diagnostics contract: serialized payload contains no raw secret env values", () => {
  const saved = snapshotEnv();
  try {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "raw-secret-value";
    process.env.RESEND_API_KEY = "re_live_secret";
    const serialized = JSON.stringify(buildDiagnosticsContractPayload());
    assert.ok(!serialized.includes("raw-secret-value"));
    assert.ok(!serialized.includes("re_live_secret"));
    assert.ok(!serialized.includes("safeValue"));
  } finally {
    restoreEnv(saved);
  }
});

test("runtime name contract: getRuntimeName returns non-empty string", () => {
  const runtime = getRuntimeName();
  assert.ok(typeof runtime === "string" && runtime.length > 0);
});
