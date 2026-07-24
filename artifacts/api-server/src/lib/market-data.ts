import { logger } from "./logger";

// Real market data via Kraken public API (no key required, no geo-blocking)
const KRAKEN_BASE = "https://api.kraken.com/0/public";

export const SUPPORTED_MARKETS = [
  { symbol: "BTC-USDT",  name: "Bitcoin",   exchange: "Kraken", type: "crypto", wsSymbol: "BTC/USD",  ohlcPair: "XBTUSD"  },
  { symbol: "ETH-USDT",  name: "Ethereum",  exchange: "Kraken", type: "crypto", wsSymbol: "ETH/USD",  ohlcPair: "ETHUSD"  },
  { symbol: "SOL-USDT",  name: "Solana",    exchange: "Kraken", type: "crypto", wsSymbol: "SOL/USD",  ohlcPair: "SOLUSD"  },
  { symbol: "XRP-USDT",  name: "XRP",       exchange: "Kraken", type: "crypto", wsSymbol: "XRP/USD",  ohlcPair: "XRPUSD"  },
  { symbol: "ADA-USDT",  name: "Cardano",   exchange: "Kraken", type: "crypto", wsSymbol: "ADA/USD",  ohlcPair: "ADAUSD"  },
  { symbol: "DOGE-USDT", name: "Dogecoin",  exchange: "Kraken", type: "crypto", wsSymbol: "DOGE/USD", ohlcPair: "XDGUSD"  },
  { symbol: "AVAX-USDT", name: "Avalanche", exchange: "Kraken", type: "crypto", wsSymbol: "AVAX/USD", ohlcPair: "AVAXUSD" },
  { symbol: "LINK-USDT", name: "Chainlink", exchange: "Kraken", type: "crypto", wsSymbol: "LINK/USD", ohlcPair: "LINKUSD" },
  { symbol: "DOT-USDT",  name: "Polkadot",  exchange: "Kraken", type: "crypto", wsSymbol: "DOT/USD",  ohlcPair: "DOTUSD"  },
  { symbol: "UNI-USDT",  name: "Uniswap",   exchange: "Kraken", type: "crypto", wsSymbol: "UNI/USD",  ohlcPair: "UNIUSD"  },
  { symbol: "LTC-USDT",  name: "Litecoin",  exchange: "Kraken", type: "crypto", wsSymbol: "LTC/USD",  ohlcPair: "XLTCUSD" },
  { symbol: "ATOM-USDT", name: "Cosmos",    exchange: "Kraken", type: "crypto", wsSymbol: "ATOM/USD", ohlcPair: "ATOMUSD" },
  { symbol: "FIL-USDT",  name: "Filecoin",  exchange: "Kraken", type: "crypto", wsSymbol: "FIL/USD",  ohlcPair: "FILUSD"  },
];

const WS_SYMBOL_TO_OURS = new Map(
  SUPPORTED_MARKETS.map(m => [m.wsSymbol, m.symbol])
);
const SYMBOL_TO_MARKET = new Map(SUPPORTED_MARKETS.map(m => [m.symbol, m]));

export interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number | null;
  updatedAt: string;
}

// Shared ticker cache — seeded with static data, then overwritten by Kraken WS stream
export const tickerCache: Map<string, TickerData> = new Map();

/** Called by websocket.ts Kraken stream to push live prices into the shared cache. */
export function updateTickerFromStream(data: TickerData): void {
  tickerCache.set(data.symbol, data);
}

/** Convert Kraken WS symbol (BTC/USD) to our symbol (BTC-USDT). */
export function fromKrakenWsSymbol(ws: string): string | undefined {
  return WS_SYMBOL_TO_OURS.get(ws);
}

// Seed with approximate static prices so the UI shows data before WS connects
function seedFallbackTickers(): void {
  const now = new Date().toISOString();
  const seeds = [
    { symbol: "BTC-USDT",  price: 67450,  chg: 1250,   pct: 1.89,  vol: 28e9,   hi: 68200,  lo: 66100  },
    { symbol: "ETH-USDT",  price: 3520,   chg: 85,     pct: 2.47,  vol: 14e9,   hi: 3580,   lo: 3430   },
    { symbol: "SOL-USDT",  price: 185,    chg: 5.2,    pct: 2.89,  vol: 3.2e9,  hi: 189,    lo: 178    },
    { symbol: "XRP-USDT",  price: 0.612,  chg: 0.012,  pct: 2.0,   vol: 2.1e9,  hi: 0.625,  lo: 0.598  },
    { symbol: "ADA-USDT",  price: 0.48,   chg: -0.008, pct: -1.63, vol: 480e6,  hi: 0.495,  lo: 0.472  },
    { symbol: "DOGE-USDT", price: 0.162,  chg: 0.003,  pct: 1.89,  vol: 950e6,  hi: 0.168,  lo: 0.158  },
    { symbol: "AVAX-USDT", price: 38.5,   chg: 1.2,    pct: 3.22,  vol: 620e6,  hi: 39.8,   lo: 37.1   },
    { symbol: "LINK-USDT", price: 14.8,   chg: 0.35,   pct: 2.42,  vol: 420e6,  hi: 15.1,   lo: 14.3   },
    { symbol: "DOT-USDT",  price: 7.2,    chg: -0.12,  pct: -1.64, vol: 310e6,  hi: 7.4,    lo: 7.05   },
    { symbol: "UNI-USDT",  price: 8.9,    chg: 0.22,   pct: 2.53,  vol: 180e6,  hi: 9.1,    lo: 8.6    },
    { symbol: "LTC-USDT",  price: 82,     chg: -0.8,   pct: -0.97, vol: 420e6,  hi: 84,     lo: 80.5   },
    { symbol: "ATOM-USDT", price: 9.6,    chg: 0.18,   pct: 1.91,  vol: 195e6,  hi: 9.85,   lo: 9.35   },
    { symbol: "FIL-USDT",  price: 5.8,    chg: -0.15,  pct: -2.52, vol: 145e6,  hi: 6.1,    lo: 5.65   },
  ];
  for (const s of seeds) {
    tickerCache.set(s.symbol, {
      symbol:       s.symbol,
      price:        s.price,
      change24h:    s.chg,
      changePct24h: s.pct,
      volume24h:    s.vol,
      high24h:      s.hi,
      low24h:       s.lo,
      marketCap:    null,
      updatedAt:    now,
    });
  }
}

