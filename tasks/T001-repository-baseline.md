---
id: T001
title: repository baseline
milestone: M0
status: done
depends_on: []
scope: [package.json, pnpm-workspace.yaml, apps, packages, docs, tasks]
human_gate: false
max_attempts: 2
acceptance:
  - workspace installs reproducibly
  - strict TypeScript and formatting commands exist
  - empty app/package boundaries are documented
---
# Repository baseline

Create the workspace skeleton and developer commands. Do not add paid services, secrets or deploy configuration.
