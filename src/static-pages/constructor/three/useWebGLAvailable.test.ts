import assert from "node:assert/strict";
import test from "node:test";
import { detectWebGL } from "./useWebGLAvailable";

function withMockedDom<T>(setup: {
  window?: unknown;
  document?: unknown;
}, run: () => T): T {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalDocument = (globalThis as { document?: unknown }).document;

  if ("window" in setup) {
    (globalThis as { window?: unknown }).window = setup.window;
  } else {
    delete (globalThis as { window?: unknown }).window;
  }

  if ("document" in setup) {
    (globalThis as { document?: unknown }).document = setup.document;
  } else {
    delete (globalThis as { document?: unknown }).document;
  }

  try {
    return run();
  } finally {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
    if (originalDocument === undefined) {
      delete (globalThis as { document?: unknown }).document;
    } else {
      (globalThis as { document?: unknown }).document = originalDocument;
    }
  }
}

test("webgl diagnostics: SSR environment stays safe", () => {
  const diagnostics = withMockedDom({}, () => detectWebGL());
  assert.equal(diagnostics.status, "checking");
  assert.equal(diagnostics.reason, "ssr");
  assert.equal(diagnostics.renderer, null);
});

test("webgl diagnostics: localhost query flag forces fallback mode", () => {
  const diagnostics = withMockedDom(
    {
      window: {
        location: {
          hostname: "localhost",
          search: "?rzm_webgl=off",
        },
        setTimeout,
      },
      document: {
        createElement: () => ({ getContext: () => null }),
      },
    },
    () => detectWebGL(),
  );

  assert.equal(diagnostics.status, "unavailable");
  assert.equal(diagnostics.reason, "e2e-forced-webgl-off");
  assert.equal(diagnostics.renderer, null);
});

test("webgl diagnostics: null contexts activate fallback safely", () => {
  const diagnostics = withMockedDom(
    {
      window: {
        location: {
          hostname: "localhost",
          search: "",
        },
        setTimeout,
      },
      document: {
        createElement: () => ({
          width: 16,
          height: 16,
          getContext: () => null,
        }),
      },
    },
    () => detectWebGL(),
  );

  assert.equal(diagnostics.status, "unavailable");
  assert.equal(diagnostics.reason, "context-null");
  assert.equal(diagnostics.renderer, null);
});

test("webgl diagnostics: probe failures are caught without crash", () => {
  const diagnostics = withMockedDom(
    {
      window: {
        location: {
          hostname: "localhost",
          search: "",
        },
        setTimeout,
      },
      document: {
        createElement: () => {
          throw new Error("probe-failed");
        },
      },
    },
    () => detectWebGL(),
  );

  assert.equal(diagnostics.status, "unavailable");
  assert.equal(diagnostics.renderer, null);
  assert.equal(diagnostics.reason, "probe-failed");
});
