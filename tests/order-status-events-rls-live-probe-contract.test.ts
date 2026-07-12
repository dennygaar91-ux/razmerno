import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  ARTIFACT_JSON,
  buildOrderStatusEventsRlsProbeUrl,
  classifyAnonRlsProbeResult,
  classifyServiceRoleRlsProbeResult,
  deriveRlsLiveProbeVerificationStatus,
  probeOrderStatusEventsRlsLive,
  writeOrderStatusEventsRlsLiveProbeArtifacts,
} from "../scripts/verify-order-status-events-rls-live.mjs";

function test(name: string, run: () => void | Promise<void>) {
  return (async () => {
    await run();
    console.log(`ok - ${name}`);
  })();
}

const tests: Array<Promise<void>> = [];

function enqueue(name: string, run: () => void | Promise<void>) {
  tests.push(test(name, run));
}

enqueue("order status events RLS live probe normalizes SUPABASE_URL with /rest/v1 suffix", () => {
  const url = buildOrderStatusEventsRlsProbeUrl("https://example.supabase.co/rest/v1/");
  assert.equal(url, "https://example.supabase.co/rest/v1/order_status_events?select=id&limit=1");
  assert.doesNotMatch(url || "", /\/rest\/v1\/rest\/v1/);
});

enqueue("order status events RLS live probe classifies anon [] and service 200 as PASS", () => {
  const anon = classifyAnonRlsProbeResult(200, "[]");
  const service = classifyServiceRoleRlsProbeResult(200);
  assert.equal(deriveRlsLiveProbeVerificationStatus(anon, service), "PASS");
});

enqueue("order status events RLS live probe classifies anon denied and service 200 as PASS", () => {
  const anon = classifyAnonRlsProbeResult(401, "");
  const service = classifyServiceRoleRlsProbeResult(200);
  assert.equal(deriveRlsLiveProbeVerificationStatus(anon, service), "PASS");
});

enqueue("order status events RLS live probe classifies anon rows as FAIL", () => {
  const anon = classifyAnonRlsProbeResult(200, '[{"id":1}]');
  const service = classifyServiceRoleRlsProbeResult(200);
  assert.equal(deriveRlsLiveProbeVerificationStatus(anon, service), "PARTIAL");
  assert.equal(anon.rlsPass, false);
});

enqueue("order status events RLS live probe classifies service denied as FAIL", () => {
  const anon = classifyAnonRlsProbeResult(200, "[]");
  const service = classifyServiceRoleRlsProbeResult(403);
  assert.equal(deriveRlsLiveProbeVerificationStatus(anon, service), "PARTIAL");
  assert.equal(service.servicePass, false);
});

enqueue("order status events RLS live probe fails on missing env without printing secrets", async () => {
  const previous = { ...process.env };
  process.env.SUPABASE_URL = "https://example.supabase.co";
  delete process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-key";

  const result = await probeOrderStatusEventsRlsLive({
    env: process.env,
    fetch: async () => new Response("[]", { status: 200 }),
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /SUPABASE_ANON_KEY/);
  assert.doesNotMatch(JSON.stringify(result), /secret-service-key/);

  process.env = previous;
});

enqueue("order status events RLS live probe uses mocked fetch and writes artifacts only under artifacts/live", async () => {
  const previous = { ...process.env };
  process.env.SUPABASE_URL = "https://example.supabase.co/rest/v1";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

  const calls: string[] = [];
  const result = await probeOrderStatusEventsRlsLive({
    env: process.env,
    fetch: async (url, init) => {
      calls.push(String(url));
      const auth = String(init?.headers?.Authorization || "");
      if (auth.includes("anon-key")) return new Response("[]", { status: 200 });
      return new Response('[{"id":1}]', { status: 200 });
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.verificationStatus, "PASS");
  assert.equal(result.readOnlyProbe, true);
  assert.equal(result.liveMutationPerformed, false);
  assert.equal(calls.length, 2);
  assert.equal(calls[0], "https://example.supabase.co/rest/v1/order_status_events?select=id&limit=1");
  assert.equal(calls[0], calls[1]);

  const paths = writeOrderStatusEventsRlsLiveProbeArtifacts({
    generatedAt: new Date().toISOString(),
    ...result,
  });
  assert.equal(existsSync(paths.jsonPath), true);
  assert.equal(existsSync(paths.mdPath), true);
  const json = readFileSync(paths.jsonPath, "utf8");
  assert.doesNotMatch(json, /anon-key|service-key/);
  assert.match(json, /liveMutationPerformed": false/);

  process.env = previous;
});

const SOURCE = readFileSync("scripts/verify-order-status-events-rls-live.mjs", "utf8");

enqueue("order status events RLS live probe script is read-only", () => {
  assert.match(SOURCE, /readOnlyProbe:\s*true/);
  assert.match(SOURCE, /liveMutationPerformed:\s*false/);
  assert.doesNotMatch(SOURCE, /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b/);
  assert.match(SOURCE, /\/rest\/v1\/order_status_events/);
});

await Promise.all(tests);
console.log(`\n${tests.length} passed`);
