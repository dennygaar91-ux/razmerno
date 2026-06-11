import fs from 'node:fs';
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const store = fs.readFileSync('src/static-pages/constructor/store/constructorStore.ts', 'utf8');
const draft = fs.readFileSync('src/static-pages/constructor/hooks/useConstructorDraftLifecycle.ts', 'utf8');
const required = [
  'data-reset-stage="STAGE16"',
  'Контакты и условия заявки не удаляются',
  'Контакты, доставка, сборка и согласие сохранятся',
  'step: state.step',
  'contact: state.contact',
  'deliveryEnabled: state.deliveryEnabled'
];
for (const token of required) if (!page.includes(token) && !store.includes(token)) throw new Error(`Stage16 reset marker missing: ${token}`);
if (draft.includes('saveConstructorDraft(') || draft.includes('restoreConstructorDraftToStore(')) throw new Error('Autosave/draft restore must remain disabled');
console.log('Stage 16 reset/no-autosave guard passed');
