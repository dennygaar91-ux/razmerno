# Vercel Visual QA Timeout Diagnostics v1 — Размерно

Дата: 2026-06-17  
Роль: 05 Infrastructure / QA Agent  
Задача: Vercel Visual QA Timeout Diagnostics and Per-Route Capture Guard  
Scope: infrastructure / QA only

## 1. Причина задачи

После merge PR #59 был запущен workflow `Vercel Visual QA Screenshots #5` на `main`.

Зафиксированный результат:

```text
cancelled
exceeded maximum execution time 20m0s
No files were found with the provided path: visual-qa-screenshots/
No artifacts will be uploaded
The operation was canceled
```

Это не доказывает, что CSS/Constructor сломан. Это означает, что screenshot pipeline завис на capture step и не успел записать artifact.

## 2. Диагностический вывод

Текущий доступный GitHub wrapper не вернул manual workflow run для commit `cc42cacd8f13fdd202a1dcd937db9151068c227a`, поэтому raw logs failed workflow #5 через connector не были доступны.

Кодовая проверка pipeline показала достаточную причину для infrastructure fix:

- workflow имел общий `timeout-minutes: 20`;
- script не имел total per-capture timeout;
- manifest записывался только после завершения всех captures;
- при зависании одного route/viewport workflow мог быть отменён до создания `visual-qa-screenshots/`;
- artifact upload был `if: always()`, но `if-no-files-found: error`, поэтому при отсутствии папки artifact не создавался.

## 3. Что исправлено

Файлы в scope:

- `.github/workflows/vercel-visual-qa-screenshots.yml`;
- `scripts/capture-vercel-visual-qa-screenshots.mjs`;
- `docs/qa/vercel-visual-qa-screenshot-pipeline-v1.md`;
- `docs/qa/vercel-visual-qa-timeout-diagnostics-v1.md`;
- `docs/planning/current-backlog.md` — только если точечное обновление применено безопасно.

Product/UI/CSS/API/Pricing/Three.js/Production logic не менялись.

## 4. Workflow hardening

Workflow усилен так:

- `timeout-minutes` увеличен с `20` до `30`;
- `Capture screenshots` получил `continue-on-error: true`;
- artifact upload остаётся `if: always()`;
- `if-no-files-found` изменён на `warn`, чтобы validation step давал точную ошибку;
- добавлен отдельный `Validate screenshot manifest` после upload;
- validation fail происходит только после попытки upload artifact.

## 5. Script hardening

Script усилен так:

- пишет manifest на старте до запуска browser capture;
- пишет manifest после каждого route/viewport capture;
- логирует каждый capture до старта:

```text
[visual-qa] Capturing route=/configurator-3d viewport=mobile-390 size=390x844 mode=normal output=configurator-3d__mobile-390.png startedAt=...
```

- логирует timeout:

```text
[visual-qa] TIMEOUT route=/configurator-3d viewport=mobile-390 mode=normal after 75000ms
```

- добавляет per-capture timeout guard;
- добавляет duration per capture;
- добавляет `lastAttemptedCapture`;
- продолжает следующие captures после failed/timeout capture;
- пытается записать diagnostic screenshot при ошибке/timeout;
- сохраняет partial artifact evidence.

## 6. Timeout settings

Текущие значения:

```text
goto timeout: 30000ms
settle timeout: 12000ms
screenshot timeout: 15000ms
single capture timeout: 75000ms
job timeout: 30m
```

## 7. Manifest additions

Manifest теперь фиксирует:

- `startedAt`;
- `completedAt`;
- `artifactGenerated`;
- target URL;
- commit SHA;
- workflow run id;
- total planned captures;
- completed captures;
- screenshots written;
- failed captures;
- skipped captures;
- timeout captures;
- console error count;
- per-capture duration;
- per-capture status;
- per-capture error message;
- last attempted route/viewport/mode;
- WebGL fallback capture status.

## 8. Expected result after merge

После merge нужно вручную запустить:

```text
Actions → Vercel Visual QA Screenshots → Run workflow
```

Input:

```text
branch: main
target_url: https://razmerno.vercel.app
capture_webgl_fallback: true
routes: /,/measurements,/materials,/assembly,/configurator,/configurator-3d,/admin
upload_retention_days: 14
```

Ожидаемый результат:

- workflow больше не должен висеть 20 минут из-за одного route/viewport;
- artifact должен быть создан даже при partial failure;
- manifest должен показать, какой route/viewport/mode упал или завис;
- VQA-001—VQA-005 остаются pending до visual review.

## 9. Closure status

До merge и ручного rerun:

```text
pipeline fixed / awaiting workflow_dispatch
```

После rerun:

- если artifact получен и manifest валиден: `pipeline fixed / artifact obtained`;
- если artifact получен с failed captures: `pipeline fixed / artifact uploaded with failed captures`;
- если artifact не получен: `still blocked`.

Эта infrastructure-задача не закрывает VQA-001—VQA-005 и не закрывает P2-26.
