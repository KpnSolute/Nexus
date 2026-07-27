---
name: Composite tsconfig rebuild requirement
description: lib/db and lib/api-client-react use TypeScript composite+emitDeclarationOnly; adding new exports requires rebuilding their dist/ declaration files before dependent packages see them.
---

# Composite tsconfig rebuild requirement

**Rule:** After adding new exports to `lib/db` (schema files) or `lib/api-client-react` (after orval regen), you must rebuild their declaration files or the API server and frontend will report "has no exported member" for the new symbols.

**Why:** Both packages set `"composite": true` and `"emitDeclarationOnly": true` in tsconfig.json. The api-server references lib/db via tsconfig `references`, and the frontend uses lib/api-client-react via workspace resolution — both read from the `dist/` directory for type declarations, not the source.

**How to apply:**
- After any `lib/db/src/schema/` change: `cd lib/db && npx tsc -p tsconfig.json`
- After any orval regen in lib/api-client-react: `cd lib/api-client-react && npx tsc -p tsconfig.json`
- Run before attempting `npx tsc --noEmit` on dependent packages, or errors will be misleading.
- Also run `pnpm --filter @workspace/db push` after schema changes to apply DB migrations.
