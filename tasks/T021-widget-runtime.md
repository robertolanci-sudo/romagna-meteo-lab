---
id: T021
title: widget runtime
milestone: M5
status: done
depends_on: [T020]
scope: [packages/widget, packages/ui]
human_gate: false
max_attempts: 2
acceptance:
  - script, iframe and Web Component read-only modes work
  - theme schema is validated and versioned
  - widget fails gracefully on stale data
---
# Widget runtime
