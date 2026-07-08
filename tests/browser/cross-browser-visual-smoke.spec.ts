import { expect, test } from "@playwright/test";

const ROUTES = [
  { name: "landing", path: "/", marker: ".rzm-home-main" },
  { name: "measurements", path: "/measurements", marker: ".rzm-info-main--measurements" },
  { name: "materials", path: "/materials", marker: ".rzm-info-main--materials" },
  { name: "assembly", path: "/assembly", marker: ".rzm-info-main--assembly" },
  { name: "constructor-3d", path: "/configurator-3d", marker: ".rzm-3d-page" },
  {
    name: "constructor-webgl-fallback",
    path: "/configurator-3d?rzm_webgl=off",
    marker: ".rzm-3d-blueprint-fallback",
  },
  { name: "customer-auth-gate", path: "/account", marker: ".rzm-account-panel-title" },
  { name: "operations-auth-gate", path: "/operations", marker: "text=Очередь заявок" },
] as const;

for (const route of ROUTES) {
  test(`cross-browser smoke: ${route.name} renders shell`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await expect(page.locator(route.marker).first()).toBeVisible({ timeout: 45_000 });
  });
}

test("cross-browser smoke: constructor checkout shell is reachable", async ({ page }) => {
  await page.goto("/configurator-3d", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".rzm-3d-page")).toBeVisible({ timeout: 45_000 });
  await page.getByRole("button", { name: "Заявка" }).first().click({ timeout: 15_000 });
  await expect(page.locator(".rzm-3d-checkout").first()).toBeVisible({ timeout: 45_000 });
});
