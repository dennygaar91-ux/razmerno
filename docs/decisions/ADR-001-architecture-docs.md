# ADR-001 — Architecture documentation first

Date: 2026-06-13
Status: accepted

## Context

The Razmerno repository is growing across frontend, 3D, pricing, checkout, backend, Supabase, admin, production export and CI. The project needs stable documentation before the next constructor development phase.

## Decision

Architecture documentation must be completed before new constructor implementation work.

Minimum required docs:

- project map;
- runtime boundaries;
- constructor state and layout boundaries;
- protected zones;
- constructor architecture;
- testing strategy;
- CI and audit pipeline;
- backlog v3.

## Consequences

Benefits:

- clearer boundaries for future agents and developers;
- lower regression risk;
- easier GitHub fact-checking;
- safer separation between documentation and runtime changes.

Tradeoff:

- feature development starts only after the architecture block is complete.

## Acceptance rule

A document is complete only after it exists in GitHub and can be read back from the repository.
