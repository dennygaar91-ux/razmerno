# Role Audit — Pricing

## Scope

Роль владеет price source-of-truth, client/server parity, pricing snapshots, delivery/assembly pricing rules, admin-facing price transparency и release gate around exact pricing.

## Sources Reviewed

- `docs/specification/volume-06-pricing-engine/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `src/pricing/**`
- `api/_shared/server-price.ts`
- `api/_shared/price-items-store.ts`
- `tests/checkout-submit-hook.test.ts`
- `docs/pricing/pricing-validation-audit-v1.md`
- `docs/pricing/pricing-parity-audit-v1.md`

## Current State

- В репо есть отдельный pricing engine layer в `src/pricing/**`.
- Server-side pricing resolution вынесен в `api/_shared/server-price.ts`.
- Есть runtime catalog/store path и Supabase-backed price-items store с seed fallback; dead browser helper `src/pricing/runtimeCatalog.ts` уже не нужен active MVP path и removed locally after reachability check.
- Большой объём pricing tests уже существует: catalog, engine, delivery, hardware, services, runtime catalog, parity-related fixtures.
- Active MVP pricing path подтверждён как `Constructor3D/useConstructorQuote -> shared/lib/price.calculatePrice -> pricing/engine -> api/_shared/server-price -> stored order snapshot -> admin stored snapshot read`.
- Dead duplicate helper layer partially cleaned: removed `src/shared/lib/estimate.ts` and dead exports `calculateLegacyPrice`, `quickEstimate`, `applyClientPriceMultiplier`.
- Planning/backlog прямо признаёт P0-13 open и связывает pricing release gate с parity/golden fixtures.

## RPES Alignment

- Pricing вынесен в отдельный subsystem, а не размазан полностью по UI.
- Серверный слой уже различает effective source и diagnostic source каталога.
- В pricing docs и tests уже присутствует идея reproducible snapshot/parity, что соответствует RPES pricing intent.

## Backlog Alignment

- `P0-03 Pricing Engine Validation`
- `P0-13 Pricing Golden Fixtures & Parity`
- `M8-P0-01 Pricing parity closure plan`
- pricing source-of-truth and client/server parity reconciliation notes in current backlog

## Gaps

- Backlog сам фиксирует, что pricing parity closure не завершён; task остаётся open.
- Repo всё ещё несёт duality `Supabase/runtime catalog` vs `seed fallback`, а historical pricing audit documents фиксируют риск drift.
- В client code pricing layer по-прежнему опирается на local catalog stack/seed behavior, тогда как accepted decisions требуют жёсткий source-of-truth lock around Supabase/runtime catalog for MVP.
- Legacy constructor/manual export pricing path в `src/constructor/**` не доказан мёртвым: локальные import chains для manual Basis/technical export still exist, поэтому этот слой оставлен как legacy-compatible, а не удалён.
- Отдельного merged closure evidence for full quote/order/stored snapshot parity в audit scope не подтверждено.

## Risks

- Release risk: пользователь может видеть корректную quote path только в части сценариев, пока full parity closure не доказана.
- Technical risk: source drift между client catalog, server catalog resolution и stored order snapshot.
- Ops risk: admin/manager decisions по цене могут опираться на inconsistent source attribution.

## Recommended Next Tasks

- Свести в один pricing closure pack evidence по `quote -> order -> stored snapshot -> admin summary`.
- Зафиксировать one-page source-of-truth map: client preview source, server authoritative source, fallback semantics, admin reporting source.
- Добрать explicit tests/evidence for production-panel pricing parity and stored snapshot parity where backlog still marks open scope.
- Отдельно решить судьбу legacy constructor/manual export pricing layer: quarantine guard or future removal only after reachability beyond manual Basis/technical export is proven.

## Evidence Required for Closure

- merged/main golden pricing fixtures
- client/server parity evidence on material, delivery, assembly and stored snapshot paths
- server-authoritative boundary verification
- GitHub QA success on pricing-related suite
- main verification against backlog closure wording

## Do Not Touch

- pricing formulas and rounding without accepted decision
- `package.json`, workflows and DB schema from pricing docs task
- order API semantics while trying to “fix” pricing evidence
- production cost model scope outside approved pricing task
