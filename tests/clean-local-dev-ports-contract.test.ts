import assert from "node:assert/strict";
import {
  ALLOWED_PROCESS_NAMES,
  DEFAULT_DEV_PORTS,
  buildPortScanRows,
  isAllowedProcessName,
  parseNetstatRows,
  parsePortCleanArgs,
  planPortCleanup,
  summarizePortScan,
} from "../scripts/clean-local-dev-ports.mjs";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("port hygiene defaults to dry-run and default dev ports", () => {
  const args = parsePortCleanArgs([]);
  assert.equal(args.apply, false);
  assert.deepEqual(args.ports, DEFAULT_DEV_PORTS);
});

test("port hygiene supports explicit apply mode and custom port", () => {
  const args = parsePortCleanArgs(["--apply", "--port", "3010"]);
  assert.equal(args.apply, true);
  assert.deepEqual(args.ports, [3010]);
});

test("port hygiene only allows known dev runtime process names", () => {
  assert.equal(isAllowedProcessName("node.exe"), true);
  assert.equal(isAllowedProcessName("vercel"), true);
  assert.equal(isAllowedProcessName("chrome.exe"), false);
  assert.equal(isAllowedProcessName("explorer.exe"), false);
  for (const name of ALLOWED_PROCESS_NAMES) {
    assert.equal(isAllowedProcessName(name), true);
  }
});

test("port hygiene parses netstat rows for target ports only", () => {
  const output = `
  TCP    127.0.0.1:3004         0.0.0.0:0              LISTENING       1234
  TCP    127.0.0.1:3010         0.0.0.0:0              LISTENING       5678
  TCP    127.0.0.1:9999         0.0.0.0:0              LISTENING       7777
  `;
  const listeners = parseNetstatRows(output, [3004, 3010]);
  assert.equal(listeners.length, 2);
  assert.deepEqual(listeners[0], { port: 3004, pid: 1234 });
});

test("port hygiene plans kill only for allowed occupied processes in apply mode", () => {
  const rows = buildPortScanRows({
    ports: [3004, 3005],
    listeners: [
      { port: 3004, pid: 11 },
      { port: 3005, pid: 22 },
    ],
    resolveProcessName: (pid) => (pid === 11 ? "node.exe" : "chrome.exe"),
  });

  const dryRun = planPortCleanup(rows, false);
  const apply = planPortCleanup(rows, true);
  const summary = summarizePortScan(dryRun);

  assert.equal(dryRun.find((row) => row.port === 3004)?.action, "would-kill");
  assert.equal(dryRun.find((row) => row.port === 3005)?.action, "skip");
  assert.equal(apply.find((row) => row.port === 3004)?.action, "kill");
  assert.equal(summary.allowedTargetCount, 1);
  assert.equal(summary.skippedCount, 1);
});

console.log("\n6 passed");
