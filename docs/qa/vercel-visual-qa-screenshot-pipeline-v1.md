# Vercel Visual QA Screenshot Pipeline v1 — Размерно

Дата: 2026-06-17  
Роль: 05 Infrastructure / QA Agent  
Статус: pipeline created / pending workflow_dispatch run  
Scope: infrastructure / QA only

## 1. Зачем нужен pipeline

`docs/ux/release-visual-qa-matrix-v1.md` требует фактических browser screenshots для landing, info pages, Constructor3D, responsive states, WebGL fallback и admin route. После закрытия P1-22 Vercel deployment blocker снят, но `docs/ux/vercel-visual-qa-screenshot-pass-v1.md` зафиксировал, что фактический visual QA pass заблокирован: screenshots не были получены, routes/viewports не были визуально проверены, а существующие GitHub Actions artifacts не покрывают release visual QA matrix.

Этот PR создаёт infrastructure toolchain для получения screenshot artifact из GitHub Actions вручную через `workflow_dispatch`.

Важно: pipeline только создаёт способ получить screenshots. Он не выполняет UX/UI visual review автоматически и не закрывает visual QA screenshot pass.

## 2. Что добавлено

Добавлены:

- `.github/workflows/vercel-visual-qa-screenshots.yml`;
- `scripts/capture-vercel-visual-qa-screenshots.mjs`;
- этот документ;
- точечное обновление `docs/planning/current-backlog.md` о том, что screenshot artifact pipeline создан, а visual QA pass остаётся открытым до фактической проверки UX/UI Agent.

Не менялись:

- UI / CSS / components;
- Pricing;
- API business logic;
- Three.js runtime/product logic;
- Production / Manufacturing logic;
- `package.json`;
- GitHub issues.

## 3. Как запускать workflow

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

## 4. Workflow inputs

| Input | Required | Default | Description |
|---|---:|---|---|
| `target_url` | yes | — | Ready Vercel Preview/Production URL. Must start with `https://`, must not be localhost. |
| `capture_webgl_fallback` | no | `true` | Captures additional WebGL fallback screenshots through Playwright-side mocking. |
| `routes` | no | standard route list | Comma-separated route list. |
| `upload_retention_days` | no | `14` | Artifact retention days, validated as integer 1–90. |

The workflow validates `target_url` before screenshot capture and does not print secrets.

## 5. Routes covered by default

Default route list:

- `/`;
- `/measurements`;
- `/materials`;
- `/assembly`;
- `/configurator`;
- `/configurator-3d`;
- `/admin`.

If a route returns `404`, `401`, `403`, or another warning state, the script still captures a screenshot when possible and marks the capture as `warning` in the manifest. A single inaccessible optional route does not fail the pipeline.

## 6. Viewports covered by default

Default viewport list:

- `desktop-1440`: `1440×900`;
- `laptop-1280`: `1280×800`;
- `tablet-768`: `768×1024`;
- `mobile-390`: `390×844`;
- `mobile-375`: `375×812`.

## 7. Screenshot naming convention

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

## 8. Artifact structure

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

## 9. Manifest fields

`manifest.json` and `manifest.md` include:

- `target_url`;
- commit SHA;
- workflow run id;
- workflow name;
- ref/branch name;
- route list;
- viewport list;
- timestamp;
- success/warning/error per screenshot;
- HTTP status if available;
- screenshot filename;
- console error count;
- WebGL fallback marker;
- skipped/warning reasons.

Interpretation:

- `ok` — screenshot was captured and HTTP status did not indicate route failure;
- `warning` — screenshot may exist, but route returned 4xx/5xx/unknown status;
- `error` — navigation/screenshot had an error; if any diagnostic screenshot exists, the manifest references it;
- pipeline exits non-zero only for systemic failures, such as invalid input or no screenshots written at all.

## 10. WebGL fallback strategy

The existing `?rzm_webgl=off` hook is localhost-only and must not be counted as Vercel fallback evidence.

This pipeline uses the preferred safe strategy: Playwright-side WebGL mocking without product-code changes.

Mechanism:

- a separate browser context is created for fallback capture;
- `HTMLCanvasElement.prototype.getContext` is overridden through `context.addInitScript`;
- calls for `webgl`, `webgl2`, and `experimental-webgl` return `null`;
- other context types are passed to the original method;
- this is applied only in the fallback screenshot capture context;
- no application code, Three.js runtime logic, CSS, or product behavior is changed.

Fallback screenshots are captured for:

- `/configurator-3d` at `desktop-1440`;
- `/configurator-3d` at `mobile-390`.

## 11. Limitations

- This workflow captures Chromium screenshots only. Cross-browser coverage remains a follow-up for P2-21.
- It does not interact through every constructor step/state; it captures default route states and fallback state. Deeper forced checkout/error/success states remain UX/UI/Product follow-up work.
- It does not judge visual quality. UX/UI Agent must review the artifact and create product visual findings.
- It does not close P2-20/P2-21 by itself.
- If the workflow is not manually run after merge, status remains `pipeline created / not yet run`.

## 12. QA expectations

Expected PR validation:

- main QA workflow should pass because product code is not changed;
- workflow YAML should be syntactically valid;
- script should run in Node 22 after `npm ci` and `npx playwright install --with-deps chromium`;
- workflow_dispatch should be run manually against a Ready Vercel URL to produce the artifact.

If workflow_dispatch cannot be started from the agent toolset, the PR can only be reported as:

```text
pipeline created / not yet run
```

## 13. Next step after merge

After this PR is merged:

1. Run `Vercel Visual QA Screenshots` manually from GitHub Actions.
2. Use a Ready Vercel Preview/Production URL as `target_url`.
3. Download artifact `vercel-visual-qa-screenshots-<run-id>`.
4. Pass `manifest.json`, `manifest.md`, and screenshots to `08 UX/UI / Design System Agent`.
5. UX/UI Agent performs the actual visual review and creates findings.

## 14. Closure review

| Criterion | Status |
|---|---|
| workflow_dispatch screenshot pipeline created | Done in PR |
| screenshot capture script created | Done in PR |
| manifest JSON/Markdown generated by script | Implemented |
| Playwright-side WebGL fallback mocking | Implemented |
| product UI/CSS/components changed | No |
| pricing/API/Three.js/production logic changed | No |
| package.json changed | No |
| GitHub issues touched | No |
| workflow_dispatch artifact obtained | Pending manual run |
| visual QA screenshot pass completed | No — explicitly out of scope |

Final status for this PR before manual run:

```text
pipeline created / not yet run
```
