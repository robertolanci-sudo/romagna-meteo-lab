---
id: T020
title: public API hardening
milestone: M5
status: done
depends_on: [T009, T012]
scope: [apps/api, packages/contracts, docs]
human_gate: false
max_attempts: 2
acceptance:
  - versioning, rate limits, CORS and error contract documented
  - no provider credentials cross the boundary
---
# Public API
