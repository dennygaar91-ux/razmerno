import { readFileSync } from 'node:fs';

const files = {
  page: 'src/static-pages/Constructor3DPage.tsx',
  header: 'src/static-pages/constructor/components/ConstructorHeader.tsx',
  css: 'src/styles/constructor3d.css',
  pkg: 'package.json',
};

const page = readFileSync(files.page, 'utf8');
const header = readFileSync(files.header, 'utf8');
const css = readFileSync(files.css, 'utf8');
const pkg = readFileSync(files.pkg, 'utf8');

const checks = [
  {
    name: 'Constructor3DPage uses compact workspace header',
    pass: page.includes('variant="workspace"') && page.includes('onReset={() => setResetDialogOpen(true)}'),
  },
  {
    name: 'Landing navigation is not rendered in workspace header branch',
    pass: header.includes('variant === "workspace"') && header.includes('rzm-constructor-shell-header') && header.includes('Выйти на сайт'),
  },
  {
    name: 'Workspace header contains reset control',
    pass: header.includes('rzm-constructor-shell-reset') && header.includes('Сбросить'),
  },
  {
    name: 'Stagebar keeps stepper above scene',
    pass: page.includes('rzm-3d-stagebar--stage05') && page.indexOf('rzm-3d-stagebar--stage05') < page.indexOf('rzm-3d-workspace'),
  },
  {
    name: 'Top stagebar no longer duplicates price chip',
    pass: !page.includes('aria-label="Статус сцены и точная стоимость"') && !page.includes('<span>Точная стоимость</span>\n                <strong>{priceLabel}</strong>\n                <small>{priceStatusLabel}</small>'),
  },
  {
    name: 'Price stays in drawer footer near CTA',
    pass: page.includes('rzm-3d-drawer-footer') && page.includes('<span>Точная стоимость</span>') && page.includes('rzm-3d-drawer-actions'),
  },
  {
    name: 'Primary CTA text is step-specific, not generic Далее',
    pass: page.includes('Перейти к наполнению') && page.includes('Выбрать материалы') && page.includes('Перейти к заявке') && !page.includes(': "Далее"'),
  },
  {
    name: 'Stage 05 shell styles are present',
    pass: css.includes('Stage 05 — compact constructor shell') && css.includes('.rzm-constructor-shell-header') && css.includes('.rzm-3d-page[data-stage="STAGE05"]'),
  },
  {
    name: 'Package exposes Stage 05 guard',
    pass: pkg.includes('check:stage05-constructor-shell'),
  },
];

const failed = checks.filter((check) => !check.pass);
for (const check of checks) {
  console.log(`${check.pass ? '✓' : '✗'} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\nStage 05 constructor shell guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
