import fs from 'node:fs';

const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const header = fs.readFileSync('src/static-pages/constructor/components/ConstructorHeader.tsx', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  ['active page uses Stage 06 marker', page.includes('data-stage="STAGE06"')],
  ['shell has Stage 06 class', page.includes('rzm-3d-shell--stage06')],
  ['stagebar has Stage 06 class', page.includes('rzm-3d-stagebar--stage06')],
  ['workspace header actions use role button classes', header.includes('rzm-ui-btn--reset') && header.includes('rzm-ui-btn--exit')],
  ['mode switch controls use rzm-ui-btn--mode', page.includes('rzm-ui-btn--mode') && page.includes('rzm-3d-mode-switch')],
  ['runtime and price statuses use status badges', page.includes('rzm-3d-status-badge--runtime') && page.includes('rzm-3d-status-badge--price')],
  ['drawer footer is explicitly a price block', page.includes('rzm-3d-price-block rzm-3d-drawer-footer')],
  ['validation panels use status-card role classes', page.includes('rzm-3d-status-card--valid') && page.includes('rzm-3d-status-card--${primary.severity}')],
  ['inline validation uses status-card role class', page.includes('rzm-3d-inline-validation rzm-3d-status-card')],
  ['auto-fix buttons use role button classes', page.includes('rzm-ui-btn--autofix')],
  ['control rows use control-group role class', page.includes('rzm-3d-control-group rzm-3d-control-row')],
  ['Stage 06 CSS token scope exists', css.includes('.rzm-3d-page[data-stage="STAGE06"]') && css.includes('--rzm-ui-primary')],
  ['Stage 06 button roles styled', css.includes('.rzm-ui-btn--primary') && css.includes('.rzm-ui-btn--secondary') && css.includes('.rzm-ui-btn--ghost') && css.includes('.rzm-ui-btn--danger')],
  ['Stage 06 status roles styled', css.includes('.rzm-3d-status-card--warning') && css.includes('.rzm-3d-status-card--error') && css.includes('.rzm-3d-status-card--valid')],
  ['Stage 06 script registered', pkg.scripts?.['check:stage06-design-system'] === 'node scripts/check-stage06-design-system.mjs'],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage 06 design-system check failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Stage 06 design-system check passed (${checks.length}/${checks.length}).`);
