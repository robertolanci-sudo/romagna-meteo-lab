---
id: T009
title: forecast API v1
milestone: M1
status: done
depends_on: [T008]
scope: [apps/api, packages/contracts]
human_gate: false
max_attempts: 2
acceptance:
  - overview, forecast and model compare endpoints return contract-valid JSON
  - cache and rate-limit behavior are covered
  - provenance is present in responses
---
# Forecast API

Expose read-only server-side data.
