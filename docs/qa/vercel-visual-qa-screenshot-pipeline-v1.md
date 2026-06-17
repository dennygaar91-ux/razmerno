# Vercel Visual QA Screenshot Pipeline v1 — Размерно

Дата: 2026-06-17  
Роль: 05 Infrastructure / QA Agent  
Статус: pipeline created / timeout diagnostics hardened  
Scope: infrastructure / QA only

## 1. Зачем нужен pipeline

`docs/ux/release-visual-qa-matrix-v1.md` требует фактических browser screenshots для landing, info pages, Constructor3D, responsive states, WebGL fallback и admin route. Pipeline создаёт infrastructure toolchain для получения screenshot artifact из GitHub Actions вручную через `workflow_dispatch`.

Важно: pipeline только создаёт способ получить screenshots. Он не выполняет UX/UI visual review автоматически и не закрывает visual QA screenshot pass.

## 2. Почему добавлен timeout diagnostics guard

После merge PR #59 workflow `Vercel Visual QA Screenshots #5` был отменён по общему лимиту job:

```text
exceeded maximum execution time 20m0s
No files were found with the provided path: visual-qa-screenshots/
No artifacts will be uploaded
The operation was canceled
```

Это не доказывает, что Constructor/CSS сломан. Это показывает, что screenshot capture step завис до общего workflow timeout и не успел записать artifact. Поэтому pipeline усилен:

- per-route/per-viewport diagnostic logs;
- per-capture timeout guard;
- manifest, который пишется на старте и после каждого capture;
- partial artifact upload даже при failed/timeout captures;
- отдельная post-upload manifest validation step.

## 3. Что входит в pipeline

Файлы pipeline:

- `.github/workflows/vercel-visual-qa-screenshots.yml`;
- `scripts/capture-vercel-visual-qa-screenshots.mjs`;
- `docs/qa/vercel-visual-qa-screenshot-pipeline-v1.md`.

Не менялись:

- UI / CSS / components;
- Pricing;
- API business logic;
- Three.js runtime/product logic;
- Production / Manufacturing logic;
- `package.json`;
- `vercel.json`;
- GitHub issues.

## 4. Как запускать workflow

Открыть GitHub Actions:

```text
Actions → Vercel Visual QA Screenshots → Run workflow
```

Минимальный input:

```text
target_url = https://<ready-vercel-preview-or-production-url>
```

Рекомендуемые значения по умолчанию:

```text
capture_webgl_fallback = true
routes = /,/measurements,/materials,/assembly,/configurator,/configurator-3d,/admin
upload_retention_days = 14
```

## 5. Workflow inputs

| Input | Required | Default | Description |
|---|---:|---|---|
| `target_url` | yes | — | Ready Vercel Preview/Production URL. Must start with `https://`, must not be localhost. |
| `capture_webgl_fallback` | no | `true` | Captures additional WebGL fallback screenshots through Playwright-side mocking. |
| `routes` | no | standard route list | Comma-separated route list. |
| `upload_retention_days` | no | `14` | Artifact retention days, validated as integer 1–90. |

The workflow validates `target_url` before screenshot capture and does not print secrets.

## 6. Routes covered by default

Default route list:

- `/`;
- `/measurements`;
- `/materials`;
- `/assembly`;
- `/configurator`;
- `/configurator-3d`;
- `/admin`.

`vercel.json` currently guarantees direct deploy rewrites only for `/configurator` and `/configurator/(.*)`. To avoid capturing Vercel platform 404 pages for SPA-only routes, the script captures non-direct routes through the deployable `/configurator` entry and then switches the browser URL inside Playwright using client-side history navigation.

If a route returns `404`, `401`, `403`, or another warning state after the deployable entry cannot be reached, the script still captures a screenshot when possible and marks the capture as `warning` in the manifest. A single inaccessible optional route does not prevent partial artifact creation.

## 7. Viewports covered by default

Default viewport list:

- `desktop-1440`: `1440×900`;
- `laptop-1280`: `1280×800`;
- `tablet-768`: `768×1024`;
- `mobile-390`: `390×844`;
- `mobile-375`: `375×812`.

## 8. Screenshot naming convention

Screenshots are saved as:

```text
<route-slug>__<viewport-name>.png
```

Examples:

```text
home__desktop-1440.png
configurator-3d__mobile-390.png
```

WebGL fallback screenshots are saved as:

```text
configurator-3d-webgl-fallback__desktop-1440.png
configurator-3d-webgl-fallback__mobile-390.png
```

## 9. Artifact structure

Artifact name:

```text
vercel-visual-qa-screenshots-<github-run-id>
```

Artifact directory:

```text
visual-qa-screenshots/
  manifest.json
  manifest.md
  screenshots/
    home__desktop-1440.png
    home__mobile-390.png
    configurator-3d__desktop-1440.png
    configurator-3d-webgl-fallback__desktop-1440.png
    ...
```

