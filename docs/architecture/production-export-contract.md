# Production Export Contract — Razmerno

Date: 2026-06-13
Type: architecture contract documentation.

## Goal

Define the documentation boundary for future production export work without changing application code.

## Principles

- Export data should be independent from visual UI.
- Internal technical data should stay in internal layers.
- Export structures should be stable and versioned.
- Future integrations should rely on documented contracts.

## Protected scope

Do not change these areas without a separate task:

- export logic;
- production rules;
- geometry output;
- hardware output;
- integration output;
- revision behavior.

## Acceptance

This file is a high-level contract. A detailed payload document should be created in a later stage.
