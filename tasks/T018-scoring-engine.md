---
id: T018
title: scoring engine
milestone: M4
status: done
depends_on: [T017]
scope: [packages/domain, packages/jobs, apps/api]
human_gate: false
max_attempts: 2
acceptance:
  - MAE/RMSE/Brier/bias/wind-direction metrics are tested
  - scores slice by lead, season, variable and location
  - no score is published below minimum sample size
---
# Scoring engine
