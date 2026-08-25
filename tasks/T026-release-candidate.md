---
id: T026
title: release candidate human gate
milestone: M6
status: ready
depends_on: [T024, T025]
scope: [docs, infra]
human_gate: true
max_attempts: 1
acceptance:
  - release checklist, rollback and licensing checklist are complete
  - production deploy is approved by a human before any action
---
# Release candidate

Prepare the evidence packet. Do not deploy.
