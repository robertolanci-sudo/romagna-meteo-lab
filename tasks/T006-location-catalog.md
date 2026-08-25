---
id: T006
title: location catalog
milestone: M1
status: done
depends_on: [T002]
scope: [packages/domain, apps/api]
human_gate: false
max_attempts: 2
acceptance:
  - seed locations cover key Romagna coastal and inland points
  - slugs, coordinates, timezone and elevation validate
---
# Location catalog

Start with Rimini, Riccione, Cattolica, Bellaria-Igea Marina, Cesenatico, Ravenna, Cervia, Cesena, Forlì and San Marino, while keeping the model extensible.
