import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const scripts = ['check:stage13-validation-ux','check:stage14-pricing-estimate','check:stage15-checkout-conversion','check:stage16-reset-no-autosave','check:stage17-a11y-hardening'];
for (const s of scripts) if (!pkg.scripts[s]) throw new Error(`Missing regression script ${s}`);
if (!page.includes('data-qa-stage="STAGE18"')) throw new Error('Stage18 QA marker missing');
console.log('Stage 18 regression guard passed');
