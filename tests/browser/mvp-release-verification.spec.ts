import { expect, test, type Page } from "@playwright/test";
import type { OrderRequest } from "../../api/_shared/order-types.js";
import { buildProductionExportFromPayload } from "../../src/constructor/production/orderExportPackage.js";

type SubmittedConstructorOrder = OrderRequest;

const BODY_MATERIAL_ID = "ldsp-egger-u780-seryy-monumentalnyy-st9";
const FACADE_MATERIAL_ID = "mdf-egger-r010-seryy-grafitovyy-ms";
const WIDTH_INPUT = 'input[aria-label="Ширина: значение в миллиметрах"]';
const HEIGHT_INPUT = 'input[aria-label="Высота: значение в миллиметрах"]';
const DEPTH_INPUT = 'input[aria-label="Глубина: значение в миллиметрах"]';

async function openConstructor3D(page: Page, query = "") {
  await page.goto(`/configurator-3d${query}`);
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(page.locator(".rzm-3d-page")).toHaveAttribute("data-checkout-stage", "STAGE15");
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
}

async function forceWebGlOff(page: Page) {
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

async function goToFillStep(page: Page) {
  await page.getByRole("button", { name: "Перейти к наполнению" }).click();
  await expect(page.locator(".rzm-3d-zone-list")).toBeVisible();
}

async function goToMaterialsStep(page: Page) {
  await page.getByRole("button", { name: "Выбрать материалы" }).click();
  await expect(page.getByTestId("materials-step-panel")).toBeVisible();
}

async function goToCheckout(page: Page) {
  await page.getByRole("button", { name: "Перейти к заявке" }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
  await expect(page.locator(".rzm-3d-price-status")).toHaveClass(/is-ready/);
}

async function fillContact(page: Page, contact: { name: string; phone: string; email: string }) {
  const contactInputs = page.locator(".rzm-3d-checkout-card").first().locator("input");
  await contactInputs.nth(0).fill(contact.name);
  await contactInputs.nth(1).fill(contact.phone);
  await contactInputs.nth(2).fill(contact.email);
  await page.locator(".rzm-3d-consent input[type='checkbox']").check();
}

async function interceptOrderSubmit(page: Page, orderId: string) {
  const requests: SubmittedConstructorOrder[] = [];

  await page.route("**/api/orders", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.headers()["content-type"]).toContain("application/json");
    requests.push(request.postDataJSON() as SubmittedConstructorOrder);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orderId }),
    });
  });

  return requests;
}

function assertProductionExportAvailableFromPayload(payload: SubmittedConstructorOrder, label: string) {
  const pack = buildProductionExportFromPayload(payload);

  expect(pack.schema, `${label}: export schema`).toBe("razmerno.production-export.v1");
  expect(pack.productionModel.schema, `${label}: production model schema`).toBe("razmerno.production-model.v3");
  expect(pack.productionModel.panels.length, `${label}: panels`).toBeGreaterThan(0);
  expect(pack.productionModel.edgeBanding.length, `${label}: edge banding`).toBeGreaterThan(0);
  expect(pack.basis.status, `${label}: basis status`).toBe("manual-json-ready");
  expect(pack.basis.plan.length, `${label}: basis plan`).toBeGreaterThan(0);
}

