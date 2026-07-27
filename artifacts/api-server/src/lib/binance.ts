/**
 * Binance Spot connector.
 *
 * apiKey    = Binance API Key
 * apiSecret = Binance Secret Key
 *
 * Auth: HMAC-SHA256 query-string signature.
 * Base: https://api.binance.com  (global)
 */
import { createHmac } from "crypto";
import { logger } from "./logger";

const BASE = "https://api.binance.com";

export interface BinanceAccount {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  currency: string;
}

export interface BinancePosition {
  symbol: string;
  side: "long" | "short";
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
}

export interface BinanceOrder {
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

export interface BinanceOrderInput {
  symbol: string; // e.g. "BTC-USDT"
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  limitPrice?: number;
}

export class BinanceClient {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    public readonly mode: "paper" | "live",
  ) {}

  private sign(queryString: string): string {
    return createHmac("sha256", this.apiSecret).update(queryString).digest("hex");
  }

  private toSymbol(sym: string): string {
    // BTC-USDT → BTCUSDT
    return sym.replace("-", "");
  }

  private fromSymbol(sym: string): string {
    // BTCUSDT → BTC-USDT
    const quote = sym.endsWith("USDT") ? "USDT" : sym.endsWith("USDC") ? "USDC" : "USD";
    const base = sym.slice(0, sym.length - quote.length);
    return `${base}-${quote}`;
  }

