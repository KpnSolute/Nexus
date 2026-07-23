import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { logger } from "./logger";
import { getTickers } from "./market-data";

interface SubscribedClient {
  ws: WebSocket;
  symbols: Set<string>;
}

const clients: Set<SubscribedClient> = new Set();

export function createWebSocketServer(server: import("http").Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    logger.info({ ip: req.socket.remoteAddress }, "WebSocket client connected");

    const client: SubscribedClient = { ws, symbols: new Set() };
    clients.add(client);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "subscribe" && Array.isArray(msg.symbols)) {
          client.symbols = new Set(msg.symbols);
          logger.info({ symbols: [...client.symbols] }, "Client subscribed");
          // Immediately send current tickers
          sendTickersToClient(client);
        }
      } catch (err) {
        logger.warn({ err }, "Invalid WebSocket message");
      }
    });

    ws.on("close", () => {
      clients.delete(client);
      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.warn({ err }, "WebSocket error");
      clients.delete(client);
    });
  });

  // Broadcast tickers to all subscribed clients every 3 seconds
  setInterval(async () => {
    if (clients.size === 0) return;
    const tickers = await getTickers();
    for (const client of clients) {
      if (client.ws.readyState !== WebSocket.OPEN) continue;
      for (const symbol of client.symbols) {
        const ticker = tickers.get(symbol);
        if (!ticker) continue;
        // Add small random jitter to simulate live movement
        const jitter = (Math.random() - 0.5) * ticker.price * 0.0008;
        try {
          client.ws.send(JSON.stringify({
            type: "ticker",
            symbol: ticker.symbol,
            price: +(ticker.price + jitter).toFixed(8),
            change24h: ticker.change24h,
            changePct24h: ticker.changePct24h,
          }));
        } catch {
          // ignore send errors
        }
      }
    }
  }, 3000);

  return wss;
}

async function sendTickersToClient(client: SubscribedClient) {
  const tickers = await getTickers();
  for (const symbol of client.symbols) {
    const ticker = tickers.get(symbol);
    if (!ticker) continue;
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    try {
      client.ws.send(JSON.stringify({
        type: "ticker",
        symbol: ticker.symbol,
        price: ticker.price,
        change24h: ticker.change24h,
        changePct24h: ticker.changePct24h,
      }));
    } catch {
      // ignore
    }
  }
}
