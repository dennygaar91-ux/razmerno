import { expect, test, type Page } from "@playwright/test";

type SubmittedConstructorOrder = {
  orderId?: string;
  productType: "wardrobe" | "dresser" | "nightstand";
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
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
  delivery?: { enabled: boolean; address?: string; price: number };
  assembly?: { enabled: boolean; price: number; rate: number; basePrice: number };
  consent: { personalData: boolean; privacyVersion: string; acceptedAt: string };
  configVersion?: string;
  source: string;
  utm?: Record<string, string>;
  honeypot?: string;
};

type ContactFixture = {
  name: string;
  phone: string;
  email: string;
};

async function openConstructor3D(page: Page) {
  await page.goto("/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(page.locator(".rzm-3d-page")).toHaveAttribute(
    "data-checkout-stage",
    "STAGE15",
  );
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
  await expect(page.getByRole("button", { name: /Перейти к наполнению/i })).toBeVisible();
}

async function proceedToCheckout(page: Page) {
  await page.getByRole("button", { name: /Перейти к наполнению/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Наполнение");

  await page.getByRole("button", { name: /Выбрать материалы/i }).click();
  await expect(page.locator(".rzm-3d-drawer-body")).toContainText("Материалы");

  await page.getByRole("button", { name: /Перейти к заявке/i }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
  await expect(page.locator(".rzm-3d-checkout")).toContainText("Контакты");
  await waitForReadyQuote(page);
}

async function waitForReadyQuote(page: Page) {
  await expect(page.locator(".rzm-3d-price-status")).toContainText("Обновлено");
  await expect(page.locator(".rzm-3d-checkout-price")).toContainText(/₽/);
}

async function fillRequiredContact(page: Page, contact: ContactFixture) {
  await page.getByLabel(/Имя/i).fill(contact.name);
  await page.getByLabel(/Телефон/i).fill(contact.phone);
  await page.getByLabel(/Email/i).fill(contact.email);
  await page.getByLabel(/Согласен на обработку персональных данных/i).check();
}

async function interceptOrderSubmit(
  page: Page,
  options: { status?: number; body?: unknown } = {},
) {
  const requests: SubmittedConstructorOrder[] = [];

  await page.route("**/api/orders", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.headers()["content-type"]).toContain("application/json");
    expect(request.headers()["idempotency-key"]).toMatch(/^RZ-\d{8}-\d{4}$/);

    requests.push(request.postDataJSON() as SubmittedConstructorOrder);

    await route.fulfill({
      status: options.status ?? 200,
      contentType: "application/json",
      body: JSON.stringify(options.body ?? { ok: true, orderId: "P1-09-E2E-001" }),
    });
  });

  return requests;
}

function expectSubmittedOrderBase(payload: SubmittedConstructorOrder, contact: ContactFixture) {
  expect(payload.orderId).toMatch(/^RZ-\d{8}-\d{4}$/);
  expect(payload.productType).toBe("wardrobe");
  expect(payload.source).toBe("constructor-store-adapter");

  expect(payload.customer).toEqual(contact);
  expect(payload.consent).toEqual(
    expect.objectContaining({
      personalData: true,
      privacyVersion: "2026-05-24",
    }),
  );
  expect(new Date(payload.consent.acceptedAt).toString()).not.toBe("Invalid Date");

  expect(payload.dimensions.width).toBeGreaterThan(0);
  expect(payload.dimensions.height).toBeGreaterThan(0);
  expect(payload.dimensions.depth).toBeGreaterThan(0);
  expect(payload.sections).toBeGreaterThan(0);
  expect(payload.totalPrice).toBeGreaterThan(0);
  expect(Object.values(payload.priceBreakdown).some((value) => value > 0)).toBe(true);

  expect(payload.layout?.sections?.length).toBe(payload.sections);
  expect(payload.materials.bodyId).toEqual(expect.any(String));
  expect(payload.materials.facadeId).toEqual(expect.any(String));
  expect(payload.materials.backPanelKind).toBe("hdf");
  expect(payload.style).toEqual(
    expect.objectContaining({
      facadeStyleId: expect.any(String),
      hardwareId: expect.any(String),
    }),
  );

  expect(payload).not.toHaveProperty("contact");
  expect(payload).not.toHaveProperty("deliveryEnabled");
  expect(payload).not.toHaveProperty("deliveryAddress");
  expect(payload).not.toHaveProperty("assemblyEnabled");
}

test.describe("Constructor3D submit flow", () => {
  test("submits a production-shaped order without delivery or assembly", async ({ page }) => {
    const contact = {
      name: "P1-09 Клиент",
      phone: "+7 900 000 00 00",
      email: "p1-09@example.com",
    };
    const requests = await interceptOrderSubmit(page, {
      body: { ok: true, orderId: "P1-09-E2E-001" },
    });

    await openConstructor3D(page);
    await proceedToCheckout(page);
    await fillRequiredContact(page, contact);

    await expect(page.getByRole("button", { name: /Отправить заявку/i })).toBeEnabled();
    await page.getByRole("button", { name: /Отправить заявку/i }).click();

    await expect(page.locator(".rzm-3d-submit-message")).toContainText(
      /P1-09-E2E-001|отправлена/i,
    );
    await expect(page.getByRole("button", { name: /Отправлено|Повтор через/i })).toBeVisible();

    expect(requests).toHaveLength(1);
    const payload = requests[0];
    expectSubmittedOrderBase(payload, contact);
    expect(payload.delivery).toEqual(expect.objectContaining({ enabled: false, price: 0 }));
    expect(payload.assembly).toEqual(expect.objectContaining({ enabled: false, price: 0 }));
  });

  test("submits delivery and assembly options in the real OrderPayload contract", async ({ page }) => {
    const contact = {
      name: "P1-09 Доставка",
      phone: "+7 901 111 11 11",
      email: "delivery-p1-09@example.com",
    };
    const requests = await interceptOrderSubmit(page, {
      body: { ok: true, orderId: "P1-09-E2E-DELIVERY" },
    });

    await openConstructor3D(page);
    await proceedToCheckout(page);
    await fillRequiredContact(page, contact);
    await page.getByLabel(/Нужна доставка/i).check();
    await page.getByLabel(/Адрес доставки/i).fill("Москва, ул. Тверская, 1");
    await page.getByLabel(/Нужна сборка/i).check();
    await waitForReadyQuote(page);

    await page.getByRole("button", { name: /Отправить заявку/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(
      /P1-09-E2E-DELIVERY|отправлена/i,
    );

    expect(requests).toHaveLength(1);
    const payload = requests[0];
    expectSubmittedOrderBase(payload, contact);
    expect(payload.delivery).toEqual(
      expect.objectContaining({
        enabled: true,
        address: "Москва, ул. Тверская, 1",
      }),
    );
    expect(payload.delivery?.price).toBeGreaterThan(0);
    expect(payload.assembly).toEqual(
      expect.objectContaining({
        enabled: true,
        rate: expect.any(Number),
        basePrice: expect.any(Number),
      }),
    );
    expect(payload.assembly?.price).toBeGreaterThan(0);
  });

  test("keeps required checkout fields blocked before any API request", async ({ page }) => {
    const requests = await interceptOrderSubmit(page);

    await openConstructor3D(page);
    await proceedToCheckout(page);

    await expect(page.getByRole("button", { name: /Заполните заявку/i })).toBeDisabled();
    await expect(page.locator("#rzm-3d-primary-action-help")).toContainText(
      "Заполните имя, телефон, email и подтвердите согласие.",
    );
    expect(requests).toHaveLength(0);
  });

  test("validates RU phone before submit and does not call the API", async ({ page }) => {
    const requests = await interceptOrderSubmit(page);

    await openConstructor3D(page);
    await proceedToCheckout(page);
    await fillRequiredContact(page, {
      name: "P1-09 Ошибка",
      phone: "12345",
      email: "invalid-phone-p1-09@example.com",
    });

    await expect(page.getByRole("button", { name: /Отправить заявку/i })).toBeEnabled();
    await page.getByRole("button", { name: /Отправить заявку/i }).click();

    await expect(page.locator(".rzm-3d-submit-message")).toContainText(
      /Проверьте обязательные поля/i,
    );
    await expect(page.locator(".rzm-3d-checkout")).toContainText(
      "Укажите российский номер",
    );
    expect(requests).toHaveLength(0);
  });

  test("shows API error response without losing checkout state", async ({ page }) => {
    const contact = {
      name: "P1-09 API Ошибка",
      phone: "+7 902 222 22 22",
      email: "api-error-p1-09@example.com",
    };
    const requests = await interceptOrderSubmit(page, {
      status: 500,
      body: { ok: false, message: "P1-09 forced API failure" },
    });

    await openConstructor3D(page);
    await proceedToCheckout(page);
    await fillRequiredContact(page, contact);

    await page.getByRole("button", { name: /Отправить заявку/i }).click();

    await expect(page.locator(".rzm-3d-submit-message")).toContainText(
      "P1-09 forced API failure",
    );
    await expect(page.getByLabel(/Email/i)).toHaveValue(contact.email);
    expect(requests).toHaveLength(1);
    expectSubmittedOrderBase(requests[0], contact);
  });
});
