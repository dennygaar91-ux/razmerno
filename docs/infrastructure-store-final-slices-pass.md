# Infrastructure Store Final Slices Pass

Дата: 2026-06-10

## Цель

Увеличенный infrastructure pass по `constructorStore.ts`: вынести оставшиеся рискованные, но уже локализованные action-группы в отдельные slices без изменения поведения проекта.

Запрещённые изменения соблюдены: бизнес-логика, pricing, checkout submit, validation rules, Three.js, CSS, routing, UX, дизайн и legacy quarantine не менялись.

## Что вынесено

### 1. Filling slice

Файл: `src/static-pages/constructor/store/constructorFillingSlice.ts`

Вынесены actions:

- `setCompartmentFilling`
- `addShelfToCompartment`
- `removeShelfDivider`
- `removeCompartmentElement`

### 2. Random preset slice

Файл: `src/static-pages/constructor/store/constructorRandomPresetSlice.ts`

Вынесен action:

- `applyRandomPresetToSection`

### 3. Auto-fix slice

Файл: `src/static-pages/constructor/store/constructorAutoFixSlice.ts`

Вынесен action:

- `applyAutoFixForIssue`

## Результат

`constructorStore.ts` стал почти чистым composition root.

- До всей store-декомпозиции: ~1672 строки.
- Перед этим pass: ~559 строк.
- После этого pass: 36 строк.

Store теперь собирается из slices:

- furniture/dimensions;
- sections;
- compartments/zones;
- filling;
- random preset;
- auto-fix;
- facades;
- materials;
- utility;
- scene;
- production snapshot;
- checkout.

## Проверки

Успешно прошли:

```bash
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Остаточные риски

1. `projectRules.ts` остаётся rules-монолитом.
2. `constructor3d.css` и `constructor.css` остаются CSS-монолитами.
3. `threeSceneAdapter.ts` остаётся крупным adapter-файлом.
4. Full browser E2E всё ещё нужно повторить локально/в CI с установленным Playwright Chromium.

## Следующий безопасный шаг

Следующий инфраструктурный этап лучше направить на `projectRules.ts`:

1. сначала вынести pure limits/constants;
2. затем material validation helpers;
3. затем facade validation helpers;
4. затем filling validation helpers;
5. auto-fix/rules менять последними.

CSS cleanup и Three adapter split лучше делать после отдельного visual/browser QA.
