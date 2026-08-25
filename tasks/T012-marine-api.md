---
id: T012
title: marine API and derived metrics
milestone: M2
status: done
depends_on: [T011]
scope: [apps/api, packages/domain, packages/contracts]
human_gate: false
max_attempts: 2
acceptance:
  - marine endpoint works for Romagna coastal locations
  - beach score is versioned and labeled as derived
  - missing or stale data is visibly reported
---
# Marine API
