# Constructor3D Submit E2E Report v1

Дата: 2026-06-16
Задача: P1-09 Constructor3D Submit E2E
PR: #44 — `P1-09 Constructor3D Submit E2E`
Ветка: `p1-09-constructor3d-submit-e2e-fix`
Итоговый CI evidence commit: `3a1fb10462c358698f16002ce77e0465518adad2`
GitHub Actions QA run: `189` (`27611519384`)

## 1. Executive Summary

P1-09 закрыта после подтверждённого GitHub Actions QA evidence.

Новый Constructor3D submit E2E теперь не просто существует в репозитории, а явно подключён к npm scripts и обязательному QA workflow. В run `189` QA workflow завершился `success`, а CI evidence artifact `p1-09-constructor-submit-ci-evidence` подтвердил фактическое выполнение обеих команд:

- `npm run check:constructor-submit-e2e`
- `npm run test:constructor-submit-e2e`

Playwright результат: `5 passed (39.6s)`.

## 2. Что было не засчитано в предыдущем проходе

Предыдущий проход не был засчитан по честной причине: тест `tests/browser/constructor-submit.spec.ts` уже был написан, но не было доказано, что он входит в обязательный CI-gate.

Проблемы предыдущего состояния:

- `tests/browser/constructor-submit.spec.ts` мог запускаться только широкой командой `npm run test:browser`.
- Focused Constructor3D browser-команда покрывала только `tests/browser/configurator3d.spec.ts`.
- Guard-script `scripts/check-p1-09-constructor3d-submit-e2e.mjs` не был подключён к npm scripts.
- QA workflow не запускал ни submit E2E, ни guard-script.
- Поэтому P1-09 имела статус `implementation exists / CI gate missing / not closed`.

## 3. Что исправлено сейчас

В этом проходе исправлены три слоя:

1. Package scripts:
   - добавлен `check:constructor-submit-e2e`;
   - добавлен `test:constructor-submit-e2e`.

2. QA workflow:
   - guard-script запускается явно в Fast CI gate;
   - Playwright submit E2E запускается явно в Fast CI gate;
   - добавлен CI evidence artifact с фактическим выводом команд;
   - добавлен upload Playwright report/test-results для диагностики.

3. Runtime bug, найденный настоящим E2E:
   - `useConstructorQuote` выставлял `quoteStatus` в `calculating`, но после успешного расчёта не переводил состояние в `ready`;
   - из-за этого UI бесконечно показывал `Пересчитываем...`;
   - исправлено точечно: после успешного `setQuote(...)` теперь вызывается `setQuoteStatus("ready")`;
   - pricing/API/Supabase/production/Three.js architecture не менялись.

## 4. Package scripts

В `package.json` добавлены:

```json
"check:constructor-submit-e2e": "node scripts/check-p1-09-constructor3d-submit-e2e.mjs",
"test:constructor-submit-e2e": "playwright test tests/browser/constructor-submit.spec.ts --project=chromium-desktop"
```

Существующий `test:constructor3d-e2e` не удалялся и не переименовывался.

## 5. QA workflow integration

В `.github/workflows/qa.yml` добавлены steps в job `Fast CI gate` после fast active tests и перед coverage/architecture guards:

```yaml
- name: P1-09 Constructor3D submit E2E guard
  run: |
    echo "npm run check:constructor-submit-e2e" | tee -a p1-09-ci-evidence.log
    npm run check:constructor-submit-e2e 2>&1 | tee -a p1-09-ci-evidence.log

- name: Install Playwright Chromium
  run: npx playwright install --with-deps chromium

- name: P1-09 Constructor3D submit E2E
  run: |
    echo "npm run test:constructor-submit-e2e" | tee -a p1-09-ci-evidence.log
    npm run test:constructor-submit-e2e 2>&1 | tee -a p1-09-ci-evidence.log

- name: Upload P1-09 CI evidence log
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: p1-09-constructor-submit-ci-evidence
    path: p1-09-ci-evidence.log
    if-no-files-found: error
    retention-days: 14
```

## 6. Constructor3D Submit E2E coverage

`tests/browser/constructor-submit.spec.ts` покрывает:

