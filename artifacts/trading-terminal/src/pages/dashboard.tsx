import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  useGetPortfolioSummary, 
  useGetWatchlist, 
  useGetTrendingMarkets,
  useListMarkets,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  getGetWatchlistQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { TrendingUp, TrendingDown, Activity, Plus, X, Search, DollarSign, Percent, List } from 'lucide-react';
import { cn, formatPrice, formatPct, formatNumber } from '@/lib/utils';
import type { MarketTicker, WatchlistInput } from '@workspace/api-client-react/src/generated/api.schemas';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: summary } = useGetPortfolioSummary({ query: { refetchInterval: 5000 } });
  const { data: watchlist } = useGetWatchlist();
  const { data: trending } = useGetTrendingMarkets({ query: { refetchInterval: 5000 } });
  const { data: markets } = useListMarkets();
  
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  const [newSymbol, setNewSymbol] = useState('');
  const [liveTickers, setLiveTickers] = useState<Record<string, any>>({});
  const wsRef = useRef<WebSocket | null>(null);

  // Determine symbols to subscribe to
  const watchlistSymbols = useMemo(() => {
    return watchlist?.map(w => w.symbol) || [];
  }, [watchlist]);

  useEffect(() => {
    // Setup WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (watchlistSymbols.length > 0) {
        ws.send(JSON.stringify({ type: "subscribe", symbols: watchlistSymbols }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ticker") {
          setLiveTickers(prev => ({
            ...prev,
            [data.symbol]: data
          }));
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Update subscription when watchlist changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && watchlistSymbols.length > 0) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", symbols: watchlistSymbols }));
    }
  }, [watchlistSymbols]);

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;
    const symbol = newSymbol.toUpperCase();
    addWatchlist.mutate({ data: { symbol } }, {
      onSuccess: () => {
        setNewSymbol('');
        queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
      }
    });
  };

  const handleRemoveWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWatchlist.mutate({ symbol }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border border-border bg-card flex flex-col gap-2 relative overflow-hidden group">
          <div className="text-xs text-muted-foreground">TOTAL VALUE</div>
          <div className="text-2xl font-bold tracking-tight">
            {summary ? formatPrice(summary.totalValue) : '---'}
          </div>
          <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 text-muted/10 group-hover:text-primary/10 transition-colors" />
        </div>
        <div className="p-4 border border-border bg-card flex flex-col gap-2 relative overflow-hidden group">
          <div className="text-xs text-muted-foreground">TOTAL PNL</div>
          <div className={cn(
            "text-2xl font-bold tracking-tight",
            summary?.totalPnl && summary.totalPnl >= 0 ? "text-up" : summary?.totalPnl && summary.totalPnl < 0 ? "text-down" : "text-foreground"
          )}>
            {summary ? (summary.totalPnl >= 0 ? '+' : '') + formatPrice(summary.totalPnl) : '---'}
          </div>
          <Activity className="absolute -bottom-4 -right-4 w-24 h-24 text-muted/10 group-hover:text-primary/10 transition-colors" />
        </div>
        <div className="p-4 border border-border bg-card flex flex-col gap-2 relative overflow-hidden group">
          <div className="text-xs text-muted-foreground">PNL %</div>
          <div className={cn(
            "text-2xl font-bold tracking-tight",
            summary?.totalPnlPct && summary.totalPnlPct >= 0 ? "text-up" : summary?.totalPnlPct && summary.totalPnlPct < 0 ? "text-down" : "text-foreground"
          )}>
            {summary ? (summary.totalPnlPct >= 0 ? '+' : '') + formatPct(summary.totalPnlPct) : '---'}
          </div>
          <Percent className="absolute -bottom-4 -right-4 w-24 h-24 text-muted/10 group-hover:text-primary/10 transition-colors" />
        </div>
        <div className="p-4 border border-border bg-card flex flex-col gap-2 relative overflow-hidden group">
          <div className="text-xs text-muted-foreground">WIN RATE</div>
          <div className="text-2xl font-bold tracking-tight text-primary">
            {summary ? formatPct(summary.winRate) : '---'}
          </div>
          <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-muted/10 group-hover:text-primary/10 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-bold tracking-widest text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              WATCHLIST
            </h2>
            <form onSubmit={handleAddWatchlist} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select 
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                  className="w-48 bg-input border border-border text-foreground px-8 py-1 text-xs focus:outline-none focus:border-primary uppercase appearance-none"
                >
                  <option value="" disabled>ADD SYMBOL...</option>
                  {markets?.map(m => (
                    <option key={m.symbol} value={m.symbol}>{m.symbol} ({m.exchange})</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={addWatchlist.isPending || !newSymbol}
                className="bg-primary/20 text-primary border border-primary/50 p-1 hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {watchlist?.length === 0 && (
              <div className="col-span-full py-8 text-center border border-dashed border-border text-muted-foreground text-xs">
                NO SYMBOLS IN WATCHLIST
              </div>
            )}
            {watchlist?.map(item => {
              const liveData = liveTickers[item.symbol];
              const price = liveData?.price ?? 0;
              const changePct = liveData?.changePct24h ?? 0;
              const isUp = changePct >= 0;

              return (
                <Link key={item.id} href={`/market/${item.symbol}`}>
                  <div className="p-3 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group relative">
                    <button 
                      onClick={(e) => handleRemoveWatchlist(item.symbol, e)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-lg">{item.symbol}</div>
                      <div className={cn(
                        "text-xs px-1.5 py-0.5 font-bold",
                        isUp ? "bg-up/20 text-up" : "bg-down/20 text-down"
                      )}>
                        {isUp ? '+' : ''}{changePct.toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className={cn(
                        "text-xl tracking-tight transition-colors duration-300",
                        liveData ? (isUp ? "text-up" : "text-down") : "text-foreground"
                      )}>
                        {price ? formatPrice(price, 4) : 'LOADING...'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        24H
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trending Markets */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-bold tracking-widest text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              TRENDING
            </h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {trending?.map(ticker => {
              const isUp = ticker.changePct24h >= 0;
              return (
                <Link key={ticker.symbol} href={`/market/${ticker.symbol}`}>
                  <div className="flex items-center justify-between p-2 border border-transparent hover:border-border hover:bg-card transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted text-xs font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        {ticker.symbol.substring(0,2)}
                      </div>
                      <div className="font-bold">{ticker.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatPrice(ticker.price, 4)}</div>
                      <div className={cn(
                        "text-xs",
                        isUp ? "text-up" : "text-down"
                      )}>
                        {isUp ? '+' : ''}{ticker.changePct24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
