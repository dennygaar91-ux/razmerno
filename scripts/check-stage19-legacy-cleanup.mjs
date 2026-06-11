import fs from 'node:fs';
const app = fs.readFileSync('src/App.tsx', 'utf8');
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const legacyDoc = fs.existsSync('docs/legacy/LEGACY_CLEANUP_STAGE19.md') ? fs.readFileSync('docs/legacy/LEGACY_CLEANUP_STAGE19.md', 'utf8') : '';
if (!page.includes('data-legacy-stage="STAGE19"')) throw new Error('Stage19 marker missing');
if (!app.includes('/constructor-legacy') || !app.includes('/configurator-legacy')) throw new Error('Legacy routes must remain explicit only');
if (!legacyDoc.includes('test-backed legacy')) throw new Error('Legacy quarantine document missing');
console.log('Stage 19 legacy cleanup guard passed');
