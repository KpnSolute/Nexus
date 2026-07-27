/**
 * Bybit V5 Spot connector.
 *
 * apiKey    = Bybit API Key
 * apiSecret = Bybit API Secret
 *
 * Auth: HMAC-SHA256 with timestamp + recv_window.
 * Docs: https://bybit-exchange.github.io/docs/v5/intro
 */
import { createHmac } from "crypto";
import { logger } from "./logger";

const BASE = "https://api.bybit.com";
const RECV_WINDOW = 5000;

export interface BybitAccount {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  currency: string;
}

export interface BybitPosition {
  symbol: string;
  side: "long" | "short";
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
}

export interface BybitOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: string;
  qty: number;
  filledQty: number;
  filledAvgPrice: number | null;
  status: string;
  limitPrice: number | null;
  submittedAt: string;
  filledAt: string | null;
}

export interface BybitOrderInput {
  symbol: string; // e.g. "BTC-USDT"
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  limitPrice?: number;
}

export class BybitClient {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    public readonly mode: "paper" | "live",
  ) {}

  private sign(timestamp: number, params: string): string {
    const pre = `${timestamp}${this.apiKey}${RECV_WINDOW}${params}`;
    return createHmac("sha256", this.apiSecret).update(pre).digest("hex");
  }

  private toBybitSymbol(symbol: string): string {
    // BTC-USDT → BTCUSDT
    return symbol.replace("-", "");
  }

  private fromBybitSymbol(symbol: string): string {
    const quote = symbol.endsWith("USDT") ? "USDT" : symbol.endsWith("USDC") ? "USDC" : "USDT";
    const base = symbol.slice(0, symbol.length - quote.length);
    return `${base}-${quote}`;
  }

  private async get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const timestamp = Date.now();
    const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
    const sig = this.sign(timestamp, qs);
    const url = `${BASE}${path}${qs ? "?" + qs : ""}`;
    const res = await fetch(url, {
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": String(timestamp),
        "X-BAPI-SIGN": sig,
        "X-BAPI-RECV-WINDOW": String(RECV_WINDOW),
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Bybit ${res.status}: ${txt}`);
    }
    const json = await res.json() as { retCode: number; retMsg: string; result: T };
    if (json.retCode !== 0) throw new Error(`Bybit error: ${json.retMsg}`);
    return json.result;
  }

  private async post<T>(path: string, body: object): Promise<T> {
    const timestamp = Date.now();
    const bodyStr = JSON.stringify(body);
    const sig = this.sign(timestamp, bodyStr);
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": String(timestamp),
        "X-BAPI-SIGN": sig,
        "X-BAPI-RECV-WINDOW": String(RECV_WINDOW),
        "Content-Type": "application/json",
      },
      body: bodyStr,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Bybit ${res.status}: ${txt}`);
    }
    const json = await res.json() as { retCode: number; retMsg: string; result: T };
    if (json.retCode !== 0) throw new Error(`Bybit error: ${json.retMsg}`);
    return json.result;
  }

  async getAccount(): Promise<BybitAccount> {
    const data = await this.get<{ list: Array<{ totalEquity: string; totalWalletBalance: string; totalAvailableBalance: string; accountType: string }> }>(
      "/v5/account/wallet-balance",
      { accountType: "UNIFIED" },
    );
    const unified = data.list?.[0];
    const equity = parseFloat(unified?.totalEquity ?? "0");
    const cash = parseFloat(unified?.totalAvailableBalance ?? "0");
    return { equity, cash, buyingPower: cash, portfolioValue: equity, currency: "USDT" };
  }

  async getPositions(): Promise<BybitPosition[]> {
    const data = await this.get<{ list: Array<{ symbol: string; side: string; size: string; avgPrice: string; markPrice: string; positionValue: string; unrealisedPnl: string }> }>(
      "/v5/position/list",
      { category: "linear", limit: 50 },
    );
    return (data.list ?? [])
      .filter(p => parseFloat(p.size) > 0)
      .map(p => ({
        symbol: this.fromBybitSymbol(p.symbol),
        side: p.side === "Buy" ? "long" : "short",
        qty: parseFloat(p.size),
        avgEntryPrice: parseFloat(p.avgPrice),
        currentPrice: parseFloat(p.markPrice),
        marketValue: parseFloat(p.positionValue),
        unrealizedPl: parseFloat(p.unrealisedPnl),
        unrealizedPlPct: 0,
      }));
  }

  async getOrders(limit = 50): Promise<BybitOrder[]> {
    const data = await this.get<{ list: Array<{ orderId: string; symbol: string; side: string; orderType: string; qty: string; cumExecQty: string; avgPrice: string; orderStatus: string; price: string; createdTime: string; updatedTime: string }> }>(
      "/v5/order/history",
      { category: "spot", limit },
    );
    return (data.list ?? []).map(o => ({
      id: o.orderId,
      symbol: this.fromBybitSymbol(o.symbol),
      side: o.side.toLowerCase() as "buy" | "sell",
      type: o.orderType.toLowerCase(),
      qty: parseFloat(o.qty),
      filledQty: parseFloat(o.cumExecQty ?? "0"),
      filledAvgPrice: parseFloat(o.avgPrice ?? "0") || null,
      status: o.orderStatus.toLowerCase(),
      limitPrice: parseFloat(o.price ?? "0") || null,
      submittedAt: new Date(parseInt(o.createdTime)).toISOString(),
      filledAt: o.orderStatus === "Filled" ? new Date(parseInt(o.updatedTime)).toISOString() : null,
    }));
  }

  async placeOrder(input: BybitOrderInput): Promise<BybitOrder> {
    const sym = this.toBybitSymbol(input.symbol);
    const body: any = {
      category: "spot",
      symbol: sym,
      side: input.side === "buy" ? "Buy" : "Sell",
      orderType: input.type === "limit" ? "Limit" : "Market",
      qty: String(input.qty),
    };
    if (input.type === "limit" && input.limitPrice) {
      body.price = String(input.limitPrice);
    }

    const result = await this.post<{ orderId: string; orderLinkId: string }>("/v5/order/create", body);
    return {
      id: result.orderId,
      symbol: input.symbol,
      side: input.side,
      type: input.type,
      qty: input.qty,
      filledQty: 0,
      filledAvgPrice: null,
      status: "new",
      limitPrice: input.limitPrice ?? null,
      submittedAt: new Date().toISOString(),
      filledAt: null,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.post("/v5/order/cancel", { category: "spot", orderId });
  }
}

export async function validateBybitKeys(
  apiKey: string,
  apiSecret: string,
  mode: "paper" | "live",
): Promise<BybitAccount> {
  const client = new BybitClient(apiKey, apiSecret, mode);
  const account = await client.getAccount();
  logger.info({ mode, equity: account.equity }, "Bybit credentials validated");
  return account;
}

/** Convert BTC-USDT → BTCUSDT */
export function toBybitSymbol(symbol: string): string {
  return symbol.replace("-", "");
}
