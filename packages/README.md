# Shared packages

Shared package boundaries:

- `contracts`: Zod/OpenAPI schemas and generated transport types.
- `domain`: provider-independent weather and scoring rules.
- `providers`: external provider adapters and fixtures.
- `ui`: accessible visual primitives and data presentation.
- `widget`: isolated public embed runtime.
- `jobs`: ingestion, archive and scoring workers.

Packages must remain runtime-independent unless their package README documents
the dependency explicitly.
