import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const scenePath = path.resolve("src/static-pages/constructor/components/ConstructorScene.tsx");
const scene = fs.readFileSync(scenePath, "utf8");

assert.equal(scene.includes("quote?.total ?? 42800"), false, "Scene price chip must not use fake 42 800 ₽ fallback");
assert.equal(scene.includes("42800"), false, "Scene must not contain hardcoded 42800 fallback price");
assert.equal(scene.includes("31600"), false, "Scene must not contain hardcoded 31600 fallback price");
assert.equal(scene.includes("6400"), false, "Scene must not contain hardcoded 6400 fallback price");
assert.equal(scene.includes("4800"), false, "Scene must not contain hardcoded 4800 fallback price");
assert.ok(scene.includes('quoteError ? "Ошибка расчёта"'), "Scene price chip must show error text when quoteError exists");
assert.ok(scene.includes('quote ? formatPrice(quote.total) : "Считаем"'), "Scene price chip must show pending text until quote is ready");

console.log("ConstructorScene price state test passed");
