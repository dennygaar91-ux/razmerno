# ADR-003 — Protected zones

Date: 2026-06-13
Status: accepted

## Context

Some repository areas have high regression risk. They must be handled with stricter rules during long-term development.

## Decision

The project uses protected zones. These zones require a separate explicit task before changes are made.

Protected areas:

- pricing;
- orders;
- checkout;
- request delivery;
- Supabase;
- API;
- backend functions;
- admin area;
- export;
- production logic.

## Allowed during architecture preparation

Allowed work: documentation, ADR files, backlog files, QA matrices and read-only audit scripts.

## Consequences

- Future tasks must declare whether protected zones are affected.
- Reports must separate committed, prepared and missing work.
- Unclear cases must be treated as not approved.

## Acceptance rule

This ADR is active after this file and `docs/architecture/protected-zones.md` exist in GitHub.
