/**
 * Coinbase Advanced Trade connector (CDP API keys).
 *
 * apiKey    = CDP key name  (e.g. "organizations/xxx/apiKeys/yyy")
 * apiSecret = EC P-256 private key in PEM format
 *             (-----BEGIN EC PRIVATE KEY----- … or -----BEGIN PRIVATE KEY-----)
 *
 * Auth: JWT Bearer token signed with ES256.
 */
import { createPrivateKey, createSign } from "crypto";
import { logger } from "./logger";

const BASE = "https://api.coinbase.com/api/v3/brokerage";

export interface CoinbaseAccount {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  currency: string;
}

export interface CoinbasePosition {
  symbol: string;
  side: "long" | "short";
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
}

export interface CoinbaseOrder {
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

export interface CoinbaseOrderInput {
  symbol: string; // e.g. "BTC-USDT"
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  limitPrice?: number;
}

/** Build a JWT signed with ES256 for a given request */
function buildJWT(keyName: string, pemKey: string, method: string, path: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyName })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: keyName,
      iss: "coinbase-cloud",
      nbf: now,
      exp: now + 120,
      uri: `${method} api.coinbase.com${path}`,
    }),
  ).toString("base64url");

  const signingInput = `${header}.${payload}`;
  const privKey = createPrivateKey(pemKey);
  const sign = createSign("SHA256");
  sign.update(signingInput);
  sign.end();
  const sig = sign.sign({ key: privKey, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${signingInput}.${sig}`;
}

export class CoinbaseClient {
  constructor(
    private readonly keyName: string,
    private readonly pemKey: string,
    public readonly mode: "paper" | "live",
  ) {}

  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const fullPath = path.startsWith("/api") ? path : `/api/v3/brokerage${path}`;
    const jwt = buildJWT(this.keyName, this.pemKey, method, fullPath);
    const url = `${BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Coinbase ${res.status}: ${txt}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }

  /** Maps our BTC-USDT symbol → Coinbase product ID (BTC-USD or BTC-USDC) */
  private toProductId(symbol: string): string {
    return symbol.replace("-USDT", "-USD").replace("-USDC", "-USD");
  }

  async getAccount(): Promise<CoinbaseAccount> {
    // List portfolios and sum up cash + positions
    const data = await this.request<{ portfolios: Array<{ portfolio_value: string; unrealized_pnl: string; cash_equivalent: string; currency: string }> }>("GET", "/portfolios");
    const port = data.portfolios?.[0];
    if (!port) throw new Error("No Coinbase portfolio found");
    const portfolioValue = parseFloat(port.portfolio_value ?? "0");
    const cash = parseFloat(port.cash_equivalent ?? "0");
    return {
      equity: portfolioValue,
      cash,
      buyingPower: cash,
      portfolioValue,
      currency: port.currency ?? "USD",
    };
  }

  async getPositions(): Promise<CoinbasePosition[]> {
    const data = await this.request<{ positions: Array<{ product_id: string; net_size: string; entry_vwap: { price: string }; current_price: string; unrealized_pnl: string; side: string }> }>("GET", "/intx/positions");
    return (data.positions ?? []).map(p => ({
      symbol: p.product_id,
      side: parseFloat(p.net_size) >= 0 ? "long" : "short",
      qty: Math.abs(parseFloat(p.net_size)),
      avgEntryPrice: parseFloat(p.entry_vwap?.price ?? "0"),
      currentPrice: parseFloat(p.current_price ?? "0"),
      marketValue: Math.abs(parseFloat(p.net_size)) * parseFloat(p.current_price ?? "0"),
      unrealizedPl: parseFloat(p.unrealized_pnl ?? "0"),
      unrealizedPlPct: 0,
    }));
  }

  async getOrders(limit = 50): Promise<CoinbaseOrder[]> {
    const data = await this.request<{ orders: Array<any> }>("GET", `/orders/historical/batch?limit=${limit}&sort_by=LAST_FILL_TIME&order=DESC`);
    return (data.orders ?? []).map((o: any) => ({
      id: o.order_id,
      symbol: o.product_id,
      side: o.side?.toLowerCase() ?? "buy",
      type: o.order_configuration?.limit_limit_gtc ? "limit" : "market",
      qty: parseFloat(o.order_configuration?.market_market_ioc?.base_size ?? o.order_configuration?.limit_limit_gtc?.base_size ?? "0"),
      filledQty: parseFloat(o.filled_size ?? "0"),
      filledAvgPrice: o.average_filled_price ? parseFloat(o.average_filled_price) : null,
      status: o.status?.toLowerCase() ?? "unknown",
      limitPrice: o.order_configuration?.limit_limit_gtc?.limit_price ? parseFloat(o.order_configuration.limit_limit_gtc.limit_price) : null,
      submittedAt: o.created_time,
      filledAt: o.completion_percentage === "100" ? o.last_fill_time : null,
    }));
  }

  async placeOrder(input: CoinbaseOrderInput): Promise<CoinbaseOrder> {
    const productId = this.toProductId(input.symbol);
    const body: any = {
      client_order_id: `tradora-${Date.now()}`,
      product_id: productId,
      side: input.side.toUpperCase(),
      order_configuration: input.type === "limit"
        ? { limit_limit_gtc: { base_size: String(input.qty), limit_price: String(input.limitPrice!), post_only: false } }
        : { market_market_ioc: { base_size: String(input.qty) } },
    };
    const data = await this.request<{ success_response?: { order_id: string }; error_response?: { error: string; preview_failure_reason: string } }>("POST", "/orders", body);
    if (data.error_response) throw new Error(data.error_response.preview_failure_reason || data.error_response.error);
    return {
      id: data.success_response!.order_id,
      symbol: productId,
      side: input.side,
      type: input.type,
      qty: input.qty,
      filledQty: 0,
      filledAvgPrice: null,
      status: "pending",
      limitPrice: input.limitPrice ?? null,
      submittedAt: new Date().toISOString(),
      filledAt: null,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.request("POST", "/orders/batch_cancel", { order_ids: [orderId] });
  }
}

export async function validateCoinbaseKeys(
  keyName: string,
  pemKey: string,
  mode: "paper" | "live",
): Promise<CoinbaseAccount> {
  const client = new CoinbaseClient(keyName, pemKey, mode);
  const account = await client.getAccount();
  logger.info({ mode, portfolioValue: account.portfolioValue }, "Coinbase credentials validated");
  return account;
}

/** Convert our symbol (BTC-USDT) to Coinbase product ID (BTC-USD) */
export function toCoinbaseSymbol(symbol: string): string {
  return symbol.replace("-USDT", "-USD").replace("-USDC", "-USD");
}
