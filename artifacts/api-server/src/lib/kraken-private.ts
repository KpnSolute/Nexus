/**
 * Kraken private API connector.
 *
 * apiKey    = Kraken API Key
 * apiSecret = Kraken Private Key (base64-encoded)
 *
 * Auth: Nonce + HMAC-SHA512 with SHA-256 pre-hash.
 * Docs: https://docs.kraken.com/api/docs/rest-api/
 */
import { createHmac, createHash } from "crypto";
import { logger } from "./logger";

const BASE = "https://api.kraken.com";

export interface KrakenAccount {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  currency: string;
}

export interface KrakenPosition {
  symbol: string;
  side: "long" | "short";
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
}

export interface KrakenOrder {
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

export interface KrakenOrderInput {
  symbol: string; // e.g. "BTC-USDT"
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  limitPrice?: number;
}

export class KrakenPrivateClient {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string, // base64-encoded
    public readonly mode: "paper" | "live",
  ) {}

  private sign(path: string, nonce: string, postData: string): string {
    const secret = Buffer.from(this.apiSecret, "base64");
    const sha256 = createHash("sha256").update(nonce + postData).digest();
    const hmac = createHmac("sha512", secret);
    hmac.update(path);
    hmac.update(sha256);
    return hmac.digest("base64");
  }

  private toKrakenPair(symbol: string): string {
    // BTC-USDT → XBTUSDT, ETH-USDT → ETHUSDT
    const [base] = symbol.split("-");
    const krakenBase = base === "BTC" ? "XBT" : base;
    return `${krakenBase}USDT`;
  }

  private fromKrakenPair(pair: string): string {
    const base = pair.replace("USDT", "").replace("XBT", "BTC").replace(/^X|Z$/g, "");
    return `${base}-USDT`;
  }

  private async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const nonce = String(Date.now() * 1000);
    const postData = new URLSearchParams({ nonce, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) }).toString();
    const sig = this.sign(path, nonce, postData);

    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": sig,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Kraken ${res.status}: ${txt}`);
    }

    const json = await res.json() as { error: string[]; result: T };
    if (json.error && json.error.length > 0) {
      throw new Error(`Kraken API error: ${json.error.join(", ")}`);
    }
    return json.result;
  }

  async getAccount(): Promise<KrakenAccount> {
    const balance = await this.request<Record<string, string>>("/0/private/Balance");
    const usdtBalance = parseFloat(balance["USDT"] ?? balance["ZUSD"] ?? "0");
    const xbtBalance = parseFloat(balance["XXBT"] ?? balance["XBT"] ?? "0");
    const ethBalance = parseFloat(balance["XETH"] ?? balance["ETH"] ?? "0");

    // Very rough portfolio value in USDT
    const portfolioValue = usdtBalance; // simplified

    return {
      equity: portfolioValue,
      cash: usdtBalance,
      buyingPower: usdtBalance,
      portfolioValue,
      currency: "USDT",
    };
  }

  async getPositions(): Promise<KrakenPosition[]> {
    try {
      const positions = await this.request<Record<string, { pair: string; type: string; vol: string; vol_closed: string; cost: string; fee: string; net: string; value: string; margin: string }>>("/0/private/OpenPositions");
      return Object.entries(positions).map(([, p]) => ({
        symbol: this.fromKrakenPair(p.pair),
        side: p.type === "buy" ? "long" : "short",
        qty: parseFloat(p.vol) - parseFloat(p.vol_closed),
        avgEntryPrice: parseFloat(p.cost) / parseFloat(p.vol),
        currentPrice: parseFloat(p.value) / parseFloat(p.vol),
        marketValue: parseFloat(p.value),
        unrealizedPl: parseFloat(p.net ?? "0"),
        unrealizedPlPct: 0,
      }));
    } catch {
      return [];
    }
  }

  async getOrders(limit = 50): Promise<KrakenOrder[]> {
    const data = await this.request<{ closed: Record<string, any> }>("/0/private/ClosedOrders", { ofs: 0 });
    return Object.entries(data.closed ?? {}).slice(0, limit).map(([id, o]) => ({
      id,
      symbol: this.fromKrakenPair(o.descr?.pair ?? ""),
      side: (o.descr?.type ?? "buy") as "buy" | "sell",
      type: o.descr?.ordertype ?? "market",
      qty: parseFloat(o.vol ?? "0"),
      filledQty: parseFloat(o.vol_exec ?? "0"),
      filledAvgPrice: parseFloat(o.price ?? "0") || null,
      status: o.status ?? "unknown",
      limitPrice: parseFloat(o.descr?.price ?? "0") || null,
      submittedAt: new Date((o.opentm ?? 0) * 1000).toISOString(),
      filledAt: o.closetm ? new Date(o.closetm * 1000).toISOString() : null,
    }));
  }

  async placeOrder(input: KrakenOrderInput): Promise<KrakenOrder> {
    const pair = this.toKrakenPair(input.symbol);
    const params: Record<string, string | number> = {
      pair,
      type: input.side,
      ordertype: input.type,
      volume: input.qty,
    };
    if (input.type === "limit" && input.limitPrice) {
      params.price = input.limitPrice;
    }

    const result = await this.request<{ txid: string[] }>("/0/private/AddOrder", params);
    const orderId = result.txid?.[0] ?? `kraken-${Date.now()}`;
    return {
      id: orderId,
      symbol: input.symbol,
      side: input.side,
      type: input.type,
      qty: input.qty,
      filledQty: 0,
      filledAvgPrice: null,
      status: "open",
      limitPrice: input.limitPrice ?? null,
      submittedAt: new Date().toISOString(),
      filledAt: null,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.request("/0/private/CancelOrder", { txid: orderId });
  }
}

export async function validateKrakenPrivateKeys(
  apiKey: string,
  apiSecret: string,
  mode: "paper" | "live",
): Promise<KrakenAccount> {
  const client = new KrakenPrivateClient(apiKey, apiSecret, mode);
  const account = await client.getAccount();
  logger.info({ mode, cash: account.cash }, "Kraken credentials validated");
  return account;
}
