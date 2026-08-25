---
id: T017
title: forecast target alignment
milestone: M4
status: done
depends_on: [T014]
scope: [packages/jobs, packages/domain]
human_gate: false
max_attempts: 2
acceptance:
  - forecasts join observations/reanalysis by valid time and tolerance rules
  - sample exclusions are explicit
---
# Target alignment
