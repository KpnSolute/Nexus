---
name: WebSocket proxy routing
description: /ws path must be listed in artifact.toml paths or proxy silently drops WS connections
---

The shared reverse proxy only forwards paths explicitly listed in `artifact.toml`'s `paths` array. WebSocket upgrade requests to `/ws` are silently dropped if `/ws` is not listed alongside `/api`.

**Why:** The proxy matches paths for both HTTP and WebSocket upgrades using the same list.

**How to apply:** When adding WebSocket support to the API server, update its `artifact.toml` via `verifyAndReplaceArtifactToml` to include `/ws` in `paths = ["/api", "/ws"]`. Do this before testing WebSocket connectivity.
