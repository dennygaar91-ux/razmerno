# Reset Contract Verification Report v1 — Размерно

Дата: 2026-06-15.

Роль: Constructor Verification Agent.

Статус: verification-only / no runtime code changes.

## 0. 2026-06-18 reconciliation addendum

This report originally captured a stale conflict: at that time reset behavior was described as preserving checkout/step state. Current main has since moved to the P0-16 target contract:

- manual constructor reset is a full project reset to `constructorInitialState`;
- checkout/contact/delivery/assembly/consent state is reset with the rest of constructor state;
- transient scene state and production snapshot state are reset;
- submit success does not reset the model/configuration and only saves the draft.

Current implementation evidence:

- `src/static-pages/constructor/store/constructorResetState.ts` returns `{ ...constructorInitialState }`;
- `src/static-pages/constructor/store/constructorResetContract.test.ts` verifies checkout/contact/service/transient state is reset;
- `src/static-pages/constructor/constructorFlowSmoke.test.ts` verifies reset returns to the initial wizard state;
- `tests/checkout-submit-hook.test.ts` verifies the active Constructor3D submit hook does not call the constructor store reset path.

This addendum supersedes the historical findings below where they describe preserving checkout/step state as the current behavior. P0-16 should remain open until this reconciliation branch has PR review, GitHub QA success, main verification, and backlog evidence recorded. P0-17 remains separate and must not be closed by this addendum alone.

## 1. Цель проверки

Проверить, можно ли действительно считать закрытыми:

- P0-16 Constructor Reset Contract Resolution;
- P0-17 Constructor Smoke Test Stabilization.

Проверка выполнялась независимо от Constructor Core Agent. Pricing, checkout, API, Supabase, production, Three.js, дизайн и рефакторинг не изменялись.

## 2. Источники, которые были проверены

Обязательные planning / QA / constructor documents:

- `docs/planning/README.md`;
- `docs/planning/master-development-plan-v1.md`;
- `docs/planning/current-backlog.md`;
- `docs/planning/mvp-scope.md`;
- `docs/planning/architecture-decisions.md`;
- `docs/planning/agent-workflow.md`;
- `docs/qa/testing-audit-v1.md`;
- `docs/qa/testing-critical-findings-v1.md`;
- `docs/qa/test-infrastructure-report-v1.md`;
- `docs/constructor/constructor-core-audit-v1.md`.

Important note: `docs/constructor/reset-contract-implementation-report-v1.md` was requested in the task prompt, but it does not exist in the repository at the time of verification.

Constructor files checked:

- `src/static-pages/constructor/store/constructorResetState.ts`;
- `src/static-pages/constructor/store/constructorUtilitySlice.ts`;
- `src/static-pages/constructor/store/constructorStoreInitialState.ts`;
- `src/static-pages/constructor/store/constructorStoreTypes.ts`;
- `src/static-pages/constructor/store/constructorStore.test.ts`;
- `src/static-pages/constructor/constructorFlowSmoke.test.ts`;
- `package.json`;
- `.github/workflows/qa.yml`.

## 3. Important limitation

The GitHub repository was accessible through the GitHub connector and code search, but the execution environment could not clone GitHub due DNS/network failure:

```text
fatal: unable to access 'https://github.com/dennygaar91-ux/razmerno.git/': Could not resolve host: github.com
```

Therefore, local execution of `npm run typecheck`, `npm run build`, and npm tests was not possible from this environment.

GitHub evidence was checked instead:

- repository scripts exist in `package.json`;
- `.github/workflows/qa.yml` defines a Fast CI gate;
- the checked commit has a Vercel failure status;
- no GitHub workflow runs were returned for the checked commit.

Because neither local commands nor GitHub Actions runs confirmed the checks, P0-16 and P0-17 cannot be marked closed.

## 4. Stage 1 — Reset contract review

### 4.1 Current implementation

`constructorUtilitySlice.ts` wires `reset()` to `createResetPreservingCheckoutPatch(state)`.

`constructorResetState.ts` currently implements:

```ts
export const createResetPreservingCheckoutPatch = (
  state: ConstructorStoreState,
): Partial<ConstructorStoreState> => ({
  ...constructorInitialState,
  step: state.step,
  contact: state.contact,
  consent: state.consent,
  deliveryEnabled: state.deliveryEnabled,
  assemblyEnabled: state.assemblyEnabled,
  deliveryAddress: state.deliveryAddress,
});
```

Actual behavior:

- resets project/configuration fields to `constructorInitialState`;
- preserves `step`;
- preserves `contact`;
- preserves `consent`;
- preserves `deliveryEnabled`;
- preserves `assemblyEnabled`;
- preserves `deliveryAddress`.

This is a configuration reset preserving checkout/step, not a full wizard/project reset.

### 4.2 Product requirement check

Relevant product decisions say:

