---
id: T024
title: observability and runbooks
milestone: M6
status: done
depends_on: [T009, T014]
scope: [infra, docs, apps/api, packages/jobs]
human_gate: false
max_attempts: 2
acceptance:
  - freshness, provider failure, p95, cache and job metrics exist
  - incident, provider outage and rollback runbooks exist
---
# Observability
