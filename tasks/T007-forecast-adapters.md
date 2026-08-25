---
id: T007
title: provider adapters forecast
milestone: M1
status: done
depends_on: [T002, T003]
scope: [packages/providers, packages/contracts, packages/domain]
human_gate: false
max_attempts: 3
acceptance:
  - at least three configured models normalize into one schema
  - timeouts, retries and malformed payloads are tested
  - raw response provenance is retained
---
# Forecast adapters

Implement Open-Meteo-backed adapters first; keep direct-provider adapters behind the same interface.
