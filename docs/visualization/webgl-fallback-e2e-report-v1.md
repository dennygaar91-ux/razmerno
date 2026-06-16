# WebGL Fallback E2E Report v1

Дата: 2026-06-16
Задача: P1-10 WebGL Fallback E2E
Ветка: `p1-10-webgl-fallback-e2e`
PR: #45 `P1-10 WebGL Fallback E2E`
Статус документа: CI evidence recorded for PR head `f61324fb1de80167ee20c3092d8a049dba676bdd`. Final closure still requires merge into `main` and main content verification.

## 1. Executive Summary

P1-10 проверяет fail-safe поведение Constructor3D: если WebGL или Three.js runtime недоступен, пользователь должен остаться внутри актуального маршрута `/configurator-3d`, увидеть рабочее fallback-превью мебели, пройти основные шаги настройки, дойти до checkout и не быть заблокированным при отправке заявки.

В текущем коде уже был базовый fallback-путь: `Constructor3DPage` проверял WebGL diagnostics, отключал Three.js viewer при недоступном WebGL и рендерил `TwoDFallbackScene` на базе SVG/2D preview. Пробел был в доказуемости: не было отдельного P1-10 E2E, стабильного E2E marker, контролируемой симуляции WebGL failure, package scripts и явного QA workflow step.

В PR #45 добавлены:

- localhost-only test hook `?rzm_webgl=off` для безопасной симуляции WebGL failure;
- стабильные fallback-маркеры `data-testid="webgl-fallback-preview"` и `data-webgl-fallback="active"`;
- отдельный browser spec `tests/browser/webgl-fallback.spec.ts`;
- guard-script `scripts/check-p1-10-webgl-fallback-e2e.mjs`;
- npm scripts `check:webgl-fallback-e2e` и `test:webgl-fallback-e2e`;
- explicit QA workflow steps для P1-10.

## 2. Current WebGL Behavior

Текущий Constructor3D route содержит WebGL diagnostics и fallback decision:

1. `useWebGLDiagnostics()` возвращает статус `checking`, `available` или `unavailable`.
2. `canRenderThree` истинно только когда выбран режим `three`, WebGL доступен и Three.js runtime не упал.
3. Если `canRenderThree` ложно, рендерится `TwoDFallbackScene`.
4. Lazy Three.js viewer имеет runtime boundary, timeout и обработчик `webglcontextlost`.
5. Fallback остаётся внутри того же constructor shell, drawer, stepper, state и checkout flow.

Проверенные failure branches:

- WebGL context probe возвращает `null` → `status: unavailable` → fallback.
- WebGL probe выбрасывает ошибку → `status: unavailable` → fallback.
- Lazy Three viewer timeout → `three-load-timeout` → fallback/loading branch.
- React error boundary вокруг Three viewer → `three-boundary-error` → fallback/loading branch.
- `webglcontextlost` → `three-context-lost` → fallback.

## 3. Fallback Flow Map

Целевой flow P1-10:

```text
Constructor3D route /configurator-3d
↓
WebGL availability check
↓
Three.js scene init attempt
↓
WebGL failure detected or forced in E2E
↓
TwoDFallbackScene rendered inside the same viewport
↓
User continues dimensions/filling/materials configuration
↓
Checkout remains available
↓
Submit path remains available and uses the existing order flow
```

Fallback не является отдельной тупиковой страницей и не переводит пользователя на legacy route `/configurator`.

## 4. Fallback Implementation

PR #45 не переписывает основной 3D-конструктор и не делает полноценный инженерный 2D-режим.

Изменения:

- `src/static-pages/constructor/three/useWebGLAvailable.ts`
  - добавлен `isLocalhostFallbackProbeEnabled()`;
  - query-param `?rzm_webgl=off` работает только на `localhost`, `127.0.0.1` или `::1`;
  - при активном hook `detectWebGL()` возвращает `unavailable` с reason `e2e-forced-webgl-off`.

- `src/static-pages/constructor/components/SceneRuntimePanels.tsx`
  - fallback root получил stable E2E markers;
  - сохранены role/aria-label/status semantics;
  - визуальный preview остаётся через `ConstructorRealisticSvgModel`.

## 5. WebGL Failure Simulation

E2E использует двойной controlled simulation:

1. `page.addInitScript()` патчит `HTMLCanvasElement.prototype.getContext` и возвращает `null` для `webgl`, `webgl2`, `experimental-webgl`.
2. Route открывается как `/configurator-3d?rzm_webgl=off`, что включает localhost-only diagnostics hook.

Такой подход не добавляет пользовательский debug-toggle в UI и ограничен Playwright/local preview средой.

## 6. E2E Coverage

Новый файл: `tests/browser/webgl-fallback.spec.ts`.

Сценарии:

