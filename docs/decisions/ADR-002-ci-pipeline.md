# ADR-002 — CI pipeline gate

Date: 2026-06-13
Status: accepted

## Context

The repository has a GitHub Actions QA workflow. The workflow currently stops at dependency installation before project scripts run.

## Decision

CI is a required gate before the next constructor development phase.

Baseline checks:

1. install dependencies;
2. infrastructure inventory check;
3. frontend typecheck;
4. API typecheck;
5. frontend build;
6. CSS architecture check;
7. production geometry architecture check.

## Current blocker

The current blocker is dependency installation. Until install succeeds, typecheck and build status cannot be considered verified in CI.

## Consequences

- CI stabilization must happen before implementation work.
- Workflow edits must be small and easy to revert.
- Node/npm version changes must be reported separately.

## Acceptance rule

This ADR is satisfied when the workflow is documented and CI stabilization work is tracked in the backlog.
