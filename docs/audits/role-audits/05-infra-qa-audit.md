# Role Audit — Infrastructure / QA

## Scope

Роль владеет CI gates, test infrastructure, release verification workflows, artifacts, diagnostics, environment verification и quality evidence policy.

## Sources Reviewed

- `docs/specification/volume-09-architecture/README.md`
- `docs/specification/volume-10-governance/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `.github/workflows/qa.yml`
- `.github/workflows/vercel-visual-qa-screenshots.yml`
- `qa/README.md`
- `qa/manual-qa-matrix.md`
- `qa/price-qa-matrix.md`
- `tests/**`
- `tests/browser/**`
- `scripts/**`

## Current State

- В repo есть основной CI workflow `qa.yml` с install, typecheck, build, fast tests, Playwright E2E, coverage snapshot и architecture checks.
- Есть отдельный workflow для Vercel visual QA screenshot capture.
- В repo присутствует крупный набор scripts/checks для architecture, design system, production, release и visual/UX flows.
- Есть browser tests для configurator, submit, material parity и WebGL fallback.
- QA и visual matrix docs already exist in `qa/**` and `docs/ux/**`.

## RPES Alignment

- Governance principle “no closure without evidence” отражён в QA infrastructure.
- Architecture and test layers уже существуют как самостоятельные guard rails.
- Visual QA workflow выделен отдельно, что совпадает с backlog/decision separation between code completion and visual approval.

## Backlog Alignment

- `P0-08 Testing Foundation`
- `P0-09 QA Fast CI Gate`
- `P0-10 Coverage & Thresholds`
- `P0-15 CI/CD & Vercel Failure Investigation`
- `P1-22 Vercel Deployment Dashboard Log Verification`
- `QA Release Maturity Matrix`
- `TASK 08-UX-06 Visual Regression / Cross-browser Device Coverage`
- `M8-P1-02 Live provider and Supabase persistence verification`
- `M8-P1-04 Vercel post-deploy verification`
- `M9-P1-01 Automated E2E release suite`
- `M9-P1-04 Observability integration`
- `M9-P1-10 Release and rollback process`
- `M10-P2-01 Full visual regression system`
- `M10-P2-08 Load and stress testing`

## Gaps

- QA foundation сильная, но backlog still keeps open tracks for live verification, cross-browser execution, visual regression system and higher-maturity release process.
- В repo не подтверждён полноценный observability/SLO layer уровня M9/M10.
- Screenshot workflow есть, но executed visual approval evidence не встроено в сам audit scope.
- Release rollback, incident and load/stress layers не выглядят закрытыми по current backlog.

## Risks

- Release risk: strong local/CI tests не заменяют live provider and post-deploy verification.
- Quality risk: без visual regression system regressions могут проходить при green functional CI.
- Ops risk: ограниченная observability осложнит triage production issues.

## Recommended Next Tasks

- Свести unified QA maturity map against open `M8/M9/M10` tasks.
- Довести live verification tracks до repeatable runbook + evidence artifact format.
- Подготовить minimal observability plan and rollback checklist aligned with backlog.
- Отдельно описать which workflows are blocking release and which are diagnostic only.

## Evidence Required for Closure

- GitHub QA success on required workflows
- live environment verification artifacts where backlog requires them
- browser/cross-device screenshot evidence plus human review for visual tasks
- merged/main runbooks for rollback/incident/verification

## Do Not Touch

- workflows, package files and test infra from docs-only audit
- runtime code to “make QA green”
- release status wording without actual CI/live evidence
- Supabase/provider config without explicit scope
