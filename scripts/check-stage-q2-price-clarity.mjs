import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (file) => fs.readFileSync(file, 'utf8');
const constructor3d = read('src/static-pages/Constructor3DPage.tsx');
const engine = read('src/pricing/engine.ts');
const policy = read('src/pricing/pricingPolicy.ts');
const transparency = read('src/pricing/materialPricingTransparency.ts');
const services = read('src/pricing/productionServicesPricing.ts');
const pkg = read('package.json');

assert.ok(constructor3d.includes('data-stage="Q2"'));
assert.ok(constructor3d.includes('rzm-3d-shell--q2'));
assert.ok(constructor3d.includes('Точная стоимость'));
assert.ok(constructor3d.includes('Точная смета'));
assert.ok(constructor3d.includes('Стоимость рассчитана по текущей конфигурации'));
assert.ok(!constructor3d.toLowerCase().includes('предварительно'));

assert.ok(policy.includes('CLIENT_PRICE_MULTIPLIER = 1.3'));
assert.ok(policy.includes('boardIncludesCutting: true'));
assert.ok(policy.includes('boardIncludesDrilling: true'));
assert.ok(policy.includes('countCuttingSeparately: false'));
assert.ok(policy.includes('countDrillingSeparately: false'));
assert.ok(policy.includes('Кромка'));
assert.ok(policy.includes('Услуги'));

assert.ok(engine.includes('CLIENT_PRICE_MULTIPLIER'));
assert.ok(engine.includes('PACKAGING_FALLBACK_M2'));
assert.ok(engine.includes('const services = packaging'));
assert.ok(engine.includes('const production = 0'));
assert.ok(engine.includes('isPreliminary: false'));
assert.ok(!engine.includes('cutPriceM2'));
assert.ok(!engine.includes('drillingPrice'));

assert.ok(transparency.includes('Точная смета'));
assert.ok(transparency.includes('предупреждение относится к проверке комплектации, не к статусу цены'));
assert.ok(!transparency.includes('Смета требует проверки'));
assert.ok(!transparency.includes('будет проверена менеджером'));

assert.ok(services.includes('Распил/обработка панелей · включено в ЛДСП/МДФ'));
assert.ok(services.includes('Присадка/отверстия · включено в ЛДСП/МДФ'));
assert.ok(services.includes('PRODUCTION_BUFFER_RATE = 0'));
assert.ok(pkg.includes('check:stage-q2-price-clarity'));

console.log('Stage Q2 price clarity checks passed.');
