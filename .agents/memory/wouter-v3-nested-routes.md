---
name: Wouter v3 nested route path-stripping
description: In Wouter v3, a parent <Route path="/:rest*"> or any path-capturing Route strips the matched portion from the routing context, so child routes in the rendered component see a truncated path and fail to match.
---

## Rule
In Wouter v3, **never wrap protected areas in a `<Route path="/:rest*">` or similar wildcard route** if the rendered component contains its own `<Switch>` with routes. The wildcard consumes the path prefix and child routes cannot match.

**Why:** Wouter v3 changed nested routing semantics — matched path segments become the new routing base, so child routes see only the *remaining* path. A `/:rest*` catching `/market/BTC-USDT` leaves children with `market/BTC-USDT` (no leading slash), breaking all inner routes that expect `/market/:symbol`.

**How to apply:** Use a catch-all `<Route component={...} />` (no `path` prop) as the last item in a Switch for auth-guarded areas. A Route with no path is a catch-all that does NOT change the routing context, so child routes inside the rendered component still see the full pathname.

## Working pattern (App.tsx)

```tsx
<Switch>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  {/* No path → no path stripping → inner Switch sees full pathname */}
  <Route component={ProtectedArea} />
</Switch>
```

Inside `ProtectedArea`:
```tsx
<Layout>
  <Switch>
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/market/:symbol" component={Market} />
    ...
  </Switch>
</Layout>
```
