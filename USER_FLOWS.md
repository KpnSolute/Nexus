# NEXUS Terminal — Complete User Flow & Interaction Audit

> Last updated: 2026-07-24  
> Every clickable, typeable, hoverable, submittable interaction in the product.

---

## 1. Authentication Layer

### 1a. Login (`/login`)
| Interaction | Behavior | Notes |
|---|---|---|
| Type username | Text input, no validation until submit | No show/hide, no autocomplete blocked |
| Type password | Password input (masked) | |
| Submit form | POST `/api/auth/login` → redirect `/dashboard` on success | Error message displayed inline on failure |
| Click "Register New Operator" | Navigate to `/register` | |
| Direct-navigate to protected route | Redirect to `/login` | Handled by `ProtectedRoute` |

**Gaps identified:**
- No "Enter key" submission hint
- No loading state on the button while request is in-flight  ← **FIXED**
- No "forgot password" (acceptable for this product)
- Error message uses raw `error.message` — can expose internal errors  ← **FIXED**

---

### 1b. Register (`/register`)
| Interaction | Behavior | Notes |
|---|---|---|
| Type username | Text input | No uniqueness check until submit |
| Type password | Password masked | No strength indicator |
| Submit form | POST `/api/auth/register` → redirect `/dashboard` | |
| Click "Already have access? Login" | Navigate to `/login` | |

**Gaps identified:**
- No password strength/requirements shown to user  ← **FIXED**
- No password confirm field
- Register success shows no feedback before redirect

---

## 2. Global Chrome (Layout — always visible)

### 2a. Sidebar
| Interaction | Behavior |
|---|---|
| Click "Terminal" | Navigate `/dashboard` |
| Click "Portfolio" | Navigate `/portfolio` |
| Click "Trade History" | Navigate `/trades` |
| Click "Connected Accounts" | Navigate `/accounts` |
| Click "Settings" | Navigate `/settings` |
| Active item | Left blue border + blue text + blue bg tint |
| Hover non-active item | Bg muted + text foreground |
| Log Out button | POST `/api/auth/logout` → clear query cache → redirect `/login` |
| Sidebar at narrow width | Collapses to icons only (≤`md`) |

**Gaps identified:**
- No direct "Markets" shortcut — you can only reach a market page from watchlist/trending  ← **FIXED** (added nav entry)
- No keyboard navigation between nav items

### 2b. Top Header
| Interaction | Behavior |
|---|---|
| UTC clock display | Renders timestamp once at mount — **static, never ticks**  ← **FIXED** |
| `PAPER TRADING` badge | Shown when `user.tradingMode === 'paper'` |
| `REAL FUNDS ACTIVE` badge (pulsing red) | Shown when `user.tradingMode === 'real'` |

**Gaps identified:**
- Clock doesn't update — shows stale time after first render  ← **FIXED**
- Header mode badge reflects Settings toggle only, not Alpaca account mode  ← **FIXED**
- No connection status indicator (Kraken WS connected?)

---

## 3. Dashboard (`/dashboard`)

### 3a. Portfolio Summary Cards (×4)
| Interaction | Behavior |
|---|---|
| Hover card | Icon tints from muted → primary |
| Data refresh | Every 5 seconds via React Query |

Cards: Total Value, Total PNL, PNL %, Win Rate.  
**No interactions** — display only.

### 3b. Watchlist
| Interaction | Behavior |
|---|---|
| Open "Add Symbol" dropdown | Shows all 13 Kraken markets |
| Select symbol from dropdown | Sets `newSymbol` state |
| Click `+` button (or submit form) | POST `/api/markets/watchlist` → refetch watchlist |
| Hover watchlist card | Reveals `×` button (top-right), border tints blue |
| Click watchlist card | Navigate to `/market/:symbol` |
| Click `×` on watchlist card | DELETE `/api/markets/watchlist/:symbol` → refetch |
| Live prices | WebSocket `/ws` subscribed to watchlist symbols → instant ticks |

**Gaps identified:**
- Can add a symbol that's already in watchlist (duplicate, no guard)
- Watchlist price shows "LOADING..." until WS delivers first tick — no fallback to REST price  ← **FIXED**
- No drag-to-reorder
- WS connection silently fails on reconnect if tab is backgrounded

### 3c. Trending Markets
| Interaction | Behavior |
|---|---|
| Hover row | Border appears, bg card tint |
| Click row | Navigate to `/market/:symbol` |
| Data refresh | Every 5 seconds |

**No write interactions.** All 13 markets shown sorted by volume/change on the server.

---

## 4. Market Page (`/market/:symbol`)

