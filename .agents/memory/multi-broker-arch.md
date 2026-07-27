---
name: Multi-broker connector architecture
description: How the 4 new broker connectors work, paper mode routing, and the automation engine location.
---

# Multi-broker connector architecture

## Broker clients (`artifacts/api-server/src/lib/`)

| Exchange | File | Auth mechanism | Symbol format |
|----------|------|---------------|---------------|
| Coinbase | `coinbase.ts` | JWT ES256 (CDP keys: keyName + PEM EC private key) | BTC-USD (converts from BTC-USDT) |
| Binance | `binance.ts` | HMAC-SHA256, `X-MBX-APIKEY` header + `signature` param | BTCUSDT |
| Kraken | `kraken-private.ts` | HMAC-SHA512 nonce, POST body | XBTUSDT |
| Bybit | `bybit.ts` | HMAC-SHA256, `X-BAPI-*` headers | BTCUSDT |

`broker-factory.ts` dispatches to the right adapter given an account row from DB.

## Paper mode
All brokers support `mode: "paper" | "live"`. Paper mode routes **all** order placement to the local `tradesTable` using current Kraken price as fill price. Live mode calls the real exchange API.

**Why:** Users can test automations without real funds; validation of keys still runs against the live API on connect.

## Automation engine
Lives in `artifacts/api-server/src/lib/websocket.ts`, `evaluateAutomations()` function. Called on every Kraken WS price tick for a symbol. Uses an in-memory `firingSet` (Set<number>) to prevent double-firing while a rule is being processed. Rule states: active → triggered → completed/failed.

## DB schema
`lib/db/src/schema/automations.ts` — automationsTable. Push with `pnpm --filter @workspace/db push`.

## Routes
- `GET/POST /broker-accounts/:exchange/info|positions|orders` — `artifacts/api-server/src/routes/broker.ts`
- `GET/POST/DELETE /automations` — `artifacts/api-server/src/routes/automations.ts`
