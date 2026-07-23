import { logger } from "./logger";

// Public market data using CoinGecko free API (no key needed for basic endpoints)
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export const SUPPORTED_MARKETS = [
  { symbol: "BTC-USDT", name: "Bitcoin", exchange: "Binance", type: "crypto", id: "bitcoin" },
  { symbol: "ETH-USDT", name: "Ethereum", exchange: "Binance", type: "crypto", id: "ethereum" },
  { symbol: "SOL-USDT", name: "Solana", exchange: "Binance", type: "crypto", id: "solana" },
  { symbol: "BNB-USDT", name: "BNB", exchange: "Binance", type: "crypto", id: "binancecoin" },
  { symbol: "XRP-USDT", name: "XRP", exchange: "Binance", type: "crypto", id: "ripple" },
  { symbol: "ADA-USDT", name: "Cardano", exchange: "Binance", type: "crypto", id: "cardano" },
  { symbol: "DOGE-USDT", name: "Dogecoin", exchange: "Binance", type: "crypto", id: "dogecoin" },
  { symbol: "AVAX-USDT", name: "Avalanche", exchange: "Binance", type: "crypto", id: "avalanche-2" },
  { symbol: "MATIC-USDT", name: "Polygon", exchange: "Binance", type: "crypto", id: "matic-network" },
  { symbol: "LINK-USDT", name: "Chainlink", exchange: "Binance", type: "crypto", id: "chainlink" },
  { symbol: "DOT-USDT", name: "Polkadot", exchange: "Binance", type: "crypto", id: "polkadot" },
  { symbol: "UNI-USDT", name: "Uniswap", exchange: "Binance", type: "crypto", id: "uniswap" },
  { symbol: "LTC-USDT", name: "Litecoin", exchange: "Binance", type: "crypto", id: "litecoin" },
  { symbol: "ATOM-USDT", name: "Cosmos", exchange: "Binance", type: "crypto", id: "cosmos" },
  { symbol: "FIL-USDT", name: "Filecoin", exchange: "Binance", type: "crypto", id: "filecoin" },
];

const MARKET_ID_MAP = new Map(SUPPORTED_MARKETS.map(m => [m.symbol, m.id]));

// In-memory ticker cache (refreshed every 60s)
let tickerCache: Map<string, TickerData> = new Map();
let lastFetch = 0;
let isFetching = false;

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

