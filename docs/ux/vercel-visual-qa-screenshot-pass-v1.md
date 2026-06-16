# Vercel Visual QA Screenshot Pass v1 — Размерно

Дата: 2026-06-17  
Роль: 08 UX/UI / Design System Agent  
Статус: blocked / not executed  
Scope: UX/UI / Design System QA only

## 1. Summary

Планировалось выполнить фактический Vercel-based visual QA screenshot pass после закрытия P1-22 по матрице `docs/ux/release-visual-qa-matrix-v1.md`.

Фактический результат: screenshots не получены, routes/viewports не проверены визуально, visual QA не закрыт.

Причина: в текущем tool/runtime не было доступного способа открыть Vercel deployment в browser screenshot режиме, а в репозитории нет существующего Vercel visual screenshot artifact pipeline для требуемой матрицы landing / info pages / Constructor3D / responsive / fallback / checkout states.

Важно: это не очередной release validation и не UI fix. Этот документ фиксирует blocked execution status и готовит следующий actionable prompt для 05 Infrastructure / QA Agent.

## 2. Scope

In scope:

- сверить P1-22 closure evidence;
- проверить наличие deployment URL / Vercel evidence;
- проверить наличие существующего screenshot artifact pipeline;
- проверить возможность получить screenshots через текущий runtime;
- зафиксировать blocked / not executed status, если screenshots реально не получены;
- подготовить prompt для 05 Infrastructure / QA Agent на создание screenshot artifact pipeline.

Out of scope:

- UI / CSS / component fixes;
- redesign;
- package.json changes;
- workflow changes в рамках UX/UI Agent;
- Pricing;
- API business logic;
- Three.js logic;
- Production / Manufacturing logic;
- GitHub issues.

## 3. Deployment URL / Source Deployment

Vercel source evidence из PR #49:

```text
Preview URL: https://razmerno-git-p1-22-vercel-dashb-80857e-dennygaar91-uxs-projects.vercel.app
Vercel deployment: Ready
Deployment dashboard URL: https://vercel.com/dennygaar91-uxs-projects/razmerno/DRXGF4wpPeQyuq3q5ukTuv8sTKtF
Updated: Jun 16, 2026 9:08pm UTC
```

Backlog P1-22 evidence:

```text
P1-22 status: closed
Merge commit: 63eafb4422e1de1ce65cc3a18eeefe4b4ead9d72
GitHub QA run #239: success
Final PR-head Vercel status: success
Target deployment id: 6s1SC84wysEbv6Y8DCEqw3FWzUrV
```

## 4. Commit SHA

Source-of-truth merge commit from the task and current P1-22 evidence:

```text
63eafb4422e1de1ce65cc3a18eeefe4b4ead9d72
```

## 5. Routes Planned for Checking

Planned routes based on `docs/ux/release-visual-qa-matrix-v1.md`:

| Route / state | Purpose | Status |
|---|---|---|
| `/` | Landing first screen, header, CTA, sections, footer | Not executed |
| `/measurements` or `/measurements.html` | Info page / measurements | Not executed |
| `/materials` or `/materials.html` | Info page / materials | Not executed |
| `/assembly` or `/assembly.html` | Info page / assembly | Not executed |
| `/configurator` | Active Constructor3D shell | Not executed |
| WebGL fallback | Requires Playwright-side WebGL mocking or a safe non-production test hook on Vercel; `?rzm_webgl=off` is localhost-only and must not be counted as Vercel fallback coverage | Not executed |
| `/configurator-3d` | Constructor alias | Not executed |
| `/admin` | Conditional admin visual matrix | Not executed |

## 6. Viewports Planned

| Viewport | Size | Status |
|---|---:|---|
| Desktop | 1440×900 | Not executed |
| Laptop | 1280×800 | Not executed |
| Tablet | 768×1024 | Not executed |
| Mobile | 390×844 | Not executed |
| Mobile optional | 375×812 | Not executed |

## 7. Screenshots / Artifacts Evidence

No Vercel-based screenshots were captured.

Existing GitHub Actions artifacts were checked conceptually through workflow configuration. The current QA workflow includes:

- repository infrastructure inventory artifact;
- P1-09 constructor submit CI evidence log;
- P1-09 Playwright report artifact;
- coverage summary artifact.

The existing artifacts do not constitute the required Vercel visual screenshot pass because they do not cover the release visual QA matrix across landing, info pages, Constructor3D states and responsive viewport screenshots against a Vercel deployment.

## 8. Execution Attempts / Tooling Constraints

### 8.1 Vercel URL availability

A Vercel Preview URL exists and is marked Ready in PR #49 evidence.

### 8.2 Browser screenshot access