  private async request<T>(method: string, path: string, params: Record<string, string | number> = {}, signed = true): Promise<T> {
    let qs = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    if (signed) {
      const timestamp = Date.now();
      qs += (qs ? "&" : "") + `timestamp=${timestamp}`;
      const sig = this.sign(qs);
      qs += `&signature=${sig}`;
    }

    const url = `${BASE}${path}${qs ? "?" + qs : ""}`;
    const res = await fetch(url, {
      method,
      headers: { "X-MBX-APIKEY": this.apiKey, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Binance ${res.status}: ${txt}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }

  async getAccount(): Promise<BinanceAccount> {
    const data = await this.request<{
      balances: Array<{ asset: string; free: string; locked: string }>;
      totalAssetOfBtc?: string;
    }>("GET", "/api/v3/account");

    // Find USDT balance as "cash"
    const usdt = data.balances?.find(b => b.asset === "USDT");
    const cash = parseFloat(usdt?.free ?? "0");

    // Rough portfolio value: sum of all asset USD values (simplified — uses USDT balance only as proxy)
    const totalFree = data.balances?.reduce((acc, b) => acc + parseFloat(b.free), 0) ?? cash;

    return {
      equity: cash,
      cash,
      buyingPower: cash,
      portfolioValue: cash,
      currency: "USDT",
    };
  }

  async getPositions(): Promise<BinancePosition[]> {
    // Spot doesn't have "positions" — return open USDT-valued balances > dust
    const data = await this.request<{ balances: Array<{ asset: string; free: string; locked: string }> }>("GET", "/api/v3/account");
    return (data.balances ?? [])
      .filter(b => parseFloat(b.free) > 0.0001 && b.asset !== "USDT" && b.asset !== "BNB")
      .map(b => ({
        symbol: `${b.asset}-USDT`,
        side: "long" as const,
        qty: parseFloat(b.free),
        avgEntryPrice: 0,
        currentPrice: 0,
        marketValue: 0,
        unrealizedPl: 0,
        unrealizedPlPct: 0,
      }));
  }

  async getOrders(limit = 50): Promise<BinanceOrder[]> {
    type RawOrder = {
      orderId: number; symbol: string; side: string; type: string;
      origQty: string; executedQty: string; price: string; cummulativeQuoteQty: string;
      status: string; time: number; updateTime: number;
    };

    // Fetch all currently open orders across all symbols (no symbol required)
    const openOrders = await this.request<RawOrder[]>("GET", "/api/v3/openOrders")
      .catch(() => [] as RawOrder[]);

    // For historical orders, query the most common trading pairs
    const COMMON_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT", "ADAUSDT", "DOGEUSDT"];
    const historyResults = await Promise.all(
      COMMON_SYMBOLS.map(sym =>
        this.request<RawOrder[]>("GET", "/api/v3/allOrders", { symbol: sym, limit: 20 })
          .catch(() => [] as RawOrder[]),
      ),
    );
    const historical = historyResults.flat();

    // Merge, deduplicate by orderId, sort newest first, take limit
    const seen = new Set<number>();
    const merged: RawOrder[] = [];
    for (const o of [...openOrders, ...historical]) {
      if (!seen.has(o.orderId)) {
        seen.add(o.orderId);
        merged.push(o);
      }
    }
    merged.sort((a, b) => b.updateTime - a.updateTime);

    return merged.slice(0, limit).map(o => ({
      id: String(o.orderId),
      symbol: this.fromSymbol(o.symbol),
      side: o.side.toLowerCase() as "buy" | "sell",
      type: o.type.toLowerCase(),
      qty: parseFloat(o.origQty),
      filledQty: parseFloat(o.executedQty),
      filledAvgPrice: parseFloat(o.executedQty) > 0 && parseFloat(o.origQty) > 0
        ? parseFloat(o.cummulativeQuoteQty) / parseFloat(o.executedQty)
        : null,
      status: o.status.toLowerCase(),
      limitPrice: parseFloat(o.price) > 0 ? parseFloat(o.price) : null,
      submittedAt: new Date(o.time).toISOString(),
      filledAt: o.status === "FILLED" ? new Date(o.updateTime).toISOString() : null,
    }));
  }

  async placeOrder(input: BinanceOrderInput): Promise<BinanceOrder> {
    const sym = this.toSymbol(input.symbol);
    const params: Record<string, string | number> = {
      symbol: sym,
      side: input.side.toUpperCase(),
      type: input.type.toUpperCase(),
      quantity: input.qty,
      timeInForce: input.type === "limit" ? "GTC" : "",
    };
    if (input.type === "limit" && input.limitPrice) {
      params.price = input.limitPrice;
    }
    if (input.type === "market") delete params.timeInForce;

    const qs = Object.entries(params)
      .filter(([, v]) => v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const timestamp = Date.now();
    const fullQs = `${qs}&timestamp=${timestamp}`;
    const sig = this.sign(fullQs);

    const url = `${BASE}/api/v3/order?${fullQs}&signature=${sig}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "X-MBX-APIKEY": this.apiKey, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Binance ${res.status}: ${txt}`);
    }
    const o = await res.json() as any;
    return {
      id: String(o.orderId),
      symbol: input.symbol,
      side: input.side,
      type: input.type,
      qty: parseFloat(o.origQty ?? input.qty),
      filledQty: parseFloat(o.executedQty ?? "0"),
      filledAvgPrice: null,
      status: o.status?.toLowerCase() ?? "new",
      limitPrice: input.limitPrice ?? null,
      submittedAt: new Date(o.transactTime ?? Date.now()).toISOString(),
      filledAt: null,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    // Binance requires the symbol to cancel an order.
    // Look it up from open orders first — open orders don't require a symbol filter.
    type OpenOrder = { orderId: number; symbol: string };
    const openOrders = await this.request<OpenOrder[]>("GET", "/api/v3/openOrders")
      .catch(() => [] as OpenOrder[]);
    const found = openOrders.find(o => String(o.orderId) === String(orderId));
    if (!found) {
      throw new Error(`Order ${orderId} not found in open orders (may already be filled or cancelled)`);
    }

    const timestamp = Date.now();
    const qs = `orderId=${orderId}&symbol=${found.symbol}&timestamp=${timestamp}`;
    const sig = this.sign(qs);
    const url = `${BASE}/api/v3/order?${qs}&signature=${sig}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "X-MBX-APIKEY": this.apiKey },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Binance cancel ${res.status}: ${txt}`);
    }
  }
}

export async function validateBinanceKeys(
  apiKey: string,
  apiSecret: string,
  mode: "paper" | "live",
): Promise<BinanceAccount> {
  const client = new BinanceClient(apiKey, apiSecret, mode);
  const account = await client.getAccount();
  logger.info({ mode, cash: account.cash }, "Binance credentials validated");
  return account;
}

/** Convert BTC-USDT → BTCUSDT */
export function toBinanceSymbol(symbol: string): string {
  return symbol.replace("-", "");
}
