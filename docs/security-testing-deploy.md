# Sicurezza, testing e deploy

## Security baseline

- no secrets in Git, fixtures, screenshots or logs;
- secret scanning and dependency audit in CI;
- least-privilege service accounts;
- signed webhook/job inputs and replay protection;
- API rate limiting per client and route;
- public endpoints read-only by default;
- tenant/widget configuration isolation;
- CSP, security headers, input validation and output encoding;
- provider terms and attribution stored with dataset metadata;
- human approval required for production deploy, paid services, secret injection, migrations that can lose data, and destructive commands.

## Test pyramid

Unit: units, timezones, consensus, scoring and schema validation.

Integration: provider adapters with recorded fixtures, database repositories, cache behavior, job idempotency and API contracts.

End-to-end: dashboard navigation, location switch, compare, marine, history, widget preview and copy embed code.

Non-functional: accessibility, performance budgets, rate-limit behavior, provider timeout/fallback, migration rehearsal, backup restore rehearsal.

## Release gates

`format → lint → typecheck → unit → integration → build → e2e → accessibility → security audit`.

Staging may be automated only if the environment and credentials were previously approved. Production is always a human gate. Rollback must be documented before the first release.

## Observability

Structured logs with correlation IDs, ingestion freshness, provider latency/error rate, cache hit rate, API p95, job backlog, score sample counts and widget errors. Never log raw credentials or unrestricted provider payloads.