The current assistant runtime cannot perform browser screenshots against the Vercel URL. Earlier local execution attempts in this environment also showed DNS resolution failure for `github.com` / `vercel.app`, so relying on local Playwright from this runtime would be invalid.

### 8.3 GitHub Actions screenshot pipeline

`.github/workflows/qa.yml` currently has Playwright E2E execution for P1-09/P1-10/P1-13 and uploads Playwright report/test-results for P1-09, but there is no dedicated workflow/job that captures the required Vercel visual QA screenshot matrix as artifacts.

Because UX/UI Agent is not allowed to create infrastructure workflow changes independently in this task, the correct next action is to hand off a focused prompt to 05 Infrastructure / QA Agent.

### 8.4 WebGL fallback caveat

The known `?rzm_webgl=off` test trigger is localhost-only. A Vercel screenshot pipeline must not count `target_url/configurator?rzm_webgl=off` as fallback evidence unless the implementation is changed safely or Playwright mocks WebGL capability/failure at browser context level.

## 9. Findings Table

No product visual findings were created from screenshots because screenshots were not obtained.

| ID | Severity | Classification | Area | Finding | Evidence | Status |
|---|---|---|---|---|---|---|
| VQA-BLOCK-01 | Blocker | screenshot infrastructure | Global | Vercel-based visual QA cannot be executed with current available tooling; no screenshot artifact pipeline exists for the required matrix. | Workflow review + no browser screenshot access in current runtime | Open |
| VQA-BLOCK-02 | High | release evidence | Global | P2-20/P2-21 remain open because no visual screenshots exist for landing/info/constructor/responsive matrix. | `current-backlog.md` keeps P2-20/P2-21 open | Open |
| VQA-BLOCK-03 | High | fallback coverage | WebGL fallback | The localhost-only `?rzm_webgl=off` route is not valid Vercel fallback evidence; pipeline must use Playwright-side WebGL mocking or a safe non-production test hook. | `useWebGLAvailable.ts` behavior noted by automated review | Open |

## 10. Blocker / High / Medium / Low Breakdown

| Severity | Count | Notes |
|---|---:|---|
| Blocker | 1 | Screenshot pass cannot be claimed without actual screenshots. |
| High | 2 | Visual release confidence remains incomplete; fallback coverage also requires a deploy-safe trigger. |
| Medium | 0 | No screenshot-based medium findings. |
| Low | 0 | No screenshot-based low findings. |

## 11. Design System Problems

Not assessed visually.

Potential areas from the matrix remain unverified:

- landing/header/footer consistency;
- Constructor3D shell density and hierarchy;
- material selection visual trust;
- button / control hierarchy;
- responsive spacing and overflow;
- footer/legal trust state.

## 12. Mobile Problems

Not assessed visually.

Mobile routes and states still need artifact screenshots at minimum for:

- landing first screen;
- header/mobile navigation;
- Constructor3D shell;
- sizes/filling/materials/checkout steps;
- WebGL fallback through deploy-safe mocking/hook.

## 13. Constructor Problems

Not assessed visually.

Constructor3D still needs screenshots for:

- shell / stagebar / drawer / scene;
- dimension controls;
- filling controls;
- material selection;
- quote/price state;
- validation/warning/error state;
- checkout state;
- fallback state through deploy-safe mocking/hook.

## 14. Landing Problems

Not assessed visually.

Landing still needs screenshots for:

- first screen hierarchy;
- header / CTA;
- section rhythm;
- copy density;
- footer trust state;
- desktop/tablet/mobile layout.

## 15. Accessibility Problems

Not assessed visually.

Focus states, contrast, hit zones, disabled states and readable labels remain unverified in browser screenshots.

## 16. Legacy Fragments

Not assessed visually.

Active routes still need verification that old constructor visuals or duplicate legacy visual language do not appear in `/configurator` and public routes.

## 17. What Was Not Checked and Why

Not checked:

- live Vercel UI screenshots;
- responsive screenshots;
- Vercel WebGL fallback screenshots;
- focus state screenshots;
- admin screenshots;
- checkout success/error/cooldown screenshots.

Why:

1. The available runtime cannot capture screenshots from Vercel.
2. The repository has no existing Vercel visual QA artifact workflow covering the requested matrix.
3. UX/UI Agent is explicitly not allowed to create infrastructure workflow changes in this task.
4. Fallback coverage needs deploy-safe WebGL mocking/hook because the existing query trigger is localhost-only.

## 18. Final Conclusion

Visual QA Screenshot Pass status:

```text
blocked / not executed
```

This stage cannot be considered closed because the core closure criteria were not met:

- screenshots were not obtained;
- routes/viewports were not visually checked;
- screenshot artifacts do not exist;
- visual findings table has only execution blockers, not product UI findings.

