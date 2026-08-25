---
id: T011
title: marine adapter
milestone: M2
status: done
depends_on: [T003, T008]
scope: [packages/providers, packages/domain, packages/jobs]
human_gate: false
max_attempts: 2
acceptance:
  - SST, wave height, direction, period and wind wave are normalized
  - sea/land grid choice is explicit
  - coastal limitations are metadata
---
# Marine adapter

Implement marine data with source and grid provenance.
