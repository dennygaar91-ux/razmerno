import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const page = read('src/static-pages/Constructor3DPage.tsx');
const css = read('src/styles/constructor3d.css');
const pkg = read('package.json');

assert.ok(page.includes('data-stage="Q7"'), 'Constructor3DPage must use Q7 stage marker');
assert.ok(page.includes('rzm-3d-shell--q7'), 'Constructor3DPage must use Q7 shell marker');
assert.ok(page.includes('rzm-3d-checkout--q7'), 'checkout body must use Q7 class');
assert.ok(page.includes('rzm-3d-consent--footer'), 'consent must be colocated with sticky submit footer');
assert.ok(page.includes('checkoutRequiredMissing'), 'checkout must prevent submit until required fields and consent are complete');
assert.ok(page.includes('Заполните имя, телефон, email и подтвердите согласие'), 'disabled submit helper must explain missing required fields');
assert.ok(page.includes('Смета'), 'checkout must keep estimate breakdown');
assert.ok(page.includes('Детали расчёта'), 'checkout estimate header must avoid duplicating total price');
assert.ok(page.includes('Состав заявки'), 'project payload details must be a visible disclosure');
assert.ok(page.includes('Точная стоимость закреплена внизу панели'), 'checkout intro must point to one sticky exact price');
assert.ok(!page.includes('className="rzm-3d-checkout-submit rzm-ui-btn rzm-ui-btn--primary"'), 'body-level duplicate submit button must be removed');
assert.ok(css.includes('Stage Q7 — checkout final polish'), 'Q7 CSS section must exist');
assert.ok(css.includes('.rzm-3d-shell--q7 .rzm-3d-drawer-footer.is-checkout'), 'Q7 sticky footer CSS must exist');
assert.ok(css.includes('.rzm-3d-shell--q7 .rzm-3d-consent--footer'), 'Q7 footer consent CSS must exist');
assert.ok(pkg.includes('check:stage-q7-checkout-final-polish'), 'package script must exist');

console.log('Stage Q7 checkout final polish checks passed.');
