# Runbook operativi

## Provider outage

1. Mark the provider unhealthy and stop only its ingestion path.
2. Keep healthy providers serving with a visible freshness/quality state.
3. Do not silently substitute observations, reanalysis and forecast.
4. Retry with bounded backoff; quarantine malformed payloads.
5. Record source, error class, last successful run and recovery time.

## Incident API

1. Check p95, error rate, cache hit rate and provider failure counters.
2. Reduce expensive horizons and preserve read-only overview responses.
3. Rotate credentials only through the secret manager; never log them.
4. Restore normal limits after two healthy observation windows.

## Rollback

Deployments are immutable. Roll back the Vercel deployment to the previous
known-good build, keep migrations additive, and validate API version/provenance
before reopening traffic.
