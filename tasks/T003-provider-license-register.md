---
id: T003
title: provider/license register
milestone: M0
status: done
depends_on: [T001]
scope: [docs/provider-references.md, docs, packages/providers]
human_gate: true
max_attempts: 1
acceptance:
  - each adapter has source, dataset, terms, attribution and retention fields
  - unresolved redistribution terms are explicitly marked blocked-human
---
# Provider and licensing register

Record exact datasets and limitations. Do not infer permission from an API being reachable.
