/**
 * WebSocket server (frontend clients) + Kraken WS v2 client (live market data).
 *
 * Architecture:
 *  - Kraken WS v2 (wss://ws.kraken.com/v2) → receives ticker snapshots + updates
 *  - updateTickerFromStream() pushes prices into the shared tickerCache in market-data.ts
 *  - Frontend clients connect to /ws, subscribe to symbols, and receive live ticker messages
 *  - Tickers are broadcast immediately when Kraken sends an update (no artificial polling)
 */
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { logger } from "./logger";
import {
  SUPPORTED_MARKETS,
  updateTickerFromStream,
  fromKrakenWsSymbol,
  getTickers,
} from "./market-data";
import type { TickerData } from "./market-data";

// ─── Frontend client subscriptions ───────────────────────────────────────────

interface SubscribedClient {
  ws: WebSocket;
  symbols: Set<string>;
}

const clients: Set<SubscribedClient> = new Set();

// ─── Kraken WebSocket v2 public stream ────────────────────────────────────────
// URL: wss://ws.kraken.com/v2
// Auth: none required for public market data

const KRAKEN_WS_URL = "wss://ws.kraken.com/v2";

function connectKrakenStream(): void {
  let ws: WebSocket;
  try {
    ws = new WebSocket(KRAKEN_WS_URL);
  } catch (err) {
    logger.warn({ err }, "Failed to create Kraken WebSocket, retrying in 10s");
    setTimeout(connectKrakenStream, 10_000);
    return;
  }

  ws.on("open", () => {
    logger.info("Kraken WS v2 connected — subscribing to live tickers");
    // Subscribe to ticker channel for all supported markets
    const symbols = SUPPORTED_MARKETS.map(m => m.wsSymbol);
    ws.send(JSON.stringify({
      method: "subscribe",
      params: { channel: "ticker", symbol: symbols },
    }));
  });

  ws.on("message", (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());

      // Ignore heartbeats, status, and subscription confirmations
      if (!msg.channel || msg.channel !== "ticker" || !msg.data) return;
      if (msg.type !== "snapshot" && msg.type !== "update") return;

      const now = new Date().toISOString();

      for (const d of msg.data as Array<{
        symbol: string;
        last: number;
        change: number;
        change_pct: number;
        high: number;
        low: number;
        volume: number;
        vwap?: number;
      }>) {
        const ourSymbol = fromKrakenWsSymbol(d.symbol);
        if (!ourSymbol) continue;

        const ticker: TickerData = {
          symbol:       ourSymbol,
          price:        d.last,
          change24h:    d.change,
          changePct24h: d.change_pct,
          volume24h:    d.volume,
          high24h:      d.high,
          low24h:       d.low,
          marketCap:    null,
          updatedAt:    now,
        };

        // Update shared REST cache
        updateTickerFromStream(ticker);

        // Immediately forward to subscribed frontend clients
        broadcastTicker(ticker);
      }
    } catch {
      // ignore parse errors
    }
  });

  ws.on("error", (err) => {
    logger.warn({ err }, "Kraken WebSocket error");
  });

  ws.on("close", (code, reason) => {
    logger.info({ code, reason: reason.toString() }, "Kraken WS closed — reconnecting in 5s");
    setTimeout(connectKrakenStream, 5_000);
  });
}

// ─── Broadcast helpers ────────────────────────────────────────────────────────

function broadcastTicker(ticker: TickerData): void {
  if (clients.size === 0) return;
  const payload = JSON.stringify({
    type:         "ticker",
    symbol:       ticker.symbol,
    price:        ticker.price,
    change24h:    ticker.change24h,
    changePct24h: ticker.changePct24h,
    high24h:      ticker.high24h,
    low24h:       ticker.low24h,
    volume24h:    ticker.volume24h,
  });
  for (const client of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    if (!client.symbols.has(ticker.symbol)) continue;
    try { client.ws.send(payload); } catch { /* ignore */ }
  }
}

async function sendInitialTickers(client: SubscribedClient): Promise<void> {
  const tickers = await getTickers();
  for (const symbol of client.symbols) {
    const ticker = tickers.get(symbol);
    if (!ticker) continue;
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    try {
      client.ws.send(JSON.stringify({
        type:         "ticker",
        symbol:       ticker.symbol,
        price:        ticker.price,
        change24h:    ticker.change24h,
        changePct24h: ticker.changePct24h,
        high24h:      ticker.high24h,
        low24h:       ticker.low24h,
        volume24h:    ticker.volume24h,
      }));
    } catch { /* ignore */ }
  }
}

// ─── Public: create the server-side WebSocket handler ────────────────────────

export function createWebSocketServer(server: import("http").Server): WebSocketServer {
  // Start Kraken stream connection
  connectKrakenStream();

  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    logger.info({ ip: req.socket.remoteAddress }, "Frontend WS client connected");

    const client: SubscribedClient = { ws, symbols: new Set() };
    clients.add(client);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "subscribe" && Array.isArray(msg.symbols)) {
          client.symbols = new Set<string>(msg.symbols);
          logger.info({ symbols: [...client.symbols] }, "Client subscribed");
          // Send cached prices immediately on subscription
          sendInitialTickers(client);
        }
        if (msg.type === "unsubscribe" && Array.isArray(msg.symbols)) {
          for (const s of msg.symbols) client.symbols.delete(s);
        }
      } catch (err) {
        logger.warn({ err }, "Invalid WS message from frontend client");
      }
    });

    ws.on("close", () => {
      clients.delete(client);
      logger.info("Frontend WS client disconnected");
    });

    ws.on("error", (err) => {
      logger.warn({ err }, "Frontend WS error");
      clients.delete(client);
    });
  });

  return wss;
}
