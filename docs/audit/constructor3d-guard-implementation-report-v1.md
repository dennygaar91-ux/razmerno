# Constructor3D Guard Implementation Report v1

Статус: PARTIAL IMPLEMENTATION.

Дата: 2026-06-14.

Роль: Architect Agent.

## 1. Scope

Выполнялась задача:

`Architect Agent — Constructor3D Guard Implementation`.

Основание:

- `docs/planning/agent-task-constructor3d-guard-implementation-v1.md`
- `docs/planning/constructor3d-guard-spec-v1.md`
- `docs/audit/guard-audit-v1.md`
- `docs/audit/constructor3d-dependency-map-v1.md`
- `docs/audit/architecture-risk-register-v1.md`

## 2. Что изменено

Создан файл:

```txt
scripts/check-constructor3d-architecture.mjs
```

Runtime-код не изменялся.

Не изменялись:

- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/**`
- `src/configurator/**`
- pricing
- checkout
- Three.js runtime
- API
- Supabase
- production layer
- admin
- CSS
- tests поведения
- legacy routes

## 3. Что реализует guard

Script:

- сканирует active Constructor3D scope;
- использует только filesystem reads;
- не импортирует runtime modules;
- проверяет required active files;
- ищет static imports;
- ищет dynamic imports;
- ищет require;
- ищет export-from imports;
- нормализует relative imports;
- проверяет legacy imports;
- проверяет layer violations;
- проверяет page bypass;
- проверяет line thresholds;
- выводит grouped errors/warnings;
- завершает процесс с `exit 1` при hard errors.

## 4. Hard-fail категории

Guard должен падать при:

- missing required active files;
- active import from `src/configurator/**`;
- active import from legacy `ConstructorPage`;
- active import from deprecated `src/constructor/*` modules;
- forbidden page/component imports from API/Supabase/admin/production mutation layer;
- Three.js layer importing pricing/checkout/API/Supabase;
- store layer importing API/Supabase/admin/server-only modules;
- direct pricing import from `Constructor3DPage.tsx`;
- direct `fetch()` call in `Constructor3DPage.tsx`;
- `Constructor3DPage.tsx` exceeding hard line limit.

## 5. Warning categories

Guard warns on:

- `Constructor3DPage.tsx` over warning threshold;
- `useConstructorPageState.ts` breadth;
- `constructorSelectors.ts` breadth;
- component file breadth;
- slice file breadth;
- `constructorStore.ts` breadth;
- historical package script families.

Warnings do not fail the build initially.

## 6. Package script status

`package.json` was not updated in this pass.

Reason:

The available GitHub connector action for `package.json` update requires a full file replacement. The file is very large and contains long historical script lines. A partial or manually reconstructed replacement would be unsafe and could corrupt existing scripts.

Required follow-up change:

Add this script safely from a local checkout or a patch-capable environment:

```json
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"
```

Recommended position:

near existing constructor architecture scripts:

```json
"check:constructor-architecture": "node scripts/check-constructor-architecture.mjs",
"check:constructor3d-guard": "node scripts/check-constructor3d-architecture.mjs"
```

Do not add it to `qa:all` until QA command map is complete.

## 7. Checks run

Checks were not run in this environment.

Reason:

This execution used GitHub connector operations only. No local checkout / shell runtime with repository files was available through the connector. Attempting to clone from GitHub in the local container failed due DNS/network resolution.

Required follow-up commands in a local/dev environment:

```bash
node scripts/check-constructor3d-architecture.mjs
npm run typecheck
```

After adding package script:

```bash
npm run check:constructor3d-guard
```

## 8. Acceptance status

Completed:

- script file exists;
- active scope scanning implemented;
- legacy import hard-fail implemented;
- layer violation hard-fail implemented;
- required files hard-fail implemented;
- warning thresholds implemented;
- runtime untouched.

Not completed:

- package script not added;
- guard not executed;
- typecheck not executed.

## 9. Remaining risks

1. Required file list may need adjustment if current implementation uses a renamed WebGL hook.
2. Regex-based import scanning is intentionally lightweight; future QA Agent may replace it with AST/parser-based guard.
3. Package script must be added before this guard becomes ergonomic for agents.
4. The guard should be run once locally before allowing runtime branches to proceed.

## 10. Architect decision

This is a partial implementation.

Do not unblock Constructor Core / Three.js / Pricing / Checkout runtime branches yet.

The architecture gate is considered implemented only after:

1. `package.json` includes `check:constructor3d-guard`.
2. `npm run check:constructor3d-guard` passes or produces known intentional warnings only.
3. Architect Agent reviews the output.
