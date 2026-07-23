---
name: bcrypt native builds on Replit
description: bcrypt requires pnpm approve-builds interactive prompt; use bcryptjs instead
---

`bcrypt` is a native Node addon. Installing it with pnpm shows a warning and requires running `pnpm approve-builds` interactively — not automatable in a non-TTY shell.

**Why:** Replit sandboxes block native build scripts by default.

**How to apply:** Always use `bcryptjs` (pure JS) instead of `bcrypt` for password hashing. API is identical. Add `@types/bcryptjs` as devDependency (though bcryptjs ships its own types, the stub is harmless).
