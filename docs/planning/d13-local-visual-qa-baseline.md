> Derived local report. Not an active source of truth. `docs/planning/current-backlog.md` remains the active operational backlog. Use this file as historical branch-local evidence only.

# D-13 Local Visual QA Baseline — Customer / Operations MVP

> **Date:** 2026-07-07  
> **Branch:** `task/epic-b-projects-foundation` @ `46dde55d` (pre-commit baseline)  
> **Agent:** 08 UX/UI / Design System Agent (Visual QA)  
> **Type:** local visual QA baseline — **not final preview visual QA**, **not closure**

---

## 1. Scope

Local visual QA baseline for the signed Customer + Operations MVP path on branch `task/epic-b-projects-foundation`, before PR.

**In scope**

- Customer: auth gate, workspace/cabinet, order list cards, notifications area, profile.
- Operations: login gate, workspace queue, manual review shell (where reachable).
- Responsive checks at 1440 / 768 / 390 where automation succeeded.
- Safe D-12 test data context (`contract-test@example.com`, orders `RZM_0007` / `RZ-20260707-5271`, `RZM_0002` / `RZ-20260706-7048`).

**Out of scope / deferred**

- Final preview visual QA (post-PR / Vercel preview).
- Human visual approval.
- Pixel-perfect regression.
- Mutating live data to fabricate `Ожидает оплаты` / `В работе` customer detail-only states.

**Explicit non-actions**

- No push / merge / PR / deploy.
- P1-27 and P1-28 unchanged (`needs reconciliation`).
- Not release readiness.

---

## 2. Runtime Target

| Item | Value |
|------|-------|
| Preferred URL | `http://localhost:3005` (task spec) |
| Actual stable capture URL | `http://localhost:3010` (`scripts/start-vercel-dev-with-env.mjs`, `VERCEL_DEV_PORT=3010`) |
| Health | `GET /api/health` → `ok: true`, Supabase env present |
| Env | `.env.local` (uncommitted); `SUPABASE_*` mirrored to `VITE_SUPABASE_*` by start script for browser auth |
| Production Vercel | Not used (tracks `main`, lacks epic-b APIs) |

**Runtime notes**

- Windows `vercel dev` showed intermittent `502` / `EADDRINUSE` under Playwright load; fresh port + throttled captures improved results.
- D-12 API path verified earlier on `localhost:3004`; D-13 focus is UI/screenshots, not re-running full live path.

---

## 3. Capture Tooling

| Artifact | Purpose |
|----------|---------|
| `scripts/d13-local-visual-qa-capture.mjs` | Playwright Chromium capture script |
| `npm run capture:d13-local-visual-qa` | Entry point (`VISUAL_QA_BASE_URL`, optional `D13_ALL_VIEWPORTS=1`) |
| `scripts/start-vercel-dev-with-env.mjs` | Loads `.env.local`, mirrors `VITE_SUPABASE_*`, starts `vercel dev` |

**Evidence folder (local, untracked PNGs):** `artifacts/visual-qa/d13-local/2026-07-07-d13/`  
**Manifest:** `artifacts/visual-qa/d13-local/2026-07-07-d13/manifest.json`

---

## 4. Screenshots Captured

### Customer

| Screen | Viewports | File | Result |
|--------|-----------|------|--------|
| Auth gate / account entry | 1440, 768, 390 | `customer-auth-gate__*.png` | **Captured** — login prompt, header/footer intact |
| Workspace / cabinet | 1440 | `customer-workspace__desktop-1440.png` | **Captured** — orders list, profile, summary cards; notifications still loading |
| Order detail `На проверке` | 1440 | `customer-order-review__desktop-1440.png` | **Unusable** — app splash (`Загружаем страницу`) only |
| Order detail `Завершено` | 1440 | `customer-order-completed__desktop-1440.png` | **Unusable** — app splash only |
| Notifications list / bell | — | (within workspace) | **Partial** — bell visible; list stuck on «Загружаем уведомления…» |
| Change request / payment blocks | — | — | **Not captured** — order detail pages not reached in automation |

### Operations

| Screen | Viewports | File | Result |
|--------|-----------|------|--------|
| Login / queue gate | 1440, 768, 390 | `operations-login__*.png` | **Captured** |
| Workspace / filters | 1440 | `operations-workspace__desktop-1440.png` | **Captured with error** — «Не удалось загрузить operations workspace», empty queue |
| Order review (completed order) | 1440 | `operations-order-review-completed__desktop-1440.png` | **Partial** — loading shell only |
| Order review (queue order) | 1440 | `operations-order-review-queue__desktop-1440.png` | **Partial** — loading shell only |
| Manual pricing / decisions / payment / history sections | — | — | **Not captured** — review page data not loaded |

---

## 5. Customer Findings

**Positive**

- Auth gate layout readable; global header/footer consistent with landing.
- Authenticated workspace renders greeting, summary cards, orders list with Russian status labels (`На проверке`, `Завершено`), pricing, profile block.
- No raw JSON or internal audit fields observed in captured customer UI.
- Order cards and CTAs («Открыть заказ») visible.

