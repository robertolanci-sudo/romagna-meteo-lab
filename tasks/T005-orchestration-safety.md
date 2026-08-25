---
id: T005
title: orchestration safety contract
milestone: M0
status: done
depends_on: [T001]
scope: [docs/orchestration.md, orchestration, STATUS.md]
human_gate: false
max_attempts: 2
acceptance:
  - runner supports dry-run and graph diagnostics
  - human gates stop dispatch
  - no deploy, purchase, secret or destructive command is callable by default
---
# Orchestration safety

Implement or verify the bounded runner contract.
