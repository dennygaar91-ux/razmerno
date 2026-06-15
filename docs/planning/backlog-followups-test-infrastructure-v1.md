# Backlog Follow-ups — Test Infrastructure v1

Источник: итог Test Infrastructure Agent после QA-аудита.

Этот документ фиксирует задачи, которые нужно перенести/синхронизировать с `docs/planning/current-backlog.md`, если они ещё не внесены в основной backlog.

## P0

### P0-16 Constructor Reset Contract Resolution

Ответственный: Constructor Core Agent.

Описание: существует конфликт вокруг контракта `reset()` между `constructorStore.test.ts` и `constructorFlowSmoke.test.ts`. Нужно определить целевое поведение reset, зафиксировать контракт и синхронизировать тесты.

### P0-17 Constructor Smoke Test Stabilization

Ответственный: Constructor Core Agent.

Описание: `constructorFlowSmoke.test.ts` не соответствует текущему поведению constructor state/reset contract. Нужно стабилизировать smoke test после утверждения reset-контракта.

## P1

### P1-14 Deployment Validation Layer

Ответственный: Infrastructure Agent.

Описание: добавить слой deployment validation между GitHub Actions и Vercel, чтобы typecheck/build/fast tests выполнялись до деплоя.

### P1-15 Test Quarantine System

Ответственный: Infrastructure Agent.

Описание: добавить официальный quarantine-механизм для unstable/flaky tests, чтобы они не скрывались и не ломали весь pipeline без маркировки.

### P1-16 Fast / Medium / Heavy Test Separation

Ответственный: Infrastructure Agent.

Описание: финализировать разделение тестов на Fast, Medium и Heavy и использовать это разделение в CI.

## P2

### P2-04 Nightly Pipeline

Ответственный: Infrastructure Agent.

Описание: добавить nightly workflow для heavy tests, extended validation и coverage reports.

### P2-05 Release Pipeline

Ответственный: Infrastructure Agent.

Описание: добавить release workflow для полной pre-production проверки перед релизом.
