---
name: Kraken data source
description: Market data source decision — why Kraken, how it's structured, symbol format
---

## Decision: Kraken Public API (no key required)

NEXUS uses Kraken as its sole market data source after CoinGecko (429 rate limits) and Binance (451 geo-block) failed.

**Why Kraken:**
- Public REST + WebSocket v2, zero auth required
- Not geo-blocked in Replit's environment
- Real OHLCV candles via `/0/public/OHLC`
- Real-time ticks via `wss://ws.kraken.com/v2` (ticker channel)

**Symbol format in NEXUS:**
- Frontend + DB uses `BTC-USDT` format (dash-separated)
- Kraken REST uses `XBTUSD`, `ETHUSD`, etc. (internal names mapped in `market-data.ts`)
- Kraken WS v2 publishes `BTC/USD` format — mapped back to `BTC-USDT` in `lib/websocket.ts`
- Alpaca uses `BTC/USD` format — `lib/alpaca.ts` converts from `BTC-USDT`

**13 active pairs:** BTC, ETH, SOL, XRP, ADA, DOGE, AVAX, LINK, DOT, UNI, LTC, ATOM, FIL
(BNB and MATIC dropped — unreliable on Kraken)

**DOGE ohlcPair:** Uses Kraken internal name `XDGUSD` — verify if it ever returns no data.

**How to apply:**
- Any new market addition must map its Kraken internal symbol name in `lib/market-data.ts`
- Default symbol in market page is `BTC-USDT` (not `BTC/USD`)