1. Успешную заявку без доставки и сборки.
2. Успешную заявку с доставкой и сборкой.
3. Заблокированную отправку без обязательных полей до любого API request.
4. RU phone validation до API request.
5. API error response без потери checkout state.

Дополнительно тест проверяет:

- открытие `/configurator-3d`;
- активный marker `data-checkout-stage="STAGE15"`;
- реальный flow `Размеры → Наполнение → Материалы → Заявка`;
- `POST /api/orders`;
- `Content-Type: application/json`;
- `Idempotency-Key` формата `RZ-YYYYMMDD-NNNN`;
- production-shaped `OrderPayload`;
- отсутствие legacy fields `contact`, `deliveryEnabled`, `deliveryAddress`, `assemblyEnabled`.

## 7. Guard-script coverage

`scripts/check-p1-09-constructor3d-submit-e2e.mjs` защищает submit E2E от отката на legacy implementation.

Guard проверяет, что тест:

- открывает `/configurator-3d`;
- проверяет `data-checkout-stage="STAGE15"`;
- проверяет `POST /api/orders`;
- проверяет `Idempotency-Key`;
- проверяет `payload.customer`, `payload.delivery`, `payload.assembly`, `payload.consent`;
- не использует legacy route `/configurator`;
- не использует legacy selectors `.rzm-r19-workspace`, `.rzm-constructor-stepper`;
- не использует legacy payload fields `payload.contact`, `deliveryEnabled`, `deliveryAddress`, `assemblyEnabled`.

## 8. CI Evidence

GitHub Actions QA run:

- Run number: `189`
- Run id: `27611519384`
- Head commit: `3a1fb10462c358698f16002ce77e0465518adad2`
- Job: `Fast CI gate`
- Result: `success`

Relevant successful steps:

- `P1-09 Constructor3D submit E2E guard` — success
- `Install Playwright Chromium` — success
- `P1-09 Constructor3D submit E2E` — success
- `Upload P1-09 CI evidence log` — success
- `Upload P1-09 Playwright report` — success
- `Coverage snapshot` — success
- `Check CSS architecture` — success
- `Check production geometry architecture` — success

CI evidence artifact: `p1-09-constructor-submit-ci-evidence`.

Artifact content confirmed:

```text
npm run check:constructor-submit-e2e

> razmerno-constructor@0.0.0 check:constructor-submit-e2e
> node scripts/check-p1-09-constructor3d-submit-e2e.mjs

P1-09 Constructor3D submit E2E guard passed.

npm run test:constructor-submit-e2e

> razmerno-constructor@0.0.0 test:constructor-submit-e2e
> playwright test tests/browser/constructor-submit.spec.ts --project=chromium-desktop

Running 5 tests using 1 worker
5 passed (39.6s)
```

## 9. P1-09 Closure Review

Closure criteria:

1. `tests/browser/constructor-submit.spec.ts` exists — yes.
2. `test:constructor-submit-e2e` exists in `package.json` — yes.
3. `check:constructor-submit-e2e` exists in `package.json` — yes.
4. QA workflow explicitly runs both scripts — yes.
5. GitHub Actions run completed `success` — yes, run `189`.
6. CI evidence shows both commands actually executed — yes, artifact `p1-09-constructor-submit-ci-evidence`.
7. `docs/planning/current-backlog.md` updated — yes, P1-09 marked closed.
8. `docs/constructor/constructor-submit-e2e-report-v1.md` updated — yes.

Decision: P1-09 is closed.

P1-21 status: unchanged, open. P1-21 was not part of this task and was not closed.

## 10. Remaining Risks

1. The E2E currently runs only on `chromium-desktop`. Cross-browser/full matrix remains outside P1-09 and belongs to later QA/release scope.
2. WebGL fallback submit E2E remains open as P1-10.
3. Existing `tests/browser/configurator3d.spec.ts` may still need separate modernization, but that is not part of P1-09 closure.
4. The quote status bug was fixed only at state level; deeper pricing parity remains governed by P0-03/P0-13 and was not changed here.
5. Playwright runtime is now part of Fast CI gate, so future CI duration may increase; if this becomes a bottleneck, move broader browser matrix to P1-14/P1-15 while keeping P1-09 critical submit check in a required gate.
