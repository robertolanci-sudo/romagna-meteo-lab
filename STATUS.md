# Development status

Updated by the Codex orchestrator or a human reviewer.

## Current

- milestone: `M6`
- last task: `T026`
- next safe tasks: `none — production smoke test passed`
- human gate: `T026` complete; Vercel production deployment approved by project owner
- blockers: direct ARPAE redistribution remains disabled pending dataset-specific terms

## Log

- 2026-08-25 — T001 done; workspace install, format, lint, typecheck, unit test and build passed; baseline boundaries documented; no human gate.
- 2026-08-25 — T002 done; canonical contracts and UTC/unit validation tests passed.
- 2026-08-25 — T004 done; GitHub CI quality workflow added without external secrets; all local gates passed.
- 2026-08-25 — T005 done; runner graph and dry-run diagnostics passed; human-gated work is not dispatched.
- 2026-08-25 — T003 blocked-human; exact provider dataset terms and redistribution policy require human approval.
- 2026-08-25 — T006 done; ten validated coastal/inland locations seeded with searchable slugs and coordinates; all local gates passed.
- 2026-08-25 — T003 done after approval; provider register added with Open-Meteo, ECMWF, ItaliaMeteo/ARPAE, Copernicus and marine constraints.
- 2026-08-25 — T007 done; Open-Meteo adapter normalizes three model keys, preserves provenance and isolates timeout/HTTP/schema failures.
- 2026-08-25 — T008 done; additive SQL migration and idempotent forecast repository added; run/lead/valid time and provenance are queryable.
- 2026-08-25 — T009 done; read-only v1 API service added with overview, forecast, compare, cache, rate limiting and provenance responses.
- 2026-08-25 — T011 done; marine adapter added for SST, waves, direction, period and wind-wave height with explicit grid mode and coastal limitation metadata.
- 2026-08-25 — T012 done; marine endpoint and versioned derived beach score added with stale/provider error visibility.
- 2026-08-25 — T014 done; chunked idempotent historical importer separates weather and forecast datasets.
- 2026-08-25 — T015 done; reproducible monthly aggregates and baseline anomalies added with dataset/formula versions.
- 2026-08-25 — T017 done; forecast-target alignment uses valid-time tolerance and explicit exclusion reasons.
- 2026-08-25 — T018 done; MAE, RMSE, bias, Brier and circular direction scoring added with minimum-sample publication gate.
- 2026-08-25 — T010 done; dashboard UI vanilla responsive integrata da riferimento con forecast, marine, storico, scoring, alert e widget studio seams.
- 2026-08-25 — deploy preparation; Vercel static configuration and free-tier deployment runbook added; no external deployment or secrets performed.
- 2026-08-25 — T016 done; history screen includes a visual trend and the accessible data seam is documented for tabular rendering.
- 2026-08-25 — T019 done; Model Battle ranking exposes metric, lead bucket, period, samples and incomplete coverage.
- 2026-08-25 — T020 done; public API v1 hardening added for CORS, methods, error contract and provider boundary.
- 2026-08-25 — T021 done; versioned widget config, Web Component renderer and script/iframe embed snippets added with stale-data fallback.
- 2026-08-25 — T022 done; widget preview validation and safe script/iframe embed builder added with 8 KB config cap.
- 2026-08-25 — T023 done; embed CSP, origin, injection, stale-state and deprecation policies documented.
- 2026-08-25 — T013 done; Map Room state model supports explicit layers, time scrubber, attribution and reduced-motion fallback.
- 2026-08-25 — T024 done; freshness, provider failure, p95, cache and backlog metrics plus outage/rollback runbooks added.
- 2026-08-25 — T025 done; skip link, focus states, table fallback, security headers, performance targets and audit command documented.
- 2026-08-25 — T025 security evidence complete; Vitest 3.2.7/Vite 6.4.3 pinned and npm audit reports no known vulnerabilities.
- 2026-08-25 — T026 ready; release candidate checklist complete, deployment intentionally not executed without Vercel project/account configuration.
- 2026-08-25 — live Vercel API wiring; health, forecast and marine serverless routes added; dashboard now attempts server-side forecast data with demo fallback.
- 2026-08-25 — Vercel runtime fix; serverless routes no longer load workspace package imports at runtime, preserving server-side provider access and local fallback.
- 2026-08-25T14:37:55.553Z — human gate pending: T026
- 2026-08-25 — T026 done; production URL, health, forecast and marine routes verified. Forecast falls back to Open-Meteo `best_match` when a forced model has no numeric coverage.