P1-22 is closed, so deployment readiness no longer blocks starting visual QA. The blocker is now the absence of a safe screenshot artifact pipeline / browser screenshot mechanism for this agent runtime.

## 19. Recommended Next Backlog Items

No new backlog file should be created.

Existing backlog items remain the right targets:

- P2-20 Visual Regression Screenshot Suite;
- P2-21 Cross-browser / Device Visual QA Execution;
- P2-22 Accessibility / Focus Visual Pass;
- P2-23 Checkout Trust-state Visual Hardening;
- P2-24 Footer / Legal Trust Hardening;
- P2-25 Admin Visual Consistency Pass.

Recommended next step:

```text
05 Infrastructure / QA Agent should create a GitHub Actions workflow_dispatch screenshot artifact pipeline that captures the release visual QA matrix against the Ready Vercel Preview URL, uploads screenshots as artifacts, uses deploy-safe WebGL fallback mocking/hook, and does not modify product UI/CSS/components except for an explicitly approved safe test hook if absolutely required.
```

## 20. Prompt for 05 Infrastructure / QA Agent

```text
Ты работаешь как 05 Infrastructure / QA Agent проекта «Размерно».

Источник истины: https://github.com/dennygaar91-ux/razmerno
Главный backlog: docs/planning/current-backlog.md
Матрица визуальной проверки: docs/ux/release-visual-qa-matrix-v1.md
Последний UX blocker report: docs/ux/vercel-visual-qa-screenshot-pass-v1.md

Контекст:
P1-22 закрыта. Vercel Preview deployment для PR #49 стал Ready / Latest:
https://razmerno-git-p1-22-vercel-dashb-80857e-dennygaar91-uxs-projects.vercel.app
merge commit: 63eafb4422e1de1ce65cc3a18eeefe4b4ead9d72

Задача:
Создать безопасный GitHub Actions workflow_dispatch screenshot artifact pipeline для Vercel-based visual QA.

Scope:
- инфраструктура/QA only;
- не менять UI/CSS/components;
- не менять Pricing/API/Three.js/Production logic;
- не трогать GitHub issues;
- не закрывать UX visual QA автоматически.

Pipeline должен:
1. Принимать input `target_url` с Vercel deployment URL.
2. Устанавливать Node 22 и Playwright Chromium.
3. Открывать target URL и routes:
   - `/`
   - `/measurements`
   - `/materials`
   - `/assembly`
   - `/configurator`
   - `/configurator-3d`
   - `/admin` если доступен без secrets.
4. Для WebGL fallback НЕ считать `/configurator?rzm_webgl=off` валидным Vercel evidence, потому что текущий hook работает только на localhost. Нужно реализовать один из безопасных вариантов:
   - Playwright-side WebGL mocking/failure at browser context level;
   - или отдельный safe non-production test hook, явно ограниченный QA/Vercel preview и не влияющий на production behavior.
5. Делать screenshots минимум в viewports:
   - 1440x900
   - 1280x800
   - 768x1024
   - 390x844
   - 375x812
6. Сохранять PNG screenshots в artifact, например `vercel-visual-qa-screenshots`.
7. Генерировать JSON/Markdown inventory со списком screenshot files, routes, viewport, HTTP status, console errors если есть.
8. Не падать на отдельном недоступном optional admin route, но явно фиксировать его status.
9. Upload artifact через actions/upload-artifact.
10. Обновить docs/qa или docs/ux только если pipeline реально добавлен и прошёл.
11. После merge pipeline можно запускать UX/UI Agent для фактического visual review.

Branch:
infra-vercel-visual-qa-screenshot-pipeline

PR title:
Vercel Visual QA Screenshot Artifact Pipeline

Финальный отчёт должен содержать:
- что добавлено;
- workflow name;
- how to run workflow_dispatch;
- artifact name;
- tested target URL;
- run id;
- artifacts evidence;
- deploy-safe WebGL fallback method;
- confirmation that product UI/CSS/components were not changed, except an explicitly justified QA-only hook if approved.

Обращаться к агенту: 05 Infrastructure / QA Agent
```

## 21. Closure Review

| Criterion | Status |
|---|---|
| Vercel source deployment identified | Done |
| P1-22 closed verified | Done |
| Screenshots obtained | Not done |
| Routes checked visually | Not done |
| Viewports checked visually | Not done |
| Product visual findings created | Not done |
| Blocker classification created | Done |
| UX report created | Done |
| Backlog closed | No |
| UI/CSS/components changed | No |
| GitHub issues touched | No |
| Stage can be considered closed | No |

Final status:

```text
blocked / not executed
```
