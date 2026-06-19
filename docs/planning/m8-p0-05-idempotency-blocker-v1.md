# M8-P0-05 Idempotency Policy — GitHub Tool Blocker

## Status

M8-P0-05 / Duplicate submit and payload-match idempotency policy не выполнена.

Текущий статус:

open / blocked for GitHub-tool implementation

Accepted policy still open.

Остаются не реализованы:

- same payload replay должен возвращать тот же order/result;
- different payload replay должен возвращать 409 conflict;
- replay не должен создавать duplicate order;
- replay не должен повторно отправлять manager/customer notifications;
- frontend должен корректно обрабатывать replay и 409 conflict;
- frontend cooldown не считается полноценной idempotency;
- duplicate order id не равен payload-match idempotency.

## What was attempted

Были выполнены read-only audit и feasibility checks.

Подтверждено:

- сервер не использует Idempotency-Key;
- нет payload hash / payload match;
- duplicate order_id сейчас не является полноценной idempotency;
- frontend cooldown не является idempotency.

## Why GitHub tool implementation is blocked

GitHub-tool implementation остановлен по safety reasons:

1. tests/checkout-submit-hook.test.ts слишком большой для безопасного full-file replacement.
2. Новый tests/idempotency-policy.test.ts не будет запускаться существующими scripts без изменения package.json.
3. package.json нельзя безопасно изменить через текущий GitHub tool, потому что файл читается усечённо.
4. Создавать неисполняемый test file нельзя, потому что это даст ложное test-first evidence.

## Required next path

Безопасный путь:

- выполнить test-first policy lock локально через VS Code/Codex;
- либо вернуться к GitHub-tool implementation, когда будет доступен безопасный patch/range-edit механизм;
- до этого M8-P0-05 остаётся open.

## Out of scope

Этот blocker note не закрывает:

- M8-P0-05;
- duplicate submit policy;
- payload-match idempotency;
- manual retry;
- runtime implementation;
- Supabase schema changes.

## Recommended next backlog direction

Пока M8-P0-05 заблокирована для GitHub-tool implementation, следующие задачи через GitHub tool должны выбираться только из безопасных категорий:

- read-only audits;
- small docs-only planning files;
- backlog evidence notes in small files;
- small new test files only if existing scripts already run them;
- small runtime patches only in files that can be read fully and safely updated.
