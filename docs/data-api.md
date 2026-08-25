# Dati, provider e API

## Provider strategy

| Capability | Primary | Fallback / future | Policy |
|---|---|---|---|
| Forecast multimodello | Open-Meteo Forecast API | direct ECMWF/DWD/NOAA adapters | backend-only, cache and attribution |
| Regional Romagna | ItaliaMeteo/ARPAE ICON-2I via supported upstream path | direct ARPAE feed when license/format approved | validate coverage and redistribution |
| Historical climate | ERA5 / ERA5-Land | Copernicus CDS direct | use consistent dataset for climate comparisons |
| Historical forecast | Open-Meteo Historical Forecast / Previous Runs / Single Runs | provider archives | preserve run and lead time |
| Marine | Open-Meteo Marine | Copernicus Marine / national sources | coastal limitations shown in UI |
| Observations | stations/boe partner feed | Meteostat or official national source after review | never mix with reanalysis silently |
| Geocoding/elevation | provider adapter | self-hosted/geospatial DB | cache terms and attribution |

The official references used for the initial adapter contracts are listed in `docs/provider-references.md`.

## Canonical entities

```sql
locations(id, slug, name, lat, lon, elevation_m, timezone, region, geom)
providers(id, key, name, terms_url, license_ref, active)
models(id, provider_id, key, display_name, resolution_m, domain, run_frequency)
model_runs(id, model_id, initialized_at, published_at, valid_from, valid_to, source_uri, checksum, parser_version)
forecast_points(id, run_id, location_id, valid_at, lead_hours, variable, value, unit, aggregation)
marine_points(id, run_id, location_id, valid_at, variable, value, unit, grid_mode)
observations(id, source_id, location_id, observed_at, variable, value, unit, quality_flag)
datasets(id, key, version, coverage_start, coverage_end, resolution_m, license_ref)
ingestion_runs(id, provider_id, started_at, finished_at, status, records, error_summary)
scorecards(id, location_id, model_id, variable, lead_bucket, period_start, period_end, metric, value, sample_count, version)
widget_configs(id, owner_id, slug, version, theme_json, allowed_variables, status)
```

## API v1

```text
GET /v1/locations?bbox=&q=
GET /v1/locations/:slug/overview?at=&horizon=
GET /v1/locations/:slug/forecast?models=&variables=&from=&to=&resolution=
GET /v1/locations/:slug/marine?variables=&from=&to=
GET /v1/locations/:slug/history?dataset=&from=&to=&variables=
GET /v1/locations/:slug/models/compare?variable=&from=&to=
GET /v1/locations/:slug/model-battle?variables=&lead=&period=
GET /v1/maps/:layer/tiles/:z/:x/:y
GET /v1/widgets/:slug/config
POST /v1/widgets/preview
```

Responses include `data`, `meta.source`, `meta.dataset`, `meta.retrievedAt`, `meta.validTime`, `meta.units`, `meta.freshness`, `meta.quality`, `meta.attribution`.

## Model Battle metrics

Baseline metrics: MAE/RMSE for temperature, Brier score and reliability for event probabilities, CRPS only where ensemble/probabilistic data is actually available, circular error for wind direction, bias and hit rate for precipitation thresholds. Compare by location, season, variable and lead bucket. Never rank models on incomparable samples.

## Data quality rules

- reject impossible units/ranges;
- detect duplicate and non-monotonic timestamps;
- quarantine schema drift;
- store null with reason, never silently impute;
- separate coastal grid mode (`land`, `sea`, `nearest`);
- label derived metrics and version their formula.
