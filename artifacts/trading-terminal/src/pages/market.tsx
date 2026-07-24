import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'wouter';
import { 
  useGetMarketTicker, 
  useGetMarketCandles, 
  useGetMarketSignals,
  useCreateTrade,
  usePlaceAlpacaOrder,
  useListAccounts,
  getListTradesQueryKey,
  getGetPortfolioSummaryQueryKey,
  getListPositionsQueryKey,
  getListAlpacaOrdersQueryKey,
  getListAlpacaPositionsQueryKey,
  getGetAlpacaAccountQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus, Clock, BarChart2, Zap } from 'lucide-react';
import { cn, formatPrice, formatPct, formatNumber } from '@/lib/utils';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

const tradeSchema = z.object({
  quantity: z.coerce.number().positive('Quantity must be positive'),
  price: z.coerce.number().positive('Price must be positive').optional(),
  notes: z.string().optional(),
});

type TradeForm = z.infer<typeof tradeSchema>;

export default function Market() {
  const { symbol } = useParams();
  const safeSymbol = symbol ? decodeURIComponent(symbol).toUpperCase() : 'BTC/USD';
  
  const queryClient = useQueryClient();
  const [interval, setInterval] = useState<Interval>('1h');
  
  const { data: ticker } = useGetMarketTicker(safeSymbol, { query: { refetchInterval: 5000 } });
  const { data: candles } = useGetMarketCandles(safeSymbol, interval, { query: { refetchInterval: 30000 } });
  const { data: signals } = useGetMarketSignals(safeSymbol, { query: { refetchInterval: 60000 } });
  
  const createTrade   = useCreateTrade();
  const placeAlpaca   = usePlaceAlpacaOrder();
  const { data: accounts } = useListAccounts();

  const alpacaAccount = accounts?.find(a => a.exchange === 'alpaca' && a.status === 'active');
  const alpacaMode    = alpacaAccount ? (alpacaAccount as any).mode as string : null;
  const usingAlpaca   = !!alpacaAccount;

  const [tradeSide, setTradeSide] = useState<'buy'|'sell'>('buy');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<TradeForm>({
    resolver: zodResolver(tradeSchema)
  });

  // Pre-fill price when ticker loads if not touched
  useEffect(() => {
    if (ticker?.price) setValue('price', ticker.price);
  }, [ticker?.price, setValue]);

  const qty = watch('quantity') || 0;
  const price = watch('price') || ticker?.price || 0;
  const estimatedTotal = qty * price;

  const onSubmit = (data: TradeForm) => {
    if (usingAlpaca) {
      // Route through Alpaca — real or paper depending on connected account mode
      placeAlpaca.mutate({
        data: {
          symbol:  safeSymbol,      // backend converts BTC-USDT → BTC/USD
          side:    tradeSide,
          qty:     data.quantity,
          type:    data.price ? 'limit' : 'market',
          time_in_force: 'gtc',
          limit_price: data.price,
        }
      }, {
        onSuccess: (order) => {
          setOrderSuccess(`${tradeSide.toUpperCase()} order submitted · ID ${(order as any).id?.slice(0, 8)}…`);
          setTimeout(() => setOrderSuccess(null), 4000);
          reset({ quantity: 0, price: ticker?.price, notes: '' });
          queryClient.invalidateQueries({ queryKey: getListAlpacaOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAlpacaPositionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAlpacaAccountQueryKey() });
        }
      });
    } else {
      // Paper trade stored in our own DB
      createTrade.mutate({
        data: {
          symbol:   safeSymbol,
          side:     tradeSide,
          quantity: data.quantity,
          price:    data.price,
          notes:    data.notes,
        }
      }, {
        onSuccess: () => {
          reset({ quantity: 0, price: ticker?.price, notes: '' });
          queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
        }
      });
    }
  };

  const isSubmitting = createTrade.isPending || placeAlpaca.isPending;
  const submitError  = (createTrade.error || placeAlpaca.error) as any;

  const isUp = ticker && ticker.changePct24h >= 0;

  // Transform candles for Recharts custom shape
  const chartData = useMemo(() => {
    if (!candles) return [];
    return candles.map(c => ({
      ...c,
      dateStr: new Date(c.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUp: c.close >= c.open,
      // Create a bar from low to high to act as the wick
      wickRange: [c.low, c.high],
      // Create a bar from open to close to act as the body
      bodyRange: [Math.min(c.open, c.close), Math.max(c.open, c.close)]
    }));
  }, [candles]);

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isBullish = payload.isUp;
    const color = isBullish ? 'hsl(var(--up))' : 'hsl(var(--down))';
    
    // We only use the body rect provided by Recharts for the thick part.
    // Recharts automatically scales `bodyRange` to `y` and `height`.
    // Drawing the wick is harder without the raw scales, so we'll just draw the body for now
    // to ensure it works correctly without complex scale math.
    
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={color} />
      </g>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 font-mono h-full">
      
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border bg-card gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold tracking-tight">{safeSymbol}</h1>
            
            <div className="flex flex-col">
              <div className={cn(
                "text-2xl font-bold transition-colors",
                isUp ? "text-up" : "text-down"
              )}>
                {ticker ? formatPrice(ticker.price, 6) : '---'}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className={cn(isUp ? "text-up" : "text-down")}>
                  {isUp ? '+' : ''}{ticker ? formatPrice(ticker.change24h, 4) : '0.00'}
                </span>
                <span className={cn(
                  "px-1.5 py-0.5",
                  isUp ? "bg-up/20 text-up" : "bg-down/20 text-down"
                )}>
                  {isUp ? '+' : ''}{ticker?.changePct24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-right">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">24H HIGH</div>
              <div className="text-sm font-bold">{ticker ? formatPrice(ticker.high24h, 4) : '---'}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">24H LOW</div>
              <div className="text-sm font-bold">{ticker ? formatPrice(ticker.low24h, 4) : '---'}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">24H VOL</div>
              <div className="text-sm font-bold">{ticker ? formatNumber(ticker.volume24h) : '---'}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">MKT CAP</div>
              <div className="text-sm font-bold">{ticker?.marketCap ? formatNumber(ticker.marketCap) : '---'}</div>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="flex-1 min-h-[400px] border border-border bg-card flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20">
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as Interval[]).map(inv => (
              <button
                key={inv}
                onClick={() => setInterval(inv)}
                className={cn(
                  "px-3 py-1 text-xs font-bold transition-colors",
                  interval === inv ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {inv.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="dateStr" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickFormatter={(val) => val.toFixed(2)}
                    tickLine={false}
                    axisLine={false}
                    orientation="right"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 0 }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                  />
                  <Bar dataKey="bodyRange" shape={<CustomCandlestick />} isAnimationActive={false}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isUp ? 'hsl(var(--up))' : 'hsl(var(--down))'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                LOADING CHART DATA...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Panel (Signals & Trade) */}
      <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
        
        {/* Order Book (Simulated context) */}
        <div className="border border-border bg-card p-4 flex flex-col gap-2 relative overflow-hidden h-48">
          <h2 className="text-xs font-bold tracking-widest text-muted-foreground flex items-center gap-2 mb-2 z-10">
            <BarChart2 className="w-4 h-4" />
            ORDER BOOK (SIMULATED)
          </h2>
          <div className="flex-1 flex flex-col text-[10px] font-mono z-10">
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>PRICE</span>
              <span>SIZE</span>
            </div>
            {/* Asks */}
            <div className="flex flex-col gap-0.5 justify-end flex-1">
              {[0.005, 0.004, 0.003, 0.002, 0.001].map((spread, i) => {
                const p = (ticker?.price || 0) * (1 + spread);
                const s = Math.random() * 10 + 0.1;
                return (
                  <div key={i} className="flex justify-between text-down relative">
                    <div className="absolute right-0 top-0 bottom-0 bg-down/10" style={{ width: `${s * 5}%` }} />
                    <span className="z-10">{formatPrice(p, 6)}</span>
                    <span className="z-10">{s.toFixed(4)}</span>
                  </div>
                );
              })}
            </div>
            {/* Spread */}
            <div className="py-1 my-1 text-center font-bold border-y border-border text-xs">
              {ticker ? formatPrice(ticker.price, 6) : '---'}
            </div>
            {/* Bids */}
            <div className="flex flex-col gap-0.5 justify-start flex-1">
              {[0.001, 0.002, 0.003, 0.004, 0.005].map((spread, i) => {
                const p = (ticker?.price || 0) * (1 - spread);
                const s = Math.random() * 10 + 0.1;
                return (
                  <div key={i} className="flex justify-between text-up relative">
                    <div className="absolute right-0 top-0 bottom-0 bg-up/10" style={{ width: `${s * 5}%` }} />
                    <span className="z-10">{formatPrice(p, 6)}</span>
                    <span className="z-10">{s.toFixed(4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Signals Panel */}
        <div className="border border-border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xs font-bold tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" />
            MARKET SIGNALS
          </h2>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">COMPOSITE</div>
            <div className={cn(
              "px-3 py-1 font-bold text-xs uppercase border",
              signals?.signal === 'strong_buy' ? "bg-up/20 text-up border-up/50" :
              signals?.signal === 'buy' ? "bg-up/10 text-up border-up/30" :
              signals?.signal === 'strong_sell' ? "bg-down/20 text-down border-down/50" :
              signals?.signal === 'sell' ? "bg-down/10 text-down border-down/30" :
              "bg-muted text-muted-foreground border-border"
            )}>
              {signals?.signal.replace('_', ' ') || 'ANALYZING...'}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">TREND</span>
              <span className="flex items-center gap-1 font-bold uppercase">
                {signals?.trend === 'bullish' && <TrendingUp className="w-4 h-4 text-up" />}
                {signals?.trend === 'bearish' && <TrendingDown className="w-4 h-4 text-down" />}
                {signals?.trend === 'sideways' && <Minus className="w-4 h-4 text-muted-foreground" />}
                <span className={cn(
                  signals?.trend === 'bullish' ? "text-up" :
                  signals?.trend === 'bearish' ? "text-down" : "text-muted-foreground"
                )}>{signals?.trend || '---'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">RSI (14)</span>
              <span className={cn(
                "font-bold",
                signals?.rsi && signals.rsi > 70 ? "text-down" : 
                signals?.rsi && signals.rsi < 30 ? "text-up" : "text-foreground"
              )}>{signals?.rsi.toFixed(2) || '---'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">MACD</span>
              <span className={cn(
                "font-bold",
                signals?.macd && signals.macd > 0 ? "text-up" :
                signals?.macd && signals.macd < 0 ? "text-down" : "text-foreground"
              )}>{signals?.macd.toFixed(4) || '---'}</span>
            </div>
            
            {(signals?.supportLevel || signals?.resistanceLevel) && (
              <div className="pt-3 border-t border-border mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">RESISTANCE</span>
                  <span className="font-bold text-down">{signals.resistanceLevel ? formatPrice(signals.resistanceLevel, 4) : '---'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">SUPPORT</span>
                  <span className="font-bold text-up">{signals.supportLevel ? formatPrice(signals.supportLevel, 4) : '---'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trade Panel */}
        <div className="border border-border bg-card flex flex-col flex-1">
          {/* Alpaca routing badge */}
          {usingAlpaca && (
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-widest border-b border-border',
              alpacaMode === 'live' ? 'bg-down/10 text-down' : 'bg-primary/10 text-primary'
            )}>
              <Zap className="w-3 h-3" />
              VIA ALPACA {alpacaMode === 'live' ? 'LIVE' : 'PAPER'}
            </div>
          )}

          <div className="flex">
            <button
              onClick={() => setTradeSide('buy')}
              className={cn(
                "flex-1 py-3 text-sm font-bold tracking-widest transition-colors border-b-2",
                tradeSide === 'buy' ? "border-up text-up bg-up/5" : "border-transparent text-muted-foreground hover:bg-muted/50"
              )}
            >
              BUY
            </button>
            <button
              onClick={() => setTradeSide('sell')}
              className={cn(
                "flex-1 py-3 text-sm font-bold tracking-widest transition-colors border-b-2",
                tradeSide === 'sell' ? "border-down text-down bg-down/5" : "border-transparent text-muted-foreground hover:bg-muted/50"
              )}
            >
              SELL
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4 flex-1">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">QUANTITY</label>
              <div className="relative">
                <input
                  {...register('quantity')}
                  type="number"
                  step="any"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary pr-16"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  {safeSymbol.split('-')[0]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {usingAlpaca ? 'LIMIT PRICE (LEAVE BLANK FOR MARKET)' : 'LIMIT PRICE (OPTIONAL)'}
              </label>
              <div className="relative">
                <input
                  {...register('price')}
                  type="number"
                  step="any"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary pr-12"
                  placeholder={ticker?.price.toString()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  USD
                </span>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-border flex justify-between items-end">
              <span className="text-xs text-muted-foreground">ESTIMATED TOTAL</span>
              <span className="text-lg font-bold">{formatPrice(estimatedTotal)}</span>
            </div>

            {/* Success message */}
            {orderSuccess && (
              <div className="text-up text-[10px] p-2 bg-up/10 border border-up/30 font-bold">
                ✓ {orderSuccess}
              </div>
            )}

            {/* Error message */}
            {submitError && (
              <div className="text-down text-[10px] p-2 bg-down/10 border border-down/30">
                {submitError?.response?.data?.error ?? submitError?.message ?? 'Order failed'}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || qty <= 0}
              className={cn(
                "w-full py-3 mt-2 text-sm font-bold tracking-widest transition-colors disabled:opacity-50",
                tradeSide === 'buy' ? "bg-up text-up-foreground hover:bg-up/90" : "bg-down text-down-foreground hover:bg-down/90"
              )}
            >
              {isSubmitting
                ? 'EXECUTING...'
                : usingAlpaca
                  ? `${tradeSide.toUpperCase()} VIA ALPACA`
                  : `PLACE ${tradeSide.toUpperCase()} ORDER`}
            </button>

            {!usingAlpaca && (
              <p className="text-[10px] text-muted-foreground text-center -mt-2">
                Connect Alpaca in Accounts to trade live
              </p>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
