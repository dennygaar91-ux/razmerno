# CI npm ci Investigation 001 — Razmerno

Date: 2026-06-13
Type: CI investigation note.

## Finding

The QA workflow reached dependency installation and failed before project scripts started.

## Workflow facts

- Workflow file: `.github/workflows/qa.yml`
- Previous Node version: 22
- Install command: `npm ci`
- Registry: not explicitly configured in workflow
- `.npmrc`: not found during audit

## Action taken

The workflow was changed from Node 22 to Node 20 to reduce npm runtime instability risk.

## Not verified yet

A passing GitHub Actions run is still required before CI stabilization can be considered complete.

## Next step

Check the next QA workflow run. If install still fails, inspect job logs and then evaluate lockfile or registry issues.
