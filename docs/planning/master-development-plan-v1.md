# Master Development Plan v1 — Размерно

Статус: главный управляющий документ для дальнейшей работы агентов.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md` от 2026-06-16.

Цель документа — зафиксировать порядок развития проекта до MVP, приоритеты, зависимости, ограничения и безопасную стратегию разработки.

---

## 1. Executive Summary

Проект «Размерно» находится в состоянии рабочего MVP-прототипа, но ещё не готов к production-запуску.

Основная стратегия остаётся:

**Stabilize → Complete → Harden → Release**

После reconciliation стратегия уточнена:

1. Сначала закрыть remaining constructor state ownership uncertainty.
2. Затем закрыть pricing parity uncertainty.
3. После этого стабилизировать Three.js и WebGL/2D fallback.
4. Затем завершать Constructor3D UX, materials, checkout UX/E2E.
5. После этого углублять production/admin/release readiness.

Подтверждённо закрыты инфраструктурные и contract-блоки:

- P0-09 QA Fast CI Gate;
- P0-10 Coverage & Thresholds as baseline;
- P0-11 API Order Flow Tests;
- P0-12 Checkout Submit Tests;
- P0-14 Supabase Contract Tests;
- P0-15 CI/CD & Vercel Failure Investigation as investigation;
- P0-16 Constructor Reset Contract Resolution;
- P0-17 Constructor Smoke Test Stabilization;
- P0-18 Constructor3D Architecture Guard Implementation;
- P0-19 Dependency Layer Recovery Verification.

Не подтверждены как закрытые по repository evidence:

- P0-13 Pricing Golden Fixtures & Parity;
- P0-01/P0-02/P0-03/P0-05/P0-06/P0-07 remain open or in progress in `current-backlog.md`.

---

## 2. Текущее состояние проекта

### Инфраструктура

Есть GitHub, Vercel, Supabase, docs, architecture/documentation audits, QA fast gate, baseline coverage и подтверждённый dependency runtime recovery через Node 22.

Остаётся: nightly/release workflow, test quarantine, Istanbul/LCOV coverage и deployment validation layer.

### API / Checkout / Supabase contracts

API order flow, checkout submit и Supabase contract coverage закрыты документально.

Остаётся: browser-level Constructor3D submit E2E, checkout UX completion и live/release validation.

### Конструктор

Активная разработка должна идти вокруг Constructor3D. Legacy Constructor остаётся quarantine до безопасной миграции/удаления.

Критично: reset contract и constructor smoke stabilization уже закрыты; remaining constructor state ownership остаётся отдельным P0 scope.

### Pricing Engine

Цена должна быть точной, не предварительной. P0-13 остаётся открытой, потому что repository evidence фиксирует риск расхождения client/server pricing paths.

### Three.js / WebGL

3D открыт по умолчанию и является главным интерфейсом. Three.js stability и WebGL/2D fallback остаются P0, но их нельзя запускать как широкий scope до стабилизации constructor reset/state contract.

### Production / Admin

Production/admin важны для MVP, но идут после constructor state, pricing parity, Three.js stability и fallback.

---

## 3. Главные риски

1. Remaining constructor state ownership uncertainty after reset/smoke closure.
2. Constructor3D state model still needs careful scoped stabilization.
3. Архитектурное расслоение legacy Constructor / Constructor3D.
4. Крупные constructor files и store.
5. Расхождение pricing между client/server/production paths.
6. WebGL/Three.js instability без рабочего fallback.
7. Документационное устаревание после закрытия отдельных P0.
8. Scope creep: кухни, AI, B2B, cinematic animation и automatic Basis generation не входят в обязательный MVP.

---

## 4. Актуальный P0 Backlog

### Open / In Progress

1. P0-02 Constructor State Model Stabilization.
2. P0-13 Pricing Golden Fixtures & Parity.
3. P0-03 Pricing Engine Validation.
4. P0-05 Three.js Stability.
5. P0-06 WebGL / 2D Fallback.
6. P0-01 Unified Constructor Architecture.
7. P0-07 Documentation Sync.

### Closed / Baseline Closed

1. P0-09 QA Fast CI Gate.
2. P0-10 Coverage & Thresholds as baseline.
3. P0-11 API Order Flow Tests.
4. P0-12 Checkout Submit Tests.
5. P0-14 Supabase Contract Tests.
6. P0-15 CI/CD & Vercel Failure Investigation as investigation.
7. P0-16 Constructor Reset Contract Resolution.
8. P0-17 Constructor Smoke Test Stabilization.
9. P0-18 Constructor3D Architecture Guard Implementation.
10. P0-19 Dependency Layer Recovery Verification.

### Duplicate / Partially Covered

1. P0-04 Checkout Reliability — contract-scope closed by P0-11/P0-12; остаток в P1-05/P1-09.
2. P0-08 Testing Foundation — baseline closed by QA/API/contract tasks; advanced QA remains P1.

---

## 5. Актуальный P1 Backlog

1. Constructor3D UX Completion.
2. Material System.
3. 3D Furniture Details.
4. Warning / Error System.
5. Checkout UX Completion.
6. Legacy Constructor Cleanup Plan.
7. Design System Stabilization.
8. Constructor3D Submit E2E.
9. WebGL Fallback E2E.
10. Production Golden Snapshots.
11. Admin API & Integration Tests.
12. Material / Texture Parity Tests.
13. Nightly QA Workflow.
14. Release QA Workflow.
15. Package Scripts Ownership / Fast-Medium-Heavy Test Separation.
16. Istanbul / LCOV Coverage Upgrade.
17. Deployment Validation Layer.
18. Test Quarantine System.
19. Constructor Advanced / Scene State Contract Cleanup.
20. Reset Action Separation.

Duplicate / partially covered:

- CI/CD Quality Gates as broad task — не запускать отдельно; использовать P1-14/P1-15/P1-18.

---

## 6. P2 Backlog

1. Production Model Decomposition.
2. Manufacturing Rules Engine.
3. Basis Export JSON.
4. Admin Orders.
5. Admin Production Panel.
6. Production Revisions.
7. Operation editor for hinges/guides/drilling.
8. Detailed production warnings.
9. Visual regression testing.
10. Cross-browser testing matrix.
11. Property-based state testing.
12. Vercel preview deployment smoke after deployment status.

---

## 7. P3 Backlog

- AI Assembly System;
- B2B Mode;
- kitchens;
- automatic .b3d generation;
- cinematic assembly animation;
- deep Three.js optimization;
- CRM/logistics integration;
- full PDF generation;
- real email attachments;
- advanced operation editor;
- full mobile E2E matrix;
- automated performance budgets.

---

## 8. Roadmap до MVP после reconciliation

1. Stage R0 — Planning Reconciliation.
2. Stage R1 — Constructor Reset Contract Resolution.
3. Stage R2 — Constructor State Model Stabilization.
4. Stage R3 — Constructor3D Architecture Guard Implementation.
5. Stage R4 — Pricing Golden Fixtures & Client/Server Parity.
6. Stage R5 — Three.js Stability.
7. Stage R6 — WebGL / 2D Fallback.
8. Stage R7 — Constructor3D Interaction MVP.
9. Stage R8 — Materials MVP.
10. Stage R9 — Checkout UX + Submit E2E.
11. Stage R10 — QA Expansion / Nightly / Release Workflow.
12. Stage R11 — Production Layer MVP.
13. Stage R12 — Admin MVP.
14. Stage R13 — Release Candidate.

---

## 9. Рекомендуемый порядок запуска агентов

1. Constructor State / Architecture Agent.
2. Pricing Parity Agent.
3. Three.js Stability Agent.
4. WebGL Fallback Agent.
5. Constructor UX Agent.
6. Materials Agent.
7. Checkout UX / E2E Agent.
8. QA Workflow Hardening Agent.
9. Production Layer Agent.
10. Admin Agent.
11. Release Agent.

---

## 10. Самая безопасная стратегия

Не начинать с дизайна, удаления legacy, Basis integration, admin expansion или post-MVP функций.

Сначала закрыть reset/state uncertainty и pricing parity. Затем стабилизировать Three.js и fallback. После этого завершать Constructor3D UX, materials и checkout UX/E2E. Только потом углублять QA workflows, production/admin и release readiness.

Главный принцип:

**каждый этап должен уменьшать неопределённость, а не добавлять новую.**
