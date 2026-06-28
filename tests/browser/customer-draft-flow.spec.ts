import { expect, test, type Page } from "@playwright/test";

async function open3DConfigurator(page: Page) {
  await page.goto("/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toBeVisible();
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
}

test("customer can save, reload, restore and continue Constructor3D draft locally", async ({ page }) => {
  let orderSubmitCalls = 0;
  await page.route("**/api/orders", async (route) => {
    orderSubmitCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orderId: "RZ-TEST-0001" }),
    });
  });

  await open3DConfigurator(page);

  await page.getByRole("button", { name: "Увеличить ширина" }).click();
  await page.getByRole("button", { name: "Увеличить количество секций" }).click();
  const savedWidth = await page.getByLabel("Ширина: значение в миллиметрах").inputValue();

  await page.getByRole("button", { name: "Перейти к наполнению" }).click();
  await expect(page.locator("body")).toContainText("Наполнение");
  await page.getByRole("button", { name: /Выбрать секцию 1/i }).click();
  await expect(page.locator(".rzm-3d-zone-list")).toContainText("Зоны секции");
  await page.getByRole("button", { name: /Рандомно/i }).click();
  await page.getByRole("button", { name: "Без ручек" }).click();
  const savedZoneSummary = await page.locator(".rzm-3d-zone-list button").first().locator("small").innerText();

  await page.getByRole("button", { name: "Выбрать материалы" }).click();
  await expect(page.locator("[data-testid='materials-step-panel']")).toBeVisible();
  await page.getByRole("button", { name: "MDF" }).click();
  await page.locator("[data-testid='material-picker-body'] [data-testid^='material-swatch-']").nth(1).click();
  await page.locator("[data-testid='material-picker-facade'] [data-testid^='material-swatch-']").first().click();

  const savedBodyMaterial = await page.locator("[data-testid='material-selection-summary']").getAttribute("data-selected-material");
  const savedFacadeMaterial = await page.locator("[data-testid='material-selection-summary']").getAttribute("data-selected-facade-material");

  await page.getByRole("button", { name: "Сохранить проект" }).click();
  await expect(page.locator("body")).toContainText("Черновик сохранён");

  await page.reload();
  await expect(page.locator("body")).toContainText("Локальный черновик доступен");
  await page.getByRole("button", { name: "Восстановить проект" }).click();
  await expect(page.locator("body")).toContainText("Черновик восстановлен");

  await expect(page.getByLabel("Ширина: значение в миллиметрах")).toHaveValue(savedWidth);

  await page.getByRole("button", { name: /Открыть шаг 2: Наполнение/i }).click();
  await expect(page.getByRole("button", { name: "Без ручек" })).toHaveClass(/is-active/);
  await expect(page.locator('[aria-label="Выбор секции"] button')).toHaveCount(3);
  await expect(page.locator(".rzm-3d-zone-list button").first().locator("small")).toHaveText(savedZoneSummary);

  await page.getByRole("button", { name: /Открыть шаг 3: Материалы/i }).click();
  await expect(page.locator("[data-testid='material-selection-summary']")).toHaveAttribute("data-selected-material", savedBodyMaterial ?? "");
  await expect(page.locator("[data-testid='material-selection-summary']")).toHaveAttribute("data-selected-facade-material", savedFacadeMaterial ?? "");

  await page.getByRole("button", { name: "Перейти к заявке" }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();

  await page.getByRole("button", { name: "Очистить черновик" }).click();
  await expect(page.locator("body")).toContainText("Черновик удалён");
  await expect.poll(() => orderSubmitCalls).toBe(0);
});
