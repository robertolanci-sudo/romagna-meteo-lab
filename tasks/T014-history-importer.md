---
id: T014
title: historical importer
milestone: M3
status: done
depends_on: [T003, T008]
scope: [packages/jobs, packages/providers, apps/api]
human_gate: false
max_attempts: 3
acceptance:
  - five-year scope imports in chunks
  - rerun produces no duplicates
  - historical weather and historical forecast remain separate datasets
---
# Historical importer
