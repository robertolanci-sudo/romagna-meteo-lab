# Master plan

## Visione

Romagna Meteo Lab è una stazione meteorologica digitale regionale: una vista semplice per il pubblico, una console PRO per analisti e un layer di integrazione per hotel, spiagge, portali e siti locali.

## Output di prodotto

1. Dashboard Live e Forecast.
2. Model Compare con run, risoluzione, variabili e differenze.
3. Marine Desk con SST, onde, periodo, vento e indicatori costieri qualificati.
4. Archive/Climate con storico di almeno cinque anni e anomalie.
5. Model Battle basato su forecast archiviati contro osservazioni/reanalysis.
6. Mappe con layer meteo, marine e tecnico.
7. Widget Builder, embed script, iframe, Web Component e REST API.
8. Console operativa per freshness, provider failures, licenze e data quality.

## Principi architetturali

- provider-agnostic adapter;
- dati immutabili in ingresso, trasformazioni versionate;
- UTC internamente, timezone locale solo in presentazione;
- idempotenza per location/model/run/valid time/variable;
- ogni valore porta unità, fonte, dataset, risoluzione e confidence metadata;
- API server-side con cache e rate limit;
- separazione tra prodotto pubblico e funzioni PRO;
- nessun ML proprietario prima di una baseline di scoring riproducibile.

## Roadmap sintetica

| Milestone | Risultato | Gate |
|---|---|---|
| M0 | repository, ADR, contratti, policy e task graph | decisioni bloccanti approvate |
| M1 | vertical slice Live/Forecast funzionante | dati reali normalizzati e UI navigabile |
| M2 | Marine/SST + mappe | marine data con provenance e layer base |
| M3 | storico e climate archive | import idempotente e anomalie verificabili |
| M4 | Model Battle | scoring per parametro e lead time |
| M5 | Widget SDK + API pubblica | embed isolato, versionato e rate-limited |
| M6 | hardening e release candidate | security, performance, observability, go/no-go umano |

## Non-obiettivi iniziali

Radar proprietario, nowcasting, allerta ufficiale, previsione proprietaria operativa, marketplace, pagamenti e white-label commerciale completo. Possono diventare epiche successive solo dopo la base M6.
