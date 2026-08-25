---
id: T004
title: CI quality gates
milestone: M0
status: done
depends_on: [T001]
scope: [.github, package.json, tooling]
human_gate: false
max_attempts: 2
acceptance:
  - format, lint, typecheck, unit and build commands are defined
  - CI runs without external secrets
  - failures are non-zero and readable
---
# CI gates

Create local and CI-safe quality checks.
