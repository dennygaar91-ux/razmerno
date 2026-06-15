# API Contract CI Verification Report v1 — Размерно

Дата: 2026-06-15  
Роль: GitHub Actions / CI Verification Agent  
Статус: completed / passing workflow confirmed

## Executive Summary

API contract CI verification завершена. Предыдущие runs `27572949276` и `27573862283` падали на `Fast active tests` из-за Node 20 runtime mismatch с Supabase Realtime/WebSocket layer. QA workflow переведён на Node 22. Финальный PR/head run `27574702631` завершился `success`.

## Root Cause

Подтверждённая причина:

```text
Node 20 + @supabase/supabase-js + Realtime/WebSocket runtime
```

Результат до исправления:

- handler возвращал `502`;
- API order flow contract test ожидал `200`;
- `Fast active tests` падал.

Классификация: test infrastructure / runtime mismatch, не подтверждённый продуктовый баг.

## Fix Applied

Файл:

- `.github/workflows/qa.yml`.

Изменение:

```yaml
node-version: 22
```

Product/runtime code не менялся.

## Passing Workflow

Финальный passing run:

- Workflow: `QA`.
- Run: `27574702631`.
- Run number: `153`.
- Status: `completed`.
- Conclusion: `success`.
- Job: `Fast CI gate`.

Successful steps:

- `Install dependencies`;
- `Typecheck frontend`;
- `Typecheck API`;
- `Build frontend`;
- `Fast active tests`;
- `Coverage snapshot`;
- `Upload coverage artifact`;
- `Check CSS architecture`;
- `Check production geometry architecture`.

## Contract Test Confirmation

`.github/workflows/qa.yml` includes `npm run test:checkout-submit-hook` inside `Fast active tests`. Since `Fast active tests` passed in run `27574702631`, the API / checkout / Supabase contract suite is confirmed passing in GitHub Actions.

## P0 Closure Review

- P0-11: closed.
- P0-12: closed.
- P0-14: closed.
- P0-19: closed.
- P1-21: present and not duplicated.

## Remaining Risks

- Supabase checks are deterministic contract checks, not live Supabase/RLS integration tests.
- Browser E2E for constructor submit remains separate.
- P0-13 pricing parity remains outside this block.
