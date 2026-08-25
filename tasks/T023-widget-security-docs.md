---
id: T023
title: embed security and docs
milestone: M5
status: done
depends_on: [T021, T022]
scope: [packages/widget, docs, apps/api]
human_gate: false
max_attempts: 2
acceptance:
  - CSP/origin policy and deprecation policy documented
  - security tests cover origin, config size and injection cases
---
# Embed security
