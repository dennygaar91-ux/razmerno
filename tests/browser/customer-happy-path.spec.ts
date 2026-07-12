import { expect, test, type Page } from "@playwright/test";

type SubmittedConstructorOrder = {
  orderId?: string;
  productType: "wardrobe" | "dresser" | "nightstand";
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  layout?: { sections?: unknown[] };
  materials: {
    bodyId: string;
    facadeId: string;
    facadeKind?: "ldsp" | "mdf";
    backPanelId?: string;
    backPanelKind?: "hdf";
  };
  style: { facadeStyleId: string; hardwareId: string };
  priceBreakdown: Record<string, number>;
  totalPrice: number;
  customer: { name: string; phone: string; email: string; comment?: string };
  consent: { personalData: boolean; privacyVersion: string; acceptedAt: string };
  configVersion?: string;
  source: string;
};

const BODY_MATERIAL_ID = "ldsp-egger-u780-seryy-monumentalnyy-st9";
const FACADE_MATERIAL_ID = "mdf-egger-r010-seryy-grafitovyy-ms";

async function openConstructor3D(page: Page) {
  await page.goto("/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
  await expect(page.locator(".rzm-3d-page")).toHaveAttribute("data-checkout-stage", "STAGE15");
}

async function setHappyPathDimensions(page: Page) {
  await page.getByLabel(/Ширина: значение в миллиметрах/i).fill("2100");
  await page.getByLabel(/Высота: значение в миллиметрах/i).fill("2450");
  await page.getByLabel(/Глубина: значение в миллиметрах/i).fill("650");
}

async function goToFillStep(page: Page) {
  await page.getByRole("button", { name: /Перейти к наполнению|Далее/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");
}

async function applyStableFillChoice(page: Page) {
  await page.getByRole("button", { name: /Выбрать секцию 1/i }).click();
  await expect(page.locator(".rzm-3d-zone-list")).toContainText("Зоны секции");
  await page.getByRole("button", { name: /Рандомно/i }).click();
}

async function goToMaterialsStep(page: Page) {
  await page.getByRole("button", { name: /Выбрать материалы|Далее/i }).click();
  await expect(page.getByTestId("materials-step-panel")).toBeVisible();
}

async function setHappyPathMaterials(page: Page) {
  const bodyPicker = page.getByTestId("material-picker-body");
  const facadePicker = page.getByTestId("material-picker-facade");

  await bodyPicker.getByTestId(`material-swatch-${BODY_MATERIAL_ID}`).click();
  await expect(bodyPicker).toHaveAttribute("data-selected-material", BODY_MATERIAL_ID);

  await facadePicker.getByTestId(`material-swatch-${FACADE_MATERIAL_ID}`).click();
  await expect(facadePicker).toHaveAttribute("data-selected-material", FACADE_MATERIAL_ID);
}

async function goToCheckout(page: Page) {
  await page.getByRole("button", { name: /Перейти к заявке|Далее/i }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
  await expect(page.locator(".rzm-3d-checkout")).toContainText("Контакты");
  await expect(page.locator(".rzm-3d-price-status")).toContainText("Обновлено");
}

async function fillHappyPathContact(page: Page) {
  await page.getByLabel(/Имя/i).fill("MVP Happy Path");
  await page.getByLabel(/Телефон/i).fill("+7 904 555 55 55");
  await page.getByLabel(/Email/i).fill("mvp-happy-path@example.com");
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
      body: JSON.stringify({ ok: true, orderId: "MVP-HAPPY-PATH-001" }),
    });
  });

  return requests;
}

test("customer happy path: constructor flow reaches successful submit with stable local payload", async ({ page }) => {
  const requests = await interceptOrderSubmit(page);

  await openConstructor3D(page);
  await setHappyPathDimensions(page);
  await goToFillStep(page);
  await applyStableFillChoice(page);
  await goToMaterialsStep(page);
  await setHappyPathMaterials(page);
  await goToCheckout(page);
  await fillHappyPathContact(page);

  await expect(page.getByRole("button", { name: /Отправить заявку/i })).toBeEnabled();
  await page.getByRole("button", { name: /Отправить заявку/i }).click();

  await expect(page.locator(".rzm-3d-submit-message")).toContainText(/MVP-HAPPY-PATH-001|отправлена/i);
  await expect(page.getByRole("button", { name: /Отправлено|Повтор через/i })).toBeVisible();

  expect(requests).toHaveLength(1);
  const payload = requests[0];

  expect(payload.orderId).toMatch(/^RZ-\d{8}-\d{4}$/);
  expect(payload.source).toBe("constructor-store-adapter");
  if ("configVersion" in payload && payload.configVersion !== undefined) {
    expect(payload.configVersion).toEqual(expect.any(String));
  }

  expect(payload.productType).toBe("wardrobe");
  expect(payload.dimensions).toEqual({
    width: 2100,
    height: 2450,
    depth: 650,
  });
  expect(payload.sections).toBeGreaterThan(0);
  expect(payload.layout?.sections?.length).toBe(payload.sections);

  expect(payload.filling.shelves).toBeGreaterThanOrEqual(0);
  expect(payload.filling.drawers).toBeGreaterThanOrEqual(0);
  expect(typeof payload.filling.hangingRod).toBe("boolean");
  expect(payload.filling.shelves + payload.filling.drawers + (payload.filling.hangingRod ? 1 : 0)).toBeGreaterThan(0);

  expect(payload.materials.bodyId).toBe(BODY_MATERIAL_ID);
  expect(payload.materials.facadeId).toBe(FACADE_MATERIAL_ID);
  expect(payload.materials.facadeKind).toBe("mdf");
  expect(payload.materials.backPanelKind).toBe("hdf");

  expect(payload.customer).toEqual({
    name: "MVP Happy Path",
    phone: "+7 904 555 55 55",
    email: "mvp-happy-path@example.com",
  });

  expect(payload.totalPrice).toBeGreaterThan(0);
  expect(Object.values(payload.priceBreakdown).some((value) => value > 0)).toBe(true);
  expect(new Date(payload.consent.acceptedAt).toString()).not.toBe("Invalid Date");
});