1. WebGL available → основной `.rzm-three-viewer` отображается, fallback marker отсутствует.
2. WebGL unavailable → отображается `webgl-fallback-preview`.
3. Fallback mode → пользователь может перейти с размеров к наполнению и материалам.
4. Fallback mode → изменение ширины не ломает fallback preview.
5. Fallback mode → пользователь доходит до checkout.
6. Fallback mode → submit path не блокируется из-за отсутствия WebGL.
7. WebGL failure не приводит к blank screen / unhandled error text.
8. Тест использует актуальный `/configurator-3d` и не откатывается на `/configurator`.

Submit-flow не дублирует весь P1-09, но доказывает, что fallback не блокирует путь до заявки и `POST /api/orders` остаётся доступен.

## 7. Guard-script Coverage

Новый файл: `scripts/check-p1-10-webgl-fallback-e2e.mjs`.

Guard проверяет:

- наличие `tests/browser/webgl-fallback.spec.ts`;
- использование `/configurator-3d?rzm_webgl=off`;
- mock `HTMLCanvasElement.prototype.getContext`;
- проверку `webgl`, `webgl2`, `experimental-webgl`;
- fallback marker `webgl-fallback-preview`;
- marker `data-webgl-fallback="active"`;
- checkout path и `POST /api/orders`;
- отсутствие legacy route `/configurator`;
- отсутствие старых legacy selectors;
- наличие fallback markers в component source;
- наличие package scripts;
- наличие explicit P1-10 steps в `.github/workflows/qa.yml`.

## 8. QA Workflow Integration

В `.github/workflows/qa.yml` добавлены explicit steps:

```yaml
- name: P1-10 WebGL fallback E2E guard
  run: npm run check:webgl-fallback-e2e

- name: P1-10 WebGL fallback E2E
  run: npm run test:webgl-fallback-e2e
```

Отдельный upload artifact для P1-10 не добавлен: при попытке записать расширенный workflow с отдельным P1-10 artifact upload GitHub connector заблокировал write-вызов. Поэтому evidence для P1-10 хранится в GitHub Actions step logs. Это допустимо для P1-10 closure, потому что workflow явно запускает оба P1-10 scripts, а job steps фиксируют их `success`.

## 9. CI Evidence

PR QA evidence:

- PR: #45 `P1-10 WebGL Fallback E2E`.
- Head commit: `f61324fb1de80167ee20c3092d8a049dba676bdd`.
- GitHub Actions workflow: `QA`.
- GitHub Actions run number: `194`.
- GitHub Actions run id: `27615964539`.
- Job: `Fast CI gate`.
- Job id: `81651836131`.
- Result: `success`.

Confirmed successful steps in run #194:

- `P1-10 WebGL fallback E2E guard` → `success`.
- `P1-10 WebGL fallback E2E` → `success`.
- `Typecheck frontend` → `success`.
- `Typecheck API` → `success`.
- `Build frontend` → `success`.
- `P1-09 Constructor3D submit E2E` → `success`.

Commands executed by workflow:

```bash
npm run check:webgl-fallback-e2e
npm run test:webgl-fallback-e2e
```

Artifact note: run #194 uploaded the shared `coverage-summary`, `repository-infrastructure-inventory`, and existing P1-09 artifacts. No separate P1-10 artifact exists in run #194; P1-10 evidence is the workflow step summary/logs.

## 10. Remaining Risks

1. Cross-browser/mobile fallback matrix remains outside P1-10.
2. Fallback is MVP fail-safe preview, not production engineering 2D drawing.
3. P1-10 evidence is step-log based rather than a separate P1-10 artifact.
4. This report records PR QA evidence for head `f61324fb1de80167ee20c3092d8a049dba676bdd`; if documentation-only commits are added after this report, the final merge should use the latest successful PR QA run for the final head.

## 11. Closure Review

Closure checklist based on PR QA run #194:

1. Рабочий WebGL fallback — implemented.
2. Simulated WebGL failure — implemented via localhost query hook + Playwright getContext mock.
3. Fallback не ломает constructor state — covered by P1-10 E2E.
4. Fallback позволяет пройти к checkout — covered by P1-10 E2E.
5. Fallback не блокирует submit path — covered by P1-10 E2E.
6. Separate E2E test file — implemented.
7. Guard-script — implemented and passed in CI.
8. Package scripts — implemented.
9. QA workflow explicit steps — implemented and passed in CI.
10. GitHub Actions QA run success — run #194 / id `27615964539` success.
11. CI logs/evidence — workflow step summary confirms both P1-10 steps success.
12. Report — created and updated with CI evidence.
13. current-backlog update — updated in PR branch.
14. PR merged in main — pending at the time of this report update.
15. main content verification — pending at the time of this report update.

Decision: P1-10 implementation and PR QA evidence are complete. Final project-level closure requires PR #45 merge into `main` and main content verification.