- checkout remains inside constructor;
- success after submitting an order must not reset the model;
- PII must not be stored in localStorage;
- constructor steps are `sizes / fill / materials / checkout`.

These decisions do not automatically prove that manual `reset()` should preserve checkout/step. They only clearly prove that submit success must not reset the model.

Therefore the product-level reset contract is still ambiguous unless explicitly documented as one of these two variants:

1. full manual project reset;
2. configuration reset preserving checkout/contact/service fields.

### 4.3 Hidden conflict

There is still a direct contradiction between active tests:

- `constructorStore.test.ts` expects `reset()` to preserve active step and contact email;
- `constructorFlowSmoke.test.ts` expects `reset()` to return to `sizes` and clear contact email / delivery address.

This is exactly the conflict previously identified by the Constructor Core audit. It is still present in repository code.

## 5. Stage 2 — Build verification

Required commands exist in `package.json`:

```bash
npm run typecheck
npm run build
```

Actual script definitions:

```json
"typecheck": "tsc --noEmit",
"build": "vite build"
```

Execution status:

- `npm run typecheck` — not executed locally due unavailable repository clone/runtime environment;
- `npm run build` — not executed locally due unavailable repository clone/runtime environment;
- GitHub workflow evidence — no workflow runs returned for checked commit;
- Vercel status — failure.

Result: build verification is not confirmed.

## 6. Stage 3 — Test verification

The following constructor scripts exist in `package.json`:

```bash
npm run test:constructor-store
npm run test:constructor-flow
npm run test:constructor-payload
npm run test:constructor-three
npm run test:constructor-three-safety
```

Related active constructor scripts also exist:

```bash
npm run test:production-preview
npm run test:constructor-draft
npm run test:constructor-pii-order
```

Execution status:

- tests were not executed locally due unavailable repository clone/runtime environment;
- no GitHub Actions run was available to prove these tests passed on the checked commit;
- static review shows `test:constructor-flow` still contains expectations incompatible with the current reset implementation.

Result: test verification is not confirmed. Based on static contradiction, `test:constructor-flow` is expected to fail or remain semantically stale until the reset contract is resolved.

## 7. Stage 4 — Regression review after reset

Based on `constructorResetState.ts`, reset behavior is:

| State area | Current reset behavior |
|---|---|
| sizes | reset to `constructorInitialState` |
| sections | reset to `constructorInitialState` |
| zones / compartments | reset to `constructorInitialState` |
| filling | reset to `constructorInitialState` |
| materials | reset to `constructorInitialState` |
| validation | reset to `constructorInitialState` validation |
| checkout contact | preserved |
| deliveryEnabled | preserved |
| assemblyEnabled | preserved |
| deliveryAddress | preserved |
| consent | preserved |
| current step | preserved |

This behavior can be valid only if the intended contract is explicitly named as configuration reset preserving checkout/step.

It is not valid if the intended contract is full manual project reset.

## 8. Final status

### P0-16 Constructor Reset Contract Resolution

Status: **не закрыта**.

Reason:

- reset behavior is explicit in code, but product contract is not resolved/documented as a stable public contract;
- active tests still encode incompatible meanings of `reset()`;
- required typecheck/build/tests were not actually confirmed;
- requested implementation report file is absent.

### P0-17 Constructor Smoke Test Stabilization

Status: **не закрыта**.

Reason:

- `constructorFlowSmoke.test.ts` still expects full wizard reset;
- current implementation preserves `step`, contact and checkout fields;
- no executed smoke-test result proves stabilization;
- P0-17 depends on P0-16, and P0-16 is not resolved.

## 9. Checks status

Checks that were requested:

```bash
npm run typecheck
npm run build
npm run test:constructor-store
npm run test:constructor-flow
npm run test:constructor-payload
npm run test:constructor-three
npm run test:constructor-three-safety
```

Checks that could be confirmed as existing:

- all listed commands exist in `package.json`.

Checks that were actually executed:

- none locally, because the repository could not be cloned in the execution environment;
- none through GitHub Actions for the checked commit, because workflow runs were not returned.

Checks that passed:

- none confirmed.

Checks that failed:

- Vercel status for the checked commit is failure;
- no local/npm test failure can be claimed because the npm commands were not executed.

## 10. Backlog updates

Updated in `docs/planning/current-backlog.md`:

- P0-16 status set to verification failed / not closed;
- P0-17 status set to verification failed / not closed;
- added reference to this verification report.

No new backlog file was created.

## 11. Can reset contract be considered complete?

No.

Reset contract cannot be considered fully complete until all of the following are true:

1. product contract is explicitly chosen and documented;
2. implementation matches that contract;
3. `constructorStore.test.ts` and `constructorFlowSmoke.test.ts` assert the same semantic contract;
4. `npm run typecheck` passes;
5. `npm run build` passes;
6. relevant constructor tests pass;
7. CI/GitHub Actions shows a successful run or equivalent local evidence is attached.
