import { expect, test, type Page } from "@playwright/test";

type SubmittedConstructorOrder = {
  materials?: {
    bodyId?: string;
    facadeId?: string;
    facadeKind?: string;
    backPanelId?: string;
  };
  totalPrice: number;
  customer: { name: string; phone: string; email: string };
  source: string;
};

const BODY_MATERIAL_A = "ldsp-egger-h1910-buk-lugovoy-st9";
const BODY_MATERIAL_B = "ldsp-egger-u780-seryy-monumentalnyy-st9";

const viewport = (page: Page) => page.getByTestId("constructor-3d-viewport");
const threePreview = (page: Page) => page.getByTestId("constructor-3d-preview");
const fallbackPreview = (page: Page) => page.getByTestId("webgl-fallback-preview");
const fallbackSvgPreview = (page: Page) => fallbackPreview(page).locator("[data-material]").first();

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

async function openConstructor3D(page: Page, options: { forceFallback?: boolean } = {}) {
  if (options.forceFallback) {
    await mockWebGLUnavailable(page);
  }

  await page.goto(options.forceFallback ? "/configurator-3d?rzm_webgl=off" : "/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(viewport(page)).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/configurator-3d");
}

async function goToMaterialsStep(page: Page) {
  await page.getByRole("button", { name: /Перейти к наполнению|Далее/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");

  await page.getByRole("button", { name: /Выбрать материалы|Далее/i }).click();
  await expect(page.getByTestId("materials-step-panel")).toBeVisible();
}

async function selectBodyMaterial(page: Page, materialId: string) {
  const bodyPicker = page.getByTestId("material-picker-body");
  await bodyPicker.getByTestId(`material-swatch-${materialId}`).click();
  await expect(bodyPicker).toHaveAttribute("data-selected-material", materialId);
  await expect(page.getByTestId("materials-step-panel")).toHaveAttribute("data-selected-material", materialId);
}

async function fillRequiredContact(page: Page) {
  await page.getByLabel(/Имя/i).fill("P1-13 Material");
  await page.getByLabel(/Телефон/i).fill("+7 903 444 44 44");
  await page.getByLabel(/Email/i).fill("p1-13-material@example.com");
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
      body: JSON.stringify({ ok: true, orderId: "P1-13-MATERIAL-PARITY" }),
    });
  });

  return requests;
}

test.describe("P1-13 Material / Texture parity", () => {
  test("keeps UI material selection and 3D preview material marker in parity", async ({ page }) => {
    await openConstructor3D(page);
    await expect(threePreview(page)).toBeVisible();
    await goToMaterialsStep(page);

    await selectBodyMaterial(page, BODY_MATERIAL_A);
    await expect(threePreview(page)).toHaveAttribute("data-rendered-material", BODY_MATERIAL_A);
    await expect(threePreview(page)).toHaveAttribute("data-material-id", BODY_MATERIAL_A);

    await selectBodyMaterial(page, BODY_MATERIAL_B);
    await expect(threePreview(page)).toHaveAttribute("data-rendered-material", BODY_MATERIAL_B);
    await expect(threePreview(page)).toHaveAttribute("data-material-id", BODY_MATERIAL_B);

    await page.getByRole("button", { name: /Перейти к заявке|Далее/i }).click();
    await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
    await expect(threePreview(page)).toHaveAttribute("data-rendered-material", BODY_MATERIAL_B);

    await page.getByRole("button", { name: /Вернуться на предыдущий шаг|Назад/i }).click();
    await expect(page.getByTestId("materials-step-panel")).toHaveAttribute("data-selected-material", BODY_MATERIAL_B);
  });

  test("keeps fallback preview material marker in parity when WebGL is unavailable", async ({ page }) => {
    await openConstructor3D(page, { forceFallback: true });
    await expect(fallbackPreview(page)).toBeVisible();
    await goToMaterialsStep(page);
    await expect(fallbackPreview(page)).toHaveAttribute("data-webgl-fallback", "active");

    await selectBodyMaterial(page, BODY_MATERIAL_A);
    await expect(fallbackSvgPreview(page)).toHaveAttribute("data-material", BODY_MATERIAL_A);

    await selectBodyMaterial(page, BODY_MATERIAL_B);
    await expect(fallbackSvgPreview(page)).toHaveAttribute("data-material", BODY_MATERIAL_B);
    await expect(fallbackSvgPreview(page)).not.toHaveAttribute("data-material", BODY_MATERIAL_A);
  });

  test("keeps selected material in submit-compatible state", async ({ page }) => {
    const requests = await interceptOrderSubmit(page);

    await openConstructor3D(page, { forceFallback: true });
    await goToMaterialsStep(page);
    await selectBodyMaterial(page, BODY_MATERIAL_B);
    await expect(fallbackSvgPreview(page)).toHaveAttribute("data-material", BODY_MATERIAL_B);

    await page.getByRole("button", { name: /Перейти к заявке|Далее/i }).click();
    await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
    await expect(fallbackSvgPreview(page)).toHaveAttribute("data-material", BODY_MATERIAL_B);

    await fillRequiredContact(page);
    await expect(page.getByRole("button", { name: /Отправить заявку/i })).toBeEnabled();
    await page.getByRole("button", { name: /Отправить заявку/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/P1-13-MATERIAL-PARITY|отправлена/i);

    expect(requests).toHaveLength(1);
    expect(requests[0].source).toBe("constructor-store-adapter");
    expect(requests[0].materials?.bodyId).toBe(BODY_MATERIAL_B);
    expect(JSON.stringify(requests[0])).toContain(BODY_MATERIAL_B);
    expect(requests[0].totalPrice).toBeGreaterThan(0);
    expect(requests[0].customer.email).toBe("p1-13-material@example.com");
  });
});
