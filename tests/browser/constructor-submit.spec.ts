import { test, expect, type Page } from "@playwright/test";

// Helper to open the constructor page and wait for initial widgets
async function openConstructor(page: Page) {
  await page.goto("/configurator");
  // Wait for workspace and stepper to be visible
  await expect(page.locator(".rzm-r19-workspace")).toBeVisible();
  await expect(page.locator(".rzm-constructor-stepper")).toBeVisible();
}

// Helper to walk through steps until checkout
async function proceedToCheckout(page: Page) {
  // sizes -> fill
  await page.getByRole("button", { name: /Далее|Перейти|Выбрать/i }).click();
  await expect(page.locator("body")).toContainText(/Наполнение/);
  // fill -> materials
  await page.getByRole("button", { name: /Далее|Перейти|Выбрать/i }).click();
  await expect(page.locator("body")).toContainText(/Материалы|Внешний вид/);
  // materials -> checkout
  await page.getByRole("button", { name: /Далее|Перейти|Выбрать/i }).click();
  await expect(page.locator("body")).toContainText(/Проверьте контакты|Контакты/);
}

// Fill contact fields
async function fillContact(page: Page, {
  name,
  phone,
  email,
}: { name: string; phone: string; email: string; }) {
  await page.getByLabel(/Имя/i).fill(name);
  await page.getByLabel(/Телефон/i).fill(phone);
  await page.getByLabel(/Email/i).fill(email);
}

test.describe("Constructor submit flow", () => {
  test("submit successful order without delivery or assembly", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "Тест", phone: "+7 900 000 00 00", email: "test@example.com" });
    await page.getByLabel(/Согласен/i).check();

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      const postData = route.request().postDataJSON();
      requests.push(postData);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E1" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();

    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Заявка|отправлена/i);

    expect(requests.length).toBe(1);
    const payload = requests[0];
    expect(payload.deliveryEnabled).toBeFalsy();
    expect(payload.assemblyEnabled).toBeFalsy();
    expect(payload.contact.name).toBe("Тест");
    expect(payload.contact.phone).toMatch(/\+7/);
    expect(payload.contact.email).toContain("@");
  });

  test("submit with delivery", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "Павел", phone: "+7 901 111 11 11", email: "pavel@example.com" });
    await page.getByLabel(/Нужна доставка/i).check();
    await page.getByLabel(/Адрес доставки/i).fill("Москва, ул. Тверская, 1");
    await page.getByLabel(/Согласен/i).check();

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      const data = route.request().postDataJSON();
      requests.push(data);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E2" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Заявка|отправлена/i);

    const payload = requests[0];
    expect(payload.deliveryEnabled).toBeTruthy();
    expect(payload.deliveryAddress).toContain("Москва");
    expect(payload.assemblyEnabled).toBeFalsy();
  });

  test("submit with delivery and assembly", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "Мария", phone: "+7 902 222 22 22", email: "maria@example.com" });
    await page.getByLabel(/Нужна доставка/i).check();
    await page.getByLabel(/Адрес доставки/i).fill("Санкт-Петербург, Невский, 10");
    await page.getByLabel(/Нужна сборка/i).check();
    await page.getByLabel(/Согласен/i).check();

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      const payload = route.request().postDataJSON();
      requests.push(payload);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E3" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Заявка|отправлена/i);

    const payload = requests[0];
    expect(payload.deliveryEnabled).toBeTruthy();
    expect(payload.deliveryAddress).toContain("Санкт-Петербург");
    expect(payload.assemblyEnabled).toBeTruthy();
  });

  test("validation failure shows error and no API call", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    // Leave contact fields blank and do not check consent
    await page.getByLabel(/Имя/i).fill("");
    await page.getByLabel(/Телефон/i).fill("");
    await page.getByLabel(/Email/i).fill("");

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E4" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Проверьте|Нужно/i);
    expect(requests.length).toBe(0);
  });

  test("API failure displays error message", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "Ошибка", phone: "+7 903 333 33 33", email: "error@example.com" });
    await page.getByLabel(/Согласен/i).check();

    await page.route("**/api/orders", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Server error" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Не удалось|ошибка/i);
  });

  test("submit after reset", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "ResetTest", phone: "+7 904 444 44 44", email: "reset@example.com" });
    await page.getByLabel(/Согласен/i).check();

    // Open reset dialog via header control
    await page.getByRole("button", { name: "Сбросить" }).click();
    // Confirm reset in dialog
    await page.locator(".rzm-3d-reset-dialog").getByRole("button", { name: "Сбросить" }).click();

    // After reset we should be back to the first step; proceed again
    await expect(page.locator("body")).toContainText(/Размеры|Корпус/);
    await proceedToCheckout(page);
    // Contact fields should be empty after reset
    await expect(page.getByLabel(/Имя/i)).toHaveValue("");
    await expect(page.getByLabel(/Телефон/i)).toHaveValue("");
    await expect(page.getByLabel(/Email/i)).toHaveValue("");
    // Fill again
    await fillContact(page, { name: "ResetOK", phone: "+7 905 555 55 55", email: "resetok@example.com" });
    await page.getByLabel(/Согласен/i).check();

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      const p = route.request().postDataJSON();
      requests.push(p);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E5" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Заявка|отправлена/i);
    expect(requests.length).toBe(1);
  });

  test("submit after state restore", async ({ page }) => {
    await openConstructor(page);
    await proceedToCheckout(page);
    await fillContact(page, { name: "Restore", phone: "+7 906 666 66 66", email: "restore@example.com" });
    await page.getByLabel(/Согласен/i).check();
    // enable delivery and assembly to have some state
    await page.getByLabel(/Нужна доставка/i).check();
    await page.getByLabel(/Адрес доставки/i).fill("Казань, Кремль, 1");
    await page.getByLabel(/Нужна сборка/i).check();

    // Reload the page; constructor should restore last snapshot
    await page.reload();
    // Wait until constructor loads
    await expect(page.locator(".rzm-r19-workspace")).toBeVisible();

    // Go directly to checkout; if the state persisted, we might already be on checkout; otherwise navigate again
    if (await page.locator(".rzm-constructor-checkout-shell").count() === 0) {
      // Not on checkout; navigate again through steps
      await proceedToCheckout(page);
    }

    // Verify restored values
    await expect(page.getByLabel(/Имя/i)).toHaveValue("Restore");
    await expect(page.getByLabel(/Телефон/i)).toHaveValue("+7 906 666 66 66");
    await expect(page.getByLabel(/Email/i)).toHaveValue("restore@example.com");
    await expect(page.getByLabel(/Нужна доставка/i)).toBeChecked();
    await expect(page.getByLabel(/Адрес доставки/i)).toHaveValue(/Казань/);
    await expect(page.getByLabel(/Нужна сборка/i)).toBeChecked();

    // Consent may not persist; check and enable if needed
    const consentBox = page.getByLabel(/Согласен/i);
    if (!(await consentBox.isChecked())) {
      await consentBox.check();
    }

    const requests: any[] = [];
    await page.route("**/api/orders", async (route) => {
      const p = route.request().postDataJSON();
      requests.push(p);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, orderId: "E2E6" }),
      });
    });

    await page.getByRole("button", { name: /Отправить/i }).click();
    await expect(page.locator(".rzm-3d-submit-message")).toContainText(/Заявка|отправлена/i);
    expect(requests.length).toBe(1);
  });
});