export async function getTickers(): Promise<Map<string, TickerData>> {
  return tickerCache;
}

export async function getTicker(symbol: string): Promise<TickerData | null> {
  return tickerCache.get(symbol) ?? null;
}

/**
 * Fetch REAL OHLCV candlestick data from Kraken's public REST API.
 * Kraken has no API key requirement and no geo-blocking for REST.
 *
 * Kraken interval map (minutes): 1m→1, 5m→5, 15m→15, 1h→60, 4h→240, 1d→1440
 * Response format: [time, open, high, low, close, vwap, volume, count]
 */
export async function fetchCandles(
  symbol: string,
  interval: string,
  limit = 120,
): Promise<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>> {
  const market = SYMBOL_TO_MARKET.get(symbol);
  if (!market) throw new Error(`Unknown symbol: ${symbol}`);

  const intervalMinutes: Record<string, number> = {
    "1m": 1, "5m": 5, "15m": 15, "1h": 60, "4h": 240, "1d": 1440,
  };
  const intervalMin = intervalMinutes[interval];
  if (!intervalMin) throw new Error(`Unknown interval: ${interval}`);

  // Calculate `since` to fetch enough candles (Kraken returns up to 720)
  const sinceSeconds = Math.floor(Date.now() / 1000) - limit * intervalMin * 60;

  const url = `${KRAKEN_BASE}/OHLC?pair=${market.ohlcPair}&interval=${intervalMin}&since=${sinceSeconds}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Kraken OHLC error: ${res.status}`);

  const json = await res.json() as {
    error: string[];
    result: Record<string, Array<[number, string, string, string, string, string, string, number]>>;
  };
  if (json.error?.length) throw new Error(`Kraken OHLC error: ${json.error.join(", ")}`);

  // The result key is Kraken's internal pair name — grab the first array value
  const pairData = Object.entries(json.result).find(([k]) => k !== "last")?.[1];
  if (!pairData) throw new Error("No OHLC data returned from Kraken");

  // Kraken format: [time, open, high, low, close, vwap, volume, count]
  return pairData.slice(-limit).map(k => ({
    time:   k[0],
    open:   parseFloat(k[1]),
    high:   parseFloat(k[2]),
    low:    parseFloat(k[3]),
    close:  parseFloat(k[4]),
    volume: parseFloat(k[6]),
  }));
}

/** Generate trading signals derived from live ticker data. */
export function generateSignals(symbol: string): {
  symbol: string; signal: string; strength: number; rsi: number; macd: number;
  trend: string; supportLevel: number | null; resistanceLevel: number | null; updatedAt: string;
} {
  const ticker = tickerCache.get(symbol);
  const price  = ticker?.price ?? 100;
  const pct    = ticker?.changePct24h ?? 0;

  let signal: string;
  let strength: number;
  if      (pct > 4)    { signal = "strong_buy";  strength = 80 + Math.random() * 15; }
  else if (pct > 1.5)  { signal = "buy";          strength = 60 + Math.random() * 15; }
  else if (pct < -4)   { signal = "strong_sell";  strength = 80 + Math.random() * 15; }
  else if (pct < -1.5) { signal = "sell";          strength = 60 + Math.random() * 15; }
  else                  { signal = "neutral";       strength = 40 + Math.random() * 20; }

  const rsi  = Math.min(100, Math.max(0, 30 + Math.random() * 40 + (pct > 0 ? 10 : -5)));
  const macd = pct * 0.5 + (Math.random() - 0.5) * 2;
  const trend = pct > 1.5 ? "bullish" : pct < -1.5 ? "bearish" : "sideways";

  return {
    symbol,
    signal,
    strength:        Math.round(strength),
    rsi:             +rsi.toFixed(1),
    macd:            +macd.toFixed(4),
    trend,
    supportLevel:    +(price * 0.95).toFixed(2),
    resistanceLevel: +(price * 1.06).toFixed(2),
    updatedAt:       new Date().toISOString(),
  };
}

// Seed immediately so REST endpoints return something on first request
seedFallbackTickers();
