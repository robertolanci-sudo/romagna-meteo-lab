# Deploy iniziale a costo zero

## Frontend

Il frontend statico vive in `apps/web`. Su Vercel crea un progetto dal
repository e usa la root del progetto `/` con `vercel.json` già presente, oppure
imposta `apps/web` come Root Directory per un progetto statico separato.

Il piano Hobby di Vercel è adatto a prototipi e progetti personali. Prima di un
uso commerciale verifica i termini del piano e dei provider dati.

## Dati persistenti

Per la prima fase si può usare Supabase Free come PostgreSQL gestito. Il piano
gratuito ha 500 MB di database, 1 GB di storage, 5 GB di egress e può mettere in
pausa progetti inattivi; non usarlo come archivio quinquennale senza una policy
di retention e backup.

Configurazione prevista, senza segreti nel repository:

- `DATABASE_URL` solo nelle environment variables Vercel/Supabase;
- migrazioni additive da `infra/migrations`;
- provider keys eventualmente presenti solo in environment variables;
- nessun endpoint browser che chiama direttamente provider con credenziali.

## Comandi locali

```text
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Il deploy di produzione resta un gate operativo: richiede login Vercel,
selezione del progetto, environment variables e verifica del dominio.

Le funzioni Vercel pubblicate dal repository sono:

- `/api/health`;
- `/api/v1/locations/:slug/forecast`;
- `/api/v1/locations/:slug/marine`.
