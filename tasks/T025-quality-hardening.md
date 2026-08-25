---
id: T025
title: performance/accessibility/security
milestone: M6
status: done
depends_on: [T010, T013, T019, T023]
scope: [apps/web, apps/api, packages, docs]
human_gate: false
max_attempts: 2
acceptance:
  - accessibility audit has no critical findings
  - performance budgets are measured on key screens
  - dependency/secret/security checks pass
---
# Hardening
