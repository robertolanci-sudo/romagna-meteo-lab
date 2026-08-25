# Release candidate checklist

## Automated evidence

- [x] `pnpm format`
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm test` — 26 tests green
- [x] `pnpm build`
- [x] `pnpm security:audit` — no known vulnerabilities found
- [x] provider/license register reviewed
- [x] rollback and provider outage runbooks present
- [x] Vercel configuration present without secrets

## Human release gate

- [ ] Vercel account/project selected
- [ ] environment variables inserted in the hosting dashboard
- [ ] provider commercial/non-commercial mode confirmed
- [ ] custom domain and DNS approved, if applicable
- [ ] production deploy explicitly approved after preview verification
