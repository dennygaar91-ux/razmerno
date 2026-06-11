import { expect, test, type Page } from "@playwright/test";

async function openConfigurator(page: Page) {
  await page.goto("/configurator");
  await expect(page.locator(".rzm-r19-workspace")).toBeVisible();
  await expect(page.locator(".rzm-stage-r29-e2e-cleanup")).toBeVisible();
  await expect(page.locator(".rzm-constructor-stepper")).toBeVisible();
  await expect(page.locator(".rzm-r27-scene-toolbar")).toBeVisible();
  await expect(page.getByRole("button", { name: "2D" })).toBeVisible();
  await expect(page.getByRole("button", { name: "3D" })).toBeVisible();
  await expect(page.locator(".rzm-constructor-price-chip")).toContainText(/Стоимость|Считаем|₽/);
}

async function goToCheckout(page: Page) {
  await openConfigurator(page);
  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Наполнение");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Материалы");
  await expect(page.locator("body")).toContainText("Внешний вид");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Проверьте контакты");
  await expect(page.locator(".rzm-constructor-checkout-shell")).toBeVisible();
}

test("home opens and configurator desktop shell is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("Размерно");
  await expect(page.locator("body")).toContainText("Соберите мебель");

  await openConfigurator(page);
  await expect(page.locator("body")).toContainText("Размеры");
  await expect(page.locator("body")).toContainText("Корпус");
  await expect(page.locator("body")).toContainText("Фасады");
});

test("info pages open through normal URLs", async ({ page }) => {
  for (const route of ["/measurements", "/materials", "/assembly"]) {
    await page.goto(route);
    await expect(page.locator("body")).toContainText("Размерно");
  }

  await page.goto("/measurements");
  await expect(page.locator("body")).toContainText("Снимите размеры");

  await page.goto("/materials");
  await expect(page.locator("body")).toContainText("Выберите декор");

  await page.goto("/assembly");
  await expect(page.locator("body")).toContainText("Собрать мебель проще");
});

test("configurator switches 2D blueprint view modes", async ({ page }) => {
  await openConfigurator(page);

  await page.getByRole("button", { name: "2D" }).click();
  await expect(page.locator(".rzm-constructor-canvas--svg-fallback")).toBeVisible();
  await expect(page.locator(".rzm-blueprint-svg--r24")).toBeVisible();

  await page.getByRole("button", { name: "Спереди" }).click();
  await expect(page.locator(".rzm-constructor-canvas--front")).toBeVisible();

  await page.getByRole("button", { name: "Сбоку" }).click();
  await expect(page.locator(".rzm-constructor-canvas--side")).toBeVisible();

  await page.getByRole("button", { name: "Сверху" }).click();
  await expect(page.locator(".rzm-constructor-canvas--top")).toBeVisible();
});

test("desktop scenario: dimensions, filling, materials and checkout validation", async ({ page }) => {
  await openConfigurator(page);

  await page.getByRole("button", { name: "Увеличить ширину" }).click();
  await page.getByRole("button", { name: "Увеличить секции" }).click();
  await expect(page.locator("body")).toContainText("Секции");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Наполнение");
  await page.getByRole("button", { name: "Увеличить полки" }).click();
  await page.getByRole("button", { name: "Увеличить ящики" }).click();
  await expect(page.locator("body")).toContainText("Фасады");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Материалы");
  await page.getByRole("button", { name: "МДФ" }).click();
  await expect(page.locator("body")).toContainText("ХДФ 3 мм · подобрана автоматически");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Проверьте контакты");
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.locator("body")).toContainText(/Телефон|Email|Согласен|обработку/i);
});

test("checkout options and required fields stay interactive", async ({ page }) => {
  await goToCheckout(page);

  await page.getByLabel("Имя").fill("Денис");
  await page.getByLabel("Телефон").fill("+7 999 111 22 33");
  await page.getByLabel("Email").fill("denis@example.ru");
  await page.getByLabel("Нужна доставка").check();
  await expect(page.getByLabel("Адрес доставки")).toBeVisible();
  await page.getByLabel("Адрес доставки").fill("Москва, Тверская, 1");
  await page.getByLabel("Нужна сборка").check();
  await page.getByLabel(/Согласен на обработку/i).check();

  await expect(page.locator(".rzm-r28-action-panel")).toContainText(/Готово|Итого|₽/);
  await expect(page.getByRole("button", { name: "Отправить заявку" })).toBeEnabled();
});