test.describe("MVP local release verification", () => {
  test("customer flow keeps local draft, restores it, submits checkout and yields production export from payload", async ({
    page,
  }) => {
    const requests = await interceptOrderSubmit(page, "MVP-RELEASE-001");

    await openConstructor3D(page);

    await page.getByRole("button", { name: "Увеличить ширина" }).click();
    await page.getByRole("button", { name: "Увеличить ширина" }).click();
    await page.getByRole("button", { name: "Увеличить высота" }).click();
    await page.getByRole("button", { name: "Увеличить глубина" }).click();
    const savedWidth = Number(await page.locator(WIDTH_INPUT).inputValue());
    const savedHeight = Number(await page.locator(HEIGHT_INPUT).inputValue());
    const savedDepth = Number(await page.locator(DEPTH_INPUT).inputValue());

    await goToFillStep(page);
    await page.getByRole("button", { name: "Выбрать секцию 1" }).click();
    await expect(page.locator(".rzm-3d-zone-list")).toBeVisible();
    await page.getByRole("button", { name: "Рандомно" }).click();
    await page.getByRole("button", { name: "Без ручек" }).click();

    await goToMaterialsStep(page);
    await page.getByRole("button", { name: "MDF" }).click();
    await page.getByTestId("material-picker-body").getByTestId(`material-swatch-${BODY_MATERIAL_ID}`).click();
    await page.getByTestId("material-picker-facade").getByTestId(`material-swatch-${FACADE_MATERIAL_ID}`).click();
    await expect(page.getByTestId("material-selection-summary")).toHaveAttribute("data-selected-material", BODY_MATERIAL_ID);
    await expect(page.getByTestId("material-selection-summary")).toHaveAttribute(
      "data-selected-facade-material",
      FACADE_MATERIAL_ID,
    );

    await page.getByRole("button", { name: "Сохранить проект" }).click();
    await expect(page.getByRole("button", { name: "Восстановить проект" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Очистить черновик" })).toBeEnabled();
    await expect(requests).toHaveLength(0);

    await page.reload();
    await expect(page.getByRole("button", { name: "Восстановить проект" })).toBeEnabled();
    await page.getByRole("button", { name: "Восстановить проект" }).click();
    await expect(page.locator(WIDTH_INPUT)).toHaveValue(String(savedWidth));
    await expect(page.locator(HEIGHT_INPUT)).toHaveValue(String(savedHeight));
    await expect(page.locator(DEPTH_INPUT)).toHaveValue(String(savedDepth));
    await expect(requests).toHaveLength(0);

    await page.getByRole("button", { name: /Открыть шаг 2: Наполнение/i }).click();
    await expect(page.getByRole("button", { name: "Без ручек" })).toHaveClass(/is-active/);

    await page.getByRole("button", { name: /Открыть шаг 3: Материалы/i }).click();
    await expect(page.getByTestId("material-selection-summary")).toHaveAttribute("data-selected-material", BODY_MATERIAL_ID);
    await expect(page.getByTestId("material-selection-summary")).toHaveAttribute(
      "data-selected-facade-material",
      FACADE_MATERIAL_ID,
    );

    await goToCheckout(page);
    await fillContact(page, {
      name: "MVP Release",
      phone: "+7 904 555 55 55",
      email: "mvp-release@example.com",
    });
    await expect(requests).toHaveLength(0);

    await page.getByRole("button", { name: "Отправить заявку" }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/MVP-RELEASE-001|РѕС‚РїСЂР°РІР»РµРЅР°/i);

    await expect(requests).toHaveLength(1);
    expect(requests[0].dimensions).toEqual({ width: savedWidth, height: savedHeight, depth: savedDepth });
    expect(requests[0].materials.bodyId).toBe(BODY_MATERIAL_ID);
    expect(requests[0].materials.facadeId).toBe(FACADE_MATERIAL_ID);
    expect(requests[0].style.facadeStyleId).toBe("no-handle");
    expect(requests[0].source).toBe("constructor-store-adapter");
    expect(requests[0].customer.email).toBe("mvp-release@example.com");
    expect(requests[0].totalPrice).toBeGreaterThan(0);
    assertProductionExportAvailableFromPayload(requests[0], "happy-path release chain");

    await page.getByRole("button", { name: "Очистить черновик" }).click();
    await expect(page.getByRole("button", { name: "Восстановить проект" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Очистить черновик" })).toBeDisabled();
  });

  test("WebGL fallback keeps MVP checkout path available without real providers", async ({ page }) => {
    const requests = await interceptOrderSubmit(page, "MVP-RELEASE-FALLBACK-001");

    await forceWebGlOff(page);
    await openConstructor3D(page, "?rzm_webgl=off");

    const fallbackPreview = page.getByTestId("webgl-fallback-preview");
    await expect(fallbackPreview).toBeVisible();
    await expect(fallbackPreview).toHaveAttribute("data-webgl-fallback", "active");
    await expect(fallbackPreview).toHaveAttribute("data-webgl-diagnostics-status", "unavailable");

    await goToFillStep(page);
    await goToMaterialsStep(page);
    await goToCheckout(page);
    await fillContact(page, {
      name: "MVP Fallback",
      phone: "+7 903 333 33 33",
      email: "mvp-fallback@example.com",
    });
    await expect(requests).toHaveLength(0);

    await page.getByRole("button", { name: "Отправить заявку" }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/MVP-RELEASE-FALLBACK-001|РѕС‚РїСЂР°РІР»РµРЅР°/i);

    await expect(requests).toHaveLength(1);
    expect(requests[0].source).toBe("constructor-store-adapter");
    expect(requests[0].customer.email).toBe("mvp-fallback@example.com");
    expect(requests[0].totalPrice).toBeGreaterThan(0);
    assertProductionExportAvailableFromPayload(requests[0], "fallback release chain");
  });
});
