---
id: T002
title: ADR e contratti dominio
milestone: M0
status: done
depends_on: [T001]
scope: [packages/contracts, packages/domain, docs/architecture.md]
human_gate: false
max_attempts: 2
acceptance:
  - canonical location, run, series, observation and provenance schemas exist
  - units and UTC rules have tests
  - OpenAPI/Zod contract can be generated or checked
---
# Domain contracts

Implement the smallest canonical schema that prevents provider shapes leaking into UI.
