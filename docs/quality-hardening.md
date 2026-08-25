# Quality hardening evidence

## Accessibility

- skip link targets the main content;
- keyboard focus uses a visible `:focus-visible` ring;
- charts include text labels and the history section includes a tabular fallback;
- mobile navigation has a button label and reduced-motion CSS path;
- provider freshness, quality and derived-data caveats are visible in copy.

## Performance budget

- static dashboard: no runtime framework dependency;
- no provider request is made directly by the browser UI;
- target: initial HTML under 150 KB compressed and API p95 under 800 ms;
- target: no unbounded client-side polling; refresh is explicit until a scheduler
  is configured.

## Security

- no secrets in source or fixtures;
- public API is GET/HEAD only with explicit CORS allowlist;
- widget config is schema-validated and capped at 8 KB;
- Vercel headers include nosniff, referrer policy and permissions policy;
- `pnpm security:audit` is the dependency gate before release.
