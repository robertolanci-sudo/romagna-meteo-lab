# Task graph

Formato: ogni task è atomico, ha ownership e scope file. Il runner usa `status`, `depends_on`, `scope`, `human_gate` e `acceptance` dal frontmatter.

## Ordine logico

```text
T001 ─┬─ T002 ─┬─ T006 ─┬─ T007 ─┬─ T008 ─ T009 ─ T010
      ├─ T003 ─┘        ├─ T011 ─ T012 ─ T013
      ├─ T004 ──────────└─ T014 ─ T015 ─ T016 ─ T017 ─ T018 ─ T019
      └─ T005 ─────────────────────────────── T020 ─ T021 ─ T022 ─ T023
                                                        └─ T024 ─ T025 ─ T026
```

## Inventory

| ID | Milestone | Title | Dependencies |
|---|---|---|---|
| T001 | M0 | repository baseline | — |
| T002 | M0 | ADR e contratti dominio | T001 |
| T003 | M0 | provider/license register | T001 |
| T004 | M0 | CI quality gates | T001 |
| T005 | M0 | orchestration safety contract | T001 |
| T006 | M1 | location catalog | T002 |
| T007 | M1 | provider adapters forecast | T002,T003 |
| T008 | M1 | canonical forecast storage | T006,T007 |
| T009 | M1 | forecast API v1 | T008 |
| T010 | M1 | Command Center UI | T009 |
| T011 | M2 | marine adapter | T003,T008 |
| T012 | M2 | marine API and derived metrics | T011 |
| T013 | M2 | Map Room | T009,T012 |
| T014 | M3 | historical importer | T003,T008 |
| T015 | M3 | climate aggregates/anomalies | T014 |
| T016 | M3 | History UI | T015 |
| T017 | M4 | forecast target alignment | T014 |
| T018 | M4 | scoring engine | T017 |
| T019 | M4 | Model Battle UI/API | T018 |
| T020 | M5 | public API hardening | T009,T012 |
| T021 | M5 | widget runtime | T020 |
| T022 | M5 | widget builder | T021 |
| T023 | M5 | embed security and docs | T021,T022 |
| T024 | M6 | observability and runbooks | T009,T014 |
| T025 | M6 | performance/accessibility/security | T010,T013,T019,T023 |
| T026 | M6 | release candidate human gate | T024,T025 |