### 4a. Header Strip (ticker stats)
| Interaction | Behavior |
|---|---|
| Symbol display | Shows decoded URL param |
| Price display | Polls every 5s from REST, green if up / red if down |
| 24H HIGH / LOW / VOL / MKT CAP | Static labels; MKT CAP shows `---` (Kraken doesn't provide it) |

**Gaps identified:**
- Price doesn't flash/animate when it changes  ← **FIXED**
- Market cap always `---` — label should say "VOL (BASE)"  ← **FIXED**
- No "last updated at" timestamp  ← **FIXED**

### 4b. Chart — Interval Selector
| Interaction | Behavior |
|---|---|
| Click 1M / 5M / 15M / 1H / 4H / 1D button | Sets interval → refetches candles from Kraken REST |
| Active button | Blue bg |

### 4c. Chart — Candlestick Display
| Interaction | Behavior |
|---|---|
| Hover candle bar | Recharts tooltip shows O/H/L/C values |
| Chart renders | Shows bodies ONLY — **wicks missing**  ← **FIXED** |

**Gaps identified:**
- Candlestick bodies render but no high/low wicks  ← **FIXED** (full SVG candlesticks)
- Y-axis formatter truncates at 2dp — bad for small coins like DOGE ($0.07)  ← **FIXED**
- X-axis labels overlap at 1m interval

### 4d. Order Book (Simulated)
| Interaction | Behavior |
|---|---|
| View | Shows 5 ask rows + spread + 5 bid rows |
| Sizes shown | **Re-randomized on every render** — flickers  ← **FIXED** |

**Gaps identified:**
- Sizes are `Math.random()` in render body — new values every re-render causes visual noise  ← **FIXED**
- Labeled "(SIMULATED)" — clear, but sizes still flicker

### 4e. Market Signals Panel
| Interaction | Behavior |
|---|---|
| Composite signal badge | STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL |
| Trend | Bullish / Bearish / Sideways with icon |
| RSI (14) | Green if < 30 (oversold), red if > 70 (overbought) |
| MACD | Green if positive, red if negative |
| Support / Resistance | Shown only if signals API provides values |

**No user interactions** — display only. Refreshes every 60s.

### 4f. Trade Panel
| Interaction | Behavior |
|---|---|
| Click BUY tab | Sets side=buy, green accent |
| Click SELL tab | Sets side=sell, red accent |
| Alpaca routing badge | Shown if Alpaca connected: blue (paper) or red (live) |
| Type quantity | Number input, any decimal |
| Type price | Number input; blank = market order (Alpaca) or no limit (paper) |
| Estimated total | `qty × price`, updates live as you type |
| Submit (paper) | POST `/api/trades` → invalidate trades/portfolio/positions |
| Submit (Alpaca) | POST `/api/alpaca/orders` → invalidate Alpaca orders/positions/account |
| Success | Green inline message with order ID (4s auto-dismiss) |
| Error | Red inline message with error text |
| Button disabled | When `qty <= 0` or request in-flight |

**Gaps identified:**
- Price input auto-fills from ticker but user can't easily clear to "market order" without deleting  ← **FIXED** (added clear button)
- No quantity presets (25%, 50%, 75%, 100% of buying power)  ← **ADDED** (% buttons)
- No notes field visible (exists in schema but hidden from UI for Alpaca path)

---

## 5. Portfolio (`/portfolio`)

### 5a. Summary Metrics
Four cards: Net Liquidity, Total PNL, Return %, Win Rate. Refresh every 10s.  
**No interactions.**

### 5b. Best / Worst Trade Cards
Display only — shows symbol strings. **No navigation to those trades.**

**Gap:** Best/worst trade should be clickable → navigate to that market  ← **FIXED**

### 5c. Open Positions Table
| Interaction | Behavior |
|---|---|
| Hover row | Bg muted tint |
| Click "TRADE" button | Navigate to `/market/:symbol` |

**Gaps identified:**
- No close position button — must navigate to market page then sell  ← **IMPROVED** (direct sell link)
- No sorting by PNL, size, symbol
- Position PNL doesn't update live (REST poll only, 5s)

---

## 6. Trade History (`/trades`)

### 6a. Filter Bar
| Interaction | Behavior |
|---|---|
| Type in symbol filter | Live client-side filter (case-insensitive) |
| Clear filter | Must manually delete text — no clear button  ← **FIXED** |

### 6b. Trade Table
| Interaction | Behavior |
|---|---|
| Hover row | Muted bg tint |
| Click row | Opens Trade Receipt modal |
| Click symbol link (in row) | Navigate to `/market/:symbol` (stops row click propagation) |
| Refresh | Every 15 seconds |

### 6c. Trade Receipt Modal
| Interaction | Behavior |
|---|---|
| Click `×` button | Close modal |
| Press Escape | Close modal (Radix Dialog) |
| Click backdrop | Close modal (Radix Dialog) |

Shows: symbol, side, status badge, execution price, quantity, total value, environment (paper/real), created/filled timestamps, operator notes.

**Gaps identified:**
- No "Go to Market" button from within the modal  ← **FIXED**
- Status "filled" vs "pending" — no indication of what "pending" means to the user

---

## 7. Connected Accounts (`/accounts`)

### 7a. Alpaca Live Panel (shown when connected)
| Interaction | Behavior |
|---|---|
| View Portfolio Value / Equity / Buying Power / Cash | Live data from Alpaca API |
| Click "POSITIONS" tab | Shows open positions from Alpaca |
| Click "ORDERS" tab | Shows order history from Alpaca |
| Hover position row | No interaction |
| Click cancel `×` on order (if cancellable) | DELETE `/api/alpaca/orders/:id` → refetch orders |

**Gaps identified:**
- No loading state between tab clicks
- Cancel button has no confirmation dialog  ← **FIXED**
- Positions can't be clicked to navigate to their market

### 7b. Active Connections List
| Interaction | Behavior |
|---|---|
| View account row | Shows label, exchange, paper/live badge, status, equity |
| Click "DISCONNECT" | `window.confirm()` dialog → DELETE `/api/accounts/:id` → refetch |

### 7c. Connect Alpaca Form
| Interaction | Behavior |
|---|---|
| Click "PAPER TRADING" radio card | Select paper mode (blue accent) |
| Click "LIVE TRADING" radio card | Select live mode (red accent) |
| Warning text updates | Shows appropriate risk text for selected mode |
| Type Account Label | Free text |
| Type API Key ID | Plain text, `autocomplete="off"` |
| Type Secret Key | Password masked, `autocomplete="new-password"` |
| Click "app.alpaca.markets" link | Opens Alpaca dashboard in new tab |
| Submit form | POST `/api/accounts` → validates keys live → shows error or success |
| "VALIDATING..." state | Button disabled + text changes during request |

**Gaps identified:**
- Can try to connect a second Alpaca account even if one is active (backend will store it)
- No key format validation (Alpaca keys start with `PK` for paper) — only length check

---

## 8. Settings (`/settings`)

### 8a. Trading Environment Toggle
| Interaction | Behavior |
|---|---|
| Click "PAPER TRADING" | If currently real → switch to paper. If already paper → no-op |
| Click "REAL FUNDS" | If currently paper → `window.confirm()` dialog → switch to real |
| Confirm real mode | PATCH `/api/auth/mode` → refetch user → header badge updates |
| Cancel real mode dialog | No change |

Active mode shows context card (green for paper, red for real).

**Gaps identified:**
- This toggle is independent of Alpaca account mode — confusing when both exist  ← **CLARIFIED** in UI
- No link from here to Connected Accounts to set up Alpaca  ← **FIXED**

### 8b. Operator Info
Display only: Username, System ID (`OP-XXXX`), Join date.  
**No interactions.**

---

## 9. 404 Page (`/not-found`)
| Interaction | Behavior |
|---|---|
| Click "Return to Terminal" | Navigate to `/dashboard` |

---

## Summary of All Improvements Implemented

### Bugs Fixed
| # | Bug | Fix |
|---|---|---|
| 1 | Header clock is static (renders once) | `useEffect` interval updates every second |
| 2 | Candlestick chart has no wicks | Full SVG candlestick with wick + body |
| 3 | Order book sizes re-randomize on every render | `useMemo` stabilizes sizes |
| 4 | Default market symbol was `BTC/USD` (wrong format) | Changed to `BTC-USDT` |
| 5 | Market cap always shows `---` but label says "MKT CAP" | Label changed to "VOL (QUOTE)" |

### UX Improvements Added
| # | Improvement | Where |
|---|---|---|
| 6 | Live price flash animation when Kraken tick arrives | Market page ticker |
| 7 | "Last updated" pulse dot on ticker | Market page header |
| 8 | 25% / 50% / 75% quantity preset buttons | Trade panel |
| 9 | Clear button on trade price input | Trade panel |
| 10 | Markets shortcut in sidebar nav | Layout sidebar |
| 11 | Symbol filter clear button | Trade History |
| 12 | "Go to Market" link inside Trade Receipt modal | Trades modal |
| 13 | Order cancel confirmation dialog (Alpaca orders) | Accounts page |
| 14 | Password requirements hint on register | Register page |
| 15 | Settings → Accounts link for Alpaca setup | Settings page |
| 16 | Loading states on login/register submit buttons | Login/Register |
| 17 | Alpaca mode shown in header when connected | Layout header |
| 18 | Watchlist cards show REST price while WS loads | Dashboard |
