---
name: Orval regeneration after OpenAPI spec changes
description: The generated api-client-react hooks go stale when openapi.yaml is updated without re-running orval. Missing hooks crash React components silently (no console error, blank page).
---

## Rule
Any time routes are added to `lib/api-spec/openapi.yaml`, **regenerate the client immediately** by running:

```bash
cd lib/api-spec && npx orval --config orval.config.ts
```

**Why:** React components that import undefined hooks (e.g. `usePlaceAlpacaOrder` before regeneration) crash during render. React catches the error internally — no pageerror fires in Playwright, no console error visible to testers — resulting in a completely blank page. This is nearly impossible to diagnose without knowing the root cause.

**How to apply:** After any `openapi.yaml` edit that adds new paths/operations, run orval before testing the frontend. The index.ts has `export * from './generated/api'` so new hooks are automatically available after regeneration.

## Orval config location
`lib/api-spec/orval.config.ts` → outputs to `lib/api-client-react/src/generated/api.ts`

## Duplicate export cleanup
After orval runs in clean mode (`clean: true`), it may append `export *` lines to `lib/api-client-react/src/index.ts`. Keep that file to exactly:
```ts
export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";
```
