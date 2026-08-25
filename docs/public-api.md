# Public API v1

All public routes are read-only and versioned under `/v1`. Responses expose
source, dataset, retrieval timestamp, freshness, quality and attribution.

- CORS uses an explicit origin allowlist; wildcard origins are not permitted.
- `GET` and `HEAD` are the only public methods.
- Clients identify themselves with `x-client-id`; rate limiting is enforced at
  the API boundary.
- Errors use `{ error, requestId?, details? }` and never expose provider payloads
  or credentials.
- Provider keys and upstream credentials remain server-side environment values.
