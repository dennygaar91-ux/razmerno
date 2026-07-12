import { expect, test, type Page } from "@playwright/test";

type SubmittedConstructorOrder = {
  orderId?: string;
  productType: "wardrobe" | "dresser" | "nightstand";
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  totalPrice: number;
  customer: { name: string; phone: string; email: string; comment?: string };
  source: string;
};

const fallbackPreview = (page: Page) => page.getByTestId("webgl-fallback-preview");

async function mockWebGLUnavailable(page: Page) {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patchedGetContext(
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(String(contextId))) {
        return null;
      }

      return originalGetContext.apply(this, [contextId, ...args] as Parameters<typeof originalGetContext>);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

async function expectRecoveryControls(page: Page) {
  await expect(page.getByRole("button", { name: /Повторить 3D/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Запустить упрощённое 3D/i })).toBeVisible();
}

async function openConstructor3D(page: Page, options: { forceFallback?: boolean } = {}) {
  if (options.forceFallback) {
    await mockWebGLUnavailable(page);
  }

  await page.goto(options.forceFallback ? "/configurator-3d?rzm_webgl=off" : "/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(page.locator(".rzm-3d-page")).toHaveAttribute("data-checkout-stage", "STAGE15");
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
  expect(page.url()).toContain("/configurator-3d");
  expect(page.url()).not.toContain("/configurator?");
}

async function expectFallbackActive(page: Page) {
  await expect(fallbackPreview(page)).toBeVisible();
  await expect(fallbackPreview(page)).toHaveAttribute("data-webgl-fallback", "active");
  await expect(fallbackPreview(page)).toHaveAttribute("data-webgl-diagnostics-status", "unavailable");
  await expect(page.locator("body")).toContainText("2D fallback активен");
  await expect(page.locator("body")).toContainText("Конфигурацию можно продолжить без 3D");
  await expect(page.locator("body")).not.toContainText(/Application error|Unhandled|blank screen/i);
}

async function proceedToCheckout(page: Page) {
  await page.getByRole("button", { name: /Перейти к наполнению|Далее/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");

  await page.getByRole("button", { name: /Выбрать материалы|Далее/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Материалы");

  await page.getByRole("button", { name: /Перейти к заявке|Далее/i }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
  await expect(page.locator(".rzm-3d-checkout")).toContainText("Контакты");
}

async function fillRequiredContact(page: Page) {
  await page.getByLabel(/Имя/i).fill("P1-10 Fallback");
  await page.getByLabel(/Телефон/i).fill("+7 903 333 33 33");
  await page.getByLabel(/Email/i).fill("p1-10-webgl@example.com");
  await page.getByLabel(/Согласен на обработку персональных данных/i).check();
}

async function interceptOrderSubmit(page: Page) {
  const requests: SubmittedConstructorOrder[] = [];

  await page.route("**/api/orders", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.headers()["content-type"]).toContain("application/json");
    requests.push(request.postDataJSON() as SubmittedConstructorOrder);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orderId: "P1-10-WEBGL-FALLBACK" }),
    });
  });

  return requests;
}

async function attemptSubmitAndExpectControlledAuthBoundary(
  page: Page,
  requests: SubmittedConstructorOrder[],
) {
  await expect(page.getByRole("button", { name: /Отправить заявку/i })).toBeEnabled();
  await page.getByRole("button", { name: /Отправить заявку/i }).click();

  const misconfiguredMessage = page.locator(".rzm-3d-submit-message").filter({
    hasText: /Авторизация недоступна из‑за ошибки конфигурации сервиса/i,
  });
  const authModal = page.getByRole("dialog").filter({
    hasText: /Войдите, чтобы отправить заявку/i,
  });

  await expect(misconfiguredMessage.or(authModal)).toBeVisible();
  expect(requests).toHaveLength(0);
  await expect(page.locator("body")).not.toContainText(/Application error|Unhandled|blank screen/i);
}

test.describe("P1-10 WebGL fallback E2E", () => {
  test("uses the main 3D viewer when WebGL is available", async ({ page }) => {
    await openConstructor3D(page);

    await expect(page.locator(".rzm-three-viewer")).toBeVisible();
    await expect(fallbackPreview(page)).toHaveCount(0);
    await expect(page.locator("body")).toContainText(/3D готово|3D работает|Проверяем 3D/);
  });

  test("renders fallback preview when WebGL context creation is unavailable", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });

    await expectFallbackActive(page);
    await expect(page.locator("svg")).toBeVisible();
  });

  test("keeps constructor steps usable in fallback mode", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);

    await page.getByRole("button", { name: /Перейти к наполнению|Далее/i }).click();
    await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");
    await expectFallbackActive(page);

    await page.getByRole("button", { name: /Выбрать материалы|Далее/i }).click();
    await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Материалы");
    await expectFallbackActive(page);
  });

  test("keeps fallback preview stable after size changes", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);

    await page.getByRole("button", { name: /Увеличить ширина/i }).click();
    await expectFallbackActive(page);
    await expect(page.locator("body")).toContainText(/1\s?850 мм|1850 мм/);
  });

  test("allows checkout path and submit flow in fallback mode", async ({ page }) => {
    const requests = await interceptOrderSubmit(page);

    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);
    await proceedToCheckout(page);
    await expectFallbackActive(page);
    await fillRequiredContact(page);

    await attemptSubmitAndExpectControlledAuthBoundary(page, requests);
    await expectFallbackActive(page);
  });
});

test.describe("M8-P0-03 WebGL fallback and recovery E2E", () => {
  test("forced WebGL-off opens full 2D fallback with diagnostics marker", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });

    await expectFallbackActive(page);
    await expect(fallbackPreview(page)).toHaveAttribute("data-webgl-diagnostics-reason", "e2e-forced-webgl-off");
    await expect(page.locator("svg")).toBeVisible();
    await expect(page.locator(".rzm-three-viewer")).toHaveCount(0);
  });

  test("fallback exposes retry and reduced 3D recovery controls", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);
    await expectRecoveryControls(page);
  });

  test("retry controls keep fallback active when WebGL remains unavailable", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);

    await page.getByRole("button", { name: /Повторить 3D/i }).click();
    await expectFallbackActive(page);
    await expect(page.locator(".rzm-three-viewer")).toHaveCount(0);

    await page.getByRole("button", { name: /Запустить упрощённое 3D/i }).click();
    await expectFallbackActive(page);
    await expect(page.locator(".rzm-three-viewer")).toHaveCount(0);
    await expectRecoveryControls(page);
  });

  test("constructor flow progression remains available from fallback mode", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);

    await page.getByRole("button", { name: /Перейти к наполнению|Далее/i }).click();
    await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");
    await expectFallbackActive(page);
    await expectRecoveryControls(page);
  });

  test("checkout path stays reachable after using fallback recovery controls", async ({ page }) => {
    const requests = await interceptOrderSubmit(page);

    await openConstructor3D(page, { forceFallback: true });
    await expectFallbackActive(page);
    await expectRecoveryControls(page);

    await page.getByRole("button", { name: /Повторить 3D/i }).click();
    await page.getByRole("button", { name: /Запустить упрощённое 3D/i }).click();
    await expectFallbackActive(page);

    await proceedToCheckout(page);
    await expectFallbackActive(page);
    await fillRequiredContact(page);

    await attemptSubmitAndExpectControlledAuthBoundary(page, requests);
    await expectFallbackActive(page);
    await expectRecoveryControls(page);
  });
});
