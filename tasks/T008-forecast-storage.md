---
id: T008
title: canonical forecast storage
milestone: M1
status: done
depends_on: [T006, T007]
scope: [apps/api, packages/domain, packages/jobs, infra]
human_gate: false
max_attempts: 2
acceptance:
  - upsert key is idempotent
  - run/lead/valid time are queryable
  - freshness and parser version are stored
---
# Forecast storage

Add migrations and repositories without destructive resets.
