# Admin status audit trail

## Migration

Apply:

`supabase/migrations/20260526_add_order_status_events.sql`

## Table

`public.order_status_events`

Fields:

- `order_id`
- `from_status`
- `to_status`
- `changed_by`
- `created_at`

## MVP limitation

`changed_by` is currently static `admin`, because full server-side admin authentication is not implemented yet.