**Issues**

- «Войти» on auth gate is very low contrast (near-invisible on white card).
- Notifications block did not finish loading during capture.
- Automated order-detail navigation often hit global splash before account route rendered.

---

## 6. Operations Findings

**Positive**

- Operations login gate copy explains masked read model.
- Layout sections (workspace header, filter chips, table headers) structurally sound when rendered.

**Issues**

- Workspace capture shows API failure empty state (not a populated queue).
- Manual review pages stuck on «Загрузка review…» / «Загружаю заявку…» during automation.
- Mixed RU/EN copy (`Operations Workspace`, `Manual Review`, `Approval summary`, `Pending`) — understandable for internal MVP but inconsistent with customer-facing Russian tone.
- Console: repeated `502 Bad Gateway` on local API routes under automation load.

---

## 7. Responsive Findings

| Viewport | Coverage |
|----------|----------|
| **1440 desktop** | Auth gate, customer workspace (authenticated), operations login, operations workspace (error state), partial review shells |
| **768 tablet** | Auth gate, operations login only |
| **390 mobile** | Auth gate, operations login only |

Authenticated customer workspace and operations data screens were **not** re-captured at tablet/mobile in this baseline (automation time budget + runtime instability). Document as **preview QA follow-up**, not a product decision that mobile is out of scope.

---

## 8. Console Errors

From Playwright manifest (`localhost:3010` run):

- Multiple `502 Bad Gateway` on `/api/customer/*` and `/api/operations/*` during burst captures.
- Intermittent `TypeError: Failed to fetch` from `@supabase/supabase-js` token/session refresh in browser.
- Occasional `404` on secondary resources.

These correlate with local `vercel dev` instability, not necessarily production defects. Preview QA must confirm clean console on stable runtime.

---

## 9. Missing Visual States (no safe data mutation)

| State | Reason |
|-------|--------|
| Customer order detail `Ожидает оплаты` | No dedicated safe order held at this status without mutation |
| Customer order detail `В работе` | Same |
| Operations mid-lifecycle sections with live data | Workspace/review APIs failed to load during capture |
| Payment instructions / change request forms (isolated) | Depend on loaded order detail / review pages |

---

## 10. Defect Table

| ID | Severity | Screen | Viewport | Expected | Actual | Fix before PR? |
|----|----------|--------|----------|----------|--------|----------------|
| D13-V-01 | P2 | Customer auth gate | all captured | «Войти» clearly visible | Very low contrast button | Optional — polish |
| D13-V-02 | P2 | Customer workspace | 1440 | Notifications loaded | «Загружаем уведомления…» persists in capture | No — re-check on preview |
| D13-V-03 | P2 | Operations workspace | 1440 | Populated queue | API error empty state in capture | No — local runtime; preview QA |
| D13-V-04 | P2 | Operations review | 1440 | Review sections with data | Loading placeholders only | No — preview QA |
| D13-V-05 | P2 | Operations UI copy | 1440 | Consistent RU tone (if desired) | EN labels in workspace/review | No — product decision |
| D13-V-06 | P3 | Order detail automation | 1440 | Full order card | Splash screen capture | No — tooling/runtime |
| D13-V-07 | P3 | Responsive | 768/390 | Workspace + review | Only gate screens captured | No — preview QA |

**No P0/P1 visual blockers** identified in rendered customer workspace and auth flows. Remaining gaps are capture/runtime coverage and preview confirmation.

---

## 11. PR Readiness Recommendation

**PARTIAL — local visual baseline supports opening PR with caveats.**

- Sufficient evidence that customer auth gate and authenticated workspace UI are structurally sound on desktop.
- Operations shell renders but **data-backed screens were not visually verified** locally.
- Recommend PR proceed per D-14 Option 2 **with explicit preview visual QA gate** before merge/release.

---

## 12. Preview Visual QA Requirements (final D-13)

Repeat on Vercel preview after PR workflow:

1. Full customer order detail matrix: `На проверке`, `Ожидает оплаты`, `В работе`, `Завершено`.
2. Notifications list + unread bell settled state.
3. Change request + payment instruction blocks on real loaded orders.
4. Operations workspace with populated queue + filter counts.
5. Operations review: manual pricing, approve/reject, CR review, payment confirmation, completion, decision history.
6. Desktop / tablet / mobile for account + operations primary routes.
7. Human visual review + explicit approval per project visual closure rules.
8. Clean console on stable preview runtime.

---

## 13. QA Commands (docs/scripts phase)

| Command | Result |
|---------|--------|
| `npm test` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |

---

## 14. Related Evidence

- D-12 live verification: `docs/planning/current-backlog.md` (API path PASS)
- D-14 PR strategy: `docs/planning/d14-pr-strategy.md`
- MVP sign-off: `docs/planning/mvp-scope-decision-signoff.md`

---

**Обращаться к агенту:** 08 UX/UI / Design System Agent