The artifact upload step runs with `if: always()` and `if-no-files-found: warn`. A separate validation step runs after upload and can fail the workflow if manifest evidence shows zero screenshots or failed/timeout captures.

## 10. Manifest fields

`manifest.json` and `manifest.md` include:

- `startedAt`;
- `completedAt`;
- `artifactGenerated`;
- `targetUrl`;
- commit SHA;
- workflow run id;
- workflow name;
- ref/branch name;
- route list;
- viewport list;
- timeout settings;
- total planned captures;
- completed captures;
- successful captures;
- failed captures;
- skipped captures;
- per-capture duration;
- per-capture status;
- per-capture error message;
- last attempted route/viewport/mode;
- WebGL fallback capture status;
- console error count.

Interpretation:

- `ok` — screenshot was captured and HTTP status did not indicate route failure;
- `warning` — screenshot may exist, but route returned 4xx/5xx/unknown status;
- `error` — navigation/screenshot had an error; diagnostic screenshot is attempted;
- `timeout` — one route/viewport exceeded the per-capture guard and the pipeline continued;
- pipeline validation fails after artifact upload if zero screenshots exist or any captures fail/timeout.

## 11. Timeout guards

Current timeout defaults:

```text
goto timeout: 30000ms
settle timeout: 12000ms
screenshot timeout: 15000ms
single capture timeout: 75000ms
job timeout: 30m
```

The script logs before every capture:

```text
[visual-qa] Capturing route=/configurator-3d viewport=mobile-390 size=390x844 mode=normal output=configurator-3d__mobile-390.png startedAt=...
```

If a capture times out, the script logs:

```text
[visual-qa] TIMEOUT route=/configurator-3d viewport=mobile-390 mode=normal after 75000ms
```

The manifest records the timeout and the script continues to the next route/viewport.

## 12. WebGL fallback strategy

The existing `?rzm_webgl=off` hook is localhost-only and must not be counted as Vercel fallback evidence.

This pipeline uses Playwright-side WebGL mocking without product-code changes:

- a separate browser context is created for fallback capture;
- `HTMLCanvasElement.prototype.getContext` is overridden through `context.addInitScript`;
- calls for `webgl`, `webgl2`, and `experimental-webgl` return `null`;
- other context types are passed to the original method;
- this is applied only in the fallback screenshot capture context;
- no application code, Three.js runtime logic, CSS, or product behavior is changed.

Fallback screenshots are captured for:

- `/configurator-3d` at `desktop-1440`;
- `/configurator-3d` at `mobile-390`.

## 13. Limitations

- This workflow captures Chromium screenshots only. Cross-browser coverage remains a follow-up.
- It does not interact through every constructor step/state; it captures default route states and fallback state.
- It does not judge visual quality. UX/UI Agent must review the artifact and create product visual findings.
- It does not close VQA-001—VQA-005 or P2-26 by itself.
- If `workflow_dispatch` cannot be started from the agent toolset, status remains `pipeline fix merged / awaiting manual workflow_dispatch`.

## 14. QA expectations

Expected PR validation:

- main QA workflow should pass because product code is not changed;
- workflow YAML should be syntactically valid;
- script should run in Node 22 after `npm ci` and `npx playwright install --with-deps chromium`;
- workflow_dispatch should be run manually against a Ready Vercel URL to produce the artifact.

## 15. Next step after merge

After this PR is merged:

1. Run `Vercel Visual QA Screenshots` manually from GitHub Actions.
2. Use a Ready Vercel Preview/Production URL as `target_url`.
3. Download artifact `vercel-visual-qa-screenshots-<run-id>`.
4. Pass `manifest.json`, `manifest.md`, and screenshots to `08 UX/UI / Design System Agent`.
5. UX/UI Agent performs the actual visual review and creates findings.

## 16. Closure review

| Criterion | Status |
|---|---|
| workflow_dispatch screenshot pipeline created | Done |
| per-route/per-viewport diagnostic logs | Implemented |
| per-capture timeout guard | Implemented |
| partial manifest write during run | Implemented |
| partial artifact upload before final validation | Implemented |
| post-upload manifest validation | Implemented |
| SPA-safe route capture without `vercel.json` changes | Implemented |
| Playwright-side WebGL fallback mocking | Implemented |
| product UI/CSS/components changed | No |
| pricing/API/Three.js/production logic changed | No |
| package.json changed | No |
| vercel.json changed | No |
| GitHub issues touched | No |
| workflow_dispatch artifact obtained after fix | Pending manual run |
| visual QA screenshot pass completed | No — explicitly out of scope |

Final status before manual run:

```text
pipeline fixed / awaiting workflow_dispatch
```
