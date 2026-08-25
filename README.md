# Romagna Meteo Lab

Base tecnica eseguibile per una piattaforma meteorologica multimodello dedicata a Rimini e alla Romagna.

## Documenti principali

- [Master plan](docs/master-plan.md)
- [Architettura](docs/architecture.md)
- [Dati, provider e API](docs/data-api.md)
- [Frontend e Widget SDK](docs/frontend-sdk.md)
- [Sicurezza, testing e deploy](docs/security-testing-deploy.md)
- [Orchestrazione Codex](docs/orchestration.md)
- [Registro milestone](milestones/README.md)
- [Task graph](tasks/README.md)
- [Prompt operativo per Codex](CODEX_MASTER_PROMPT.md)

## Stato iniziale

Milestone corrente: `M0` — fondazioni e decisioni bloccanti.

Il progetto non deve effettuare deploy, acquisti, provisioning a pagamento, uso di segreti, migrazioni distruttive o cancellazioni senza approvazione umana esplicita.

## Principio guida

`providers → ingestion → normalization → archive → forecast engine → API → web app / widgets`

Il browser non chiama direttamente i provider meteorologici: il backend applica cache, normalizzazione, provenance, rate limiting e policy di licenza.
