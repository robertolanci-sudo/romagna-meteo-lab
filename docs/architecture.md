# Architettura

## Topologia logica

```text
Provider adapters
  ├─ atmospheric: Open-Meteo / ECMWF / ARPAE-ItaliaMeteo
  ├─ marine: Open-Meteo Marine / provider futuro
  ├─ historical: ERA5/ERA5-Land/IFS + observations
  └─ geospatial: geocoding/elevation/map tiles
          ↓
Ingestion jobs → raw object storage → validation/quarantine
          ↓
Normalizer → canonical weather schema → PostgreSQL/Timescale + PostGIS
          ↓
Forecast engine → consensus / dispersion / derived metrics
Archive scorer → observations/reanalysis → Model Battle aggregates
          ↓
API v1 / BFF → web app, widgets, external clients
```

## Repository target

```text
apps/web              Next.js app and route handlers
apps/api              Fastify/Nest-style API service
packages/contracts    Zod/OpenAPI contracts and generated types
packages/domain       units, locations, forecast and scoring rules
packages/providers     provider adapters and fixtures
packages/ui            design system and chart/map primitives
packages/widget       Web Component and embed runtime
packages/jobs         ingestion, archive and scoring workers
infra                  IaC, environments and observability
docs                   ADRs, runbooks and product specifications
tasks                  atomic Codex task files
orchestration          task graph and runner
```

## Stack decision

- TypeScript strict mode, Node.js LTS, pnpm workspaces.
- Next.js + React for web app; Tailwind only for primitives, CSS variables for visual system.
- MapLibre GL JS for maps; deck.gl only if later justified by layer volume.
- Apache ECharts or lightweight SVG/canvas primitives for charts; every chart must have accessible data table fallback.
- PostgreSQL + TimescaleDB + PostGIS; object storage for raw payloads and exports.
- Redis-compatible cache/queue for short-lived forecast cache and jobs.
- OpenAPI 3.1 + Zod contracts; generated client for web/widget.
- Vitest, Playwright, contract tests, ESLint, Prettier, typecheck.
- Docker for local parity; managed hosting only after human-approved M6 gate.

## Domain boundaries

`Location`, `Provider`, `ModelRun`, `ForecastSeries`, `MarineSeries`, `Observation`, `DatasetSnapshot`, `Scorecard`, `WidgetConfig` are domain concepts. Provider response shapes never cross into UI or public API.

## Reliability

Every ingestion run is idempotent and records `source_url`, `retrieved_at`, `provider_run_at`, `license_ref`, checksum, parser version and validation result. Partial provider failure does not invalidate healthy providers; API returns freshness and provenance metadata.
