import React, { useState } from 'react';
import { 
  useGetPortfolioSummary,
  useListPositions,
  useListTrades
} from '@workspace/api-client-react';
import { Activity, DollarSign, Percent, TrendingUp, TrendingDown, Target, Skull } from 'lucide-react';
import { cn, formatPrice, formatPct } from '@/lib/utils';
import { Link } from 'wouter';

export default function Portfolio() {
  const { data: summary } = useGetPortfolioSummary({ query: { refetchInterval: 10000 } });
  const { data: positions } = useListPositions({ query: { refetchInterval: 5000 } });

  return (
    <div className="flex flex-col gap-6 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          PORTFOLIO OVERVIEW
        </h1>
        <div className="text-xs text-muted-foreground border border-border px-3 py-1 bg-card">
          MODE: {summary?.mode.toUpperCase() || '---'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><DollarSign className="w-3 h-3"/> NET LIQUIDITY</div>
          <div className="text-2xl font-bold">{summary ? formatPrice(summary.totalValue) : '---'}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><Activity className="w-3 h-3"/> TOTAL PNL</div>
          <div className={cn(
            "text-2xl font-bold",
            summary?.totalPnl && summary.totalPnl >= 0 ? "text-up" : summary?.totalPnl && summary.totalPnl < 0 ? "text-down" : "text-foreground"
          )}>
            {summary ? (summary.totalPnl >= 0 ? '+' : '') + formatPrice(summary.totalPnl) : '---'}
          </div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><Percent className="w-3 h-3"/> RETURN</div>
          <div className={cn(
            "text-2xl font-bold",
            summary?.totalPnlPct && summary.totalPnlPct >= 0 ? "text-up" : summary?.totalPnlPct && summary.totalPnlPct < 0 ? "text-down" : "text-foreground"
          )}>
            {summary ? (summary.totalPnlPct >= 0 ? '+' : '') + formatPct(summary.totalPnlPct) : '---'}
          </div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><Target className="w-3 h-3"/> WIN RATE</div>
          <div className="text-2xl font-bold text-primary">{summary ? formatPct(summary.winRate) : '---'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-card flex items-center gap-4">
          <div className="w-12 h-12 bg-up/10 flex items-center justify-center text-up shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">BEST TRADE</div>
            <div className="font-bold tracking-widest">{summary?.bestTrade || '---'}</div>
          </div>
        </div>
        <div className="p-4 border border-border bg-card flex items-center gap-4">
          <div className="w-12 h-12 bg-down/10 flex items-center justify-center text-down shrink-0">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">WORST TRADE</div>
            <div className="font-bold tracking-widest">{summary?.worstTrade || '---'}</div>
          </div>
        </div>
      </div>

      {/* Open Positions Table */}
      <div className="flex flex-col mt-4">
        <h2 className="text-sm font-bold tracking-widest text-foreground mb-4">OPEN POSITIONS ({positions?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-y border-border">
              <tr>
                <th className="px-4 py-3 font-medium">SYMBOL</th>
                <th className="px-4 py-3 font-medium text-right">SIZE</th>
                <th className="px-4 py-3 font-medium text-right">ENTRY</th>
                <th className="px-4 py-3 font-medium text-right">MARKET</th>
                <th className="px-4 py-3 font-medium text-right">UNREALIZED PNL</th>
                <th className="px-4 py-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {positions?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground border-b border-border">
                    NO OPEN POSITIONS
                  </td>
                </tr>
              )}
              {positions?.map((pos) => {
                const isUp = pos.pnl >= 0;
                return (
                  <tr key={pos.symbol} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{pos.symbol}</td>
                    <td className="px-4 py-3 text-right">{pos.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatPrice(pos.avgEntryPrice, 4)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(pos.currentPrice, 4)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={cn("font-bold", isUp ? "text-up" : "text-down")}>
                        {isUp ? '+' : ''}{formatPrice(pos.pnl)}
                      </div>
                      <div className={cn("text-xs", isUp ? "text-up/70" : "text-down/70")}>
                        {isUp ? '+' : ''}{formatPct(pos.pnlPct)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/market/${pos.symbol}`}
                        className="text-xs px-3 py-1 border border-border bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors inline-block"
                      >
                        TRADE
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
