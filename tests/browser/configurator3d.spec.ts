import { expect, test, type Page } from "@playwright/test";

async function open3DConfigurator(page: Page) {
  await page.goto("/configurator-3d");
  await expect(page.locator(".rzm-3d-page")).toHaveAttribute("data-stage", "Q10-Q11");
  await expect(page.locator(".rzm-3d-shell--q10-q11")).toBeVisible();
  await expect(page.locator(".rzm-3d-stepper")).toBeVisible();
  await expect(page.getByText("Реалистичный 3D preview")).toBeVisible();
  await expect(page.locator("[data-testid='constructor-3d-viewport']")).toBeVisible();
  await expect(page.getByRole("button", { name: "Применить случайный пресет к выбранной секции" })).toBeVisible();
}

test("3D configurator shell opens as the active Q10/Q11 experience", async ({ page }) => {
  await open3DConfigurator(page);

  await expect(page.locator("body")).toContainText("Размеры");
  await expect(page.locator("body")).toContainText("Стоимость");
  await expect(page.locator("body")).toContainText(/3D готово|3D проверяется/);
});

test("3D configurator route aliases open the same experience", async ({ page }) => {
  for (const route of ["/constructor-3d", "/constructor3d"]) {
    await page.goto(route);
    await expect(page.locator(".rzm-3d-page")).toHaveAttribute("data-stage", "Q10-Q11");
    await expect(page.locator("body")).toContainText("3D-конструктор");
  }
});

test("3D configurator scenario: sizes, random fill, materials and checkout validation", async ({ page }) => {
  await open3DConfigurator(page);

  await page.getByRole("button", { name: "Увеличить ширина" }).click();
  await page.getByRole("button", { name: "Увеличить секции" }).click();
  await expect(page.locator("body")).toContainText("Секции");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Наполнение");
  await expect(page.locator("body")).toContainText("Выберите секцию или зону на модели");
  await page.getByRole("button", { name: "Применить случайный пресет к выбранной секции" }).click();
  await expect(page.locator("body")).toContainText("Зоны секции");
  await expect(page.locator("body")).toContainText("Элементы");

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator("body")).toContainText("Материалы");
  await expect(page.locator("body")).toContainText("Задняя стенка");
  await page.getByRole("button", { name: "MDF" }).click();

  await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator(".rzm-3d-checkout")).toBeVisible();
  await expect(page.locator("body")).toContainText("Заявка");
  await expect(page.locator("body")).toContainText("Контакты");
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.locator("body")).toContainText(/Телефон|Email|Согласен|обработку/i);
});

test("3D checkout controls remain interactive", async ({ page }) => {
  await open3DConfigurator(page);

  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: "Далее" }).click();

  await page.getByLabel("Имя").fill("Денис");
  await page.getByLabel("Телефон").fill("+7 999 111 22 33");
  await page.getByLabel("Email").fill("denis@example.ru");
  await page.getByLabel("Нужна доставка").check();
  await expect(page.getByLabel("Адрес доставки")).toBeVisible();
  await page.getByLabel("Адрес доставки").fill("Москва, Тверская, 1");
  await page.getByLabel("Нужна сборка").check();
  await page.getByLabel(/Согласен на обработку/i).check();

  await expect(page.locator(".rzm-3d-checkout-price")).toContainText(/Смета|₽|Считаем/);
});


test("3D configurator reset dialog clears the project after confirmation", async ({ page }) => {
  await open3DConfigurator(page);

  await page.getByRole("button", { name: "Увеличить ширина" }).click();
  await page.getByRole("button", { name: "Сбросить параметры" }).click();
  await expect(page.getByRole("dialog", { name: "Сбросить параметры?" })).toBeVisible();
  await page.getByRole("button", { name: "Отмена" }).click();
  await expect(page.getByRole("dialog", { name: "Сбросить параметры?" })).toBeHidden();

  await page.getByRole("button", { name: "Сбросить параметры" }).click();
  await page.getByRole("button", { name: "Сбросить" }).click();
  await expect(page.locator("body")).toContainText("1 800 мм");
  await expect(page.locator("body")).toContainText("2 400 мм");
});

test("3D configurator exposes basic WCAG navigation markers", async ({ page }) => {
  await open3DConfigurator(page);
  await expect(page.getByRole("button", { name: /Открыть шаг 1/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Увеличить ширина" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Уменьшить ширина" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Применить случайный пресет к выбранной секции" })).toBeVisible();
});
