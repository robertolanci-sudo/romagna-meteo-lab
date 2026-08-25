# Widget embed security

- Widget config is schema-validated, versioned and capped at 8 KB.
- Script embeds render only read-only data; provider credentials never enter a
  config or browser response.
- iframe embeds use `sandbox="allow-scripts"` and should be served with a
  restrictive `frame-ancestors` policy in the host deployment.
- Production origins must be allowlisted; wildcard CORS is not permitted.
- Config values are written with DOM text APIs, never unsanitized HTML.
- A widget version remains supported for one deprecation window; removal needs a
  documented migration and a response header announcing the replacement.
- Stale data renders an explicit stale state rather than a false current value.