async function fetchAndCacheMarkets() {
  if (isFetching) return;
  isFetching = true;
  try {
    const ids = SUPPORTED_MARKETS.map(m => m.id).join(",");
    const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&price_change_percentage=24h`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = (await res.json()) as Array<{
      id: string;
      current_price: number;
      price_change_24h: number;
      price_change_percentage_24h: number;
      total_volume: number;
      high_24h: number;
      low_24h: number;
      market_cap: number;
    }>;

    const reverseMap = new Map(SUPPORTED_MARKETS.map(m => [m.id, m.symbol]));
    const now = new Date().toISOString();
    for (const coin of data) {
      const symbol = reverseMap.get(coin.id);
      if (!symbol) continue;
      tickerCache.set(symbol, {
        symbol,
        price: coin.current_price,
        change24h: coin.price_change_24h ?? 0,
        changePct24h: coin.price_change_percentage_24h ?? 0,
        volume24h: coin.total_volume ?? 0,
        high24h: coin.high_24h ?? coin.current_price,
        low24h: coin.low_24h ?? coin.current_price,
        marketCap: coin.market_cap ?? null,
        updatedAt: now,
      });
    }
    lastFetch = Date.now();
    logger.info({ count: tickerCache.size }, "Market tickers cached");
  } catch (err) {
    logger.warn({ err }, "Failed to fetch market tickers, using fallbacks");
    seedFallbackTickers();
  } finally {
    isFetching = false;
  }
}

function seedFallbackTickers() {
  const now = new Date().toISOString();
  const fallbacks = [
    { symbol: "BTC-USDT", price: 67450, chg: 1250, pct: 1.89, vol: 28e9, hi: 68200, lo: 66100, mc: 1.32e12 },
    { symbol: "ETH-USDT", price: 3520, chg: 85, pct: 2.47, vol: 14e9, hi: 3580, lo: 3430, mc: 422e9 },
    { symbol: "SOL-USDT", price: 185, chg: 5.2, pct: 2.89, vol: 3.2e9, hi: 189, lo: 178, mc: 82e9 },
    { symbol: "BNB-USDT", price: 582, chg: -4.1, pct: -0.70, vol: 1.8e9, hi: 592, lo: 575, mc: 87e9 },
    { symbol: "XRP-USDT", price: 0.612, chg: 0.012, pct: 2.0, vol: 2.1e9, hi: 0.625, lo: 0.598, mc: 34e9 },
    { symbol: "ADA-USDT", price: 0.48, chg: -0.008, pct: -1.63, vol: 480e6, hi: 0.495, lo: 0.472, mc: 17e9 },
    { symbol: "DOGE-USDT", price: 0.162, chg: 0.003, pct: 1.89, vol: 950e6, hi: 0.168, lo: 0.158, mc: 23e9 },
    { symbol: "AVAX-USDT", price: 38.5, chg: 1.2, pct: 3.22, vol: 620e6, hi: 39.8, lo: 37.1, mc: 16e9 },
    { symbol: "MATIC-USDT", price: 0.72, chg: -0.01, pct: -1.37, vol: 380e6, hi: 0.742, lo: 0.709, mc: 7e9 },
    { symbol: "LINK-USDT", price: 14.8, chg: 0.35, pct: 2.42, vol: 420e6, hi: 15.1, lo: 14.3, mc: 9e9 },
    { symbol: "DOT-USDT", price: 7.2, chg: -0.12, pct: -1.64, vol: 310e6, hi: 7.4, lo: 7.05, mc: 10e9 },
    { symbol: "UNI-USDT", price: 8.9, chg: 0.22, pct: 2.53, vol: 180e6, hi: 9.1, lo: 8.6, mc: 5e9 },
    { symbol: "LTC-USDT", price: 82, chg: -0.8, pct: -0.97, vol: 420e6, hi: 84, lo: 80.5, mc: 6e9 },
    { symbol: "ATOM-USDT", price: 9.6, chg: 0.18, pct: 1.91, vol: 195e6, hi: 9.85, lo: 9.35, mc: 3.8e9 },
    { symbol: "FIL-USDT", price: 5.8, chg: -0.15, pct: -2.52, vol: 145e6, hi: 6.1, lo: 5.65, mc: 2.7e9 },
  ];
  for (const f of fallbacks) {
    tickerCache.set(f.symbol, {
      symbol: f.symbol,
      price: f.price,
      change24h: f.chg,
      changePct24h: f.pct,
      volume24h: f.vol,
      high24h: f.hi,
      low24h: f.lo,
      marketCap: f.mc,
      updatedAt: now,
    });
  }
}

export async function getTickers(): Promise<Map<string, TickerData>> {
  if (tickerCache.size === 0 || Date.now() - lastFetch > 60_000) {
    await fetchAndCacheMarkets();
  }
  return tickerCache;
}

export async function getTicker(symbol: string): Promise<TickerData | null> {
  const tickers = await getTickers();
  return tickers.get(symbol) ?? null;
}

// Generate synthetic candle data based on current price
export function generateCandles(symbol: string, interval: string, count = 100): Array<{
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  const ticker = tickerCache.get(symbol);
  const basePrice = ticker?.price ?? 100;

  const intervalSeconds: Record<string, number> = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
  };
  const step = intervalSeconds[interval] ?? 3600;
  const now = Math.floor(Date.now() / 1000);
  const candles = [];

  let price = basePrice * 0.85;
  const volatility = basePrice * 0.012;
  const baseVol = (ticker?.volume24h ?? basePrice * 1000) / (86400 / step);

  for (let i = count; i >= 0; i--) {
    const time = now - i * step;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(open + change, open * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = baseVol * (0.5 + Math.random());
    candles.push({ time, open: +open.toFixed(8), high: +high.toFixed(8), low: +low.toFixed(8), close: +close.toFixed(8), volume: +volume.toFixed(2) });
    price = close;
  }
  return candles;
}

// Generate trading signals based on RSI-like calculation
export function generateSignals(symbol: string): {
  symbol: string;
  signal: string;
  strength: number;
  rsi: number;
  macd: number;
  trend: string;
  supportLevel: number | null;
  resistanceLevel: number | null;
  updatedAt: string;
} {
  const ticker = tickerCache.get(symbol);
  const price = ticker?.price ?? 100;
  const pct = ticker?.changePct24h ?? 0;

  // Derive signal from 24h change
  let signal: string;
  let strength: number;
  if (pct > 4) { signal = "strong_buy"; strength = 80 + Math.random() * 15; }
  else if (pct > 1.5) { signal = "buy"; strength = 60 + Math.random() * 15; }
  else if (pct < -4) { signal = "strong_sell"; strength = 80 + Math.random() * 15; }
  else if (pct < -1.5) { signal = "sell"; strength = 60 + Math.random() * 15; }
  else { signal = "neutral"; strength = 40 + Math.random() * 20; }

  const rsi = 30 + Math.random() * 40 + (pct > 0 ? 10 : -5);
  const macd = pct * 0.5 + (Math.random() - 0.5) * 2;
  const trend = pct > 1.5 ? "bullish" : pct < -1.5 ? "bearish" : "sideways";

  return {
    symbol,
    signal,
    strength: Math.round(strength),
    rsi: +Math.min(100, Math.max(0, rsi)).toFixed(1),
    macd: +macd.toFixed(4),
    trend,
    supportLevel: +(price * 0.95).toFixed(2),
    resistanceLevel: +(price * 1.06).toFixed(2),
    updatedAt: new Date().toISOString(),
  };
}

// Refresh in background every 60s
setInterval(() => { fetchAndCacheMarkets(); }, 60_000);
// Initial load
seedFallbackTickers();
fetchAndCacheMarkets();
