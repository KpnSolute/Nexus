---
name: Orval path+query param collision
description: Operations with BOTH path params AND query params cause TS2308 collision in api-zod barrel
---

When an OpenAPI operation has path parameters AND query parameters, Orval generates:
- `GetXxxParams` in `generated/api.ts` (Zod schema for path params)
- `GetXxxParams` in `generated/types/` (TypeScript interface combining all params)

Both get re-exported from `lib/api-zod/src/index.ts` via `export *`, causing TS2308.

**Why:** Orval uses `<OperationIdPascal>Params` for path params in Zod output and the same name for the combined TypeScript interface.

**How to apply:** When an endpoint needs both path params and query params, restructure: embed the query param as a second path segment (e.g. `/markets/{symbol}/candles/{interval}`) or drop query params entirely and use server defaults. Operations with ONLY path params or ONLY query params do not collide.
