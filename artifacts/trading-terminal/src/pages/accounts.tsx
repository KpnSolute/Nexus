import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useListAccounts,
  useConnectAccount,
  useDisconnectAccount,
  useGetAlpacaAccount,
  useListAlpacaPositions,
  useListAlpacaOrders,
  useCancelAlpacaOrder,
  getListAccountsQueryKey,
  getGetAlpacaAccountQueryKey,
  getListAlpacaPositionsQueryKey,
  getListAlpacaOrdersQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Wallet, Plus, Unplug, CheckCircle, AlertTriangle,
  TrendingUp, TrendingDown, BarChart2, Clock, X,
  ShieldCheck, FlaskConical,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const connectSchema = z.object({
  label:     z.string().min(1, 'Label is required'),
  apiKey:    z.string().min(10, 'API Key is required'),
  apiSecret: z.string().min(10, 'API Secret is required'),
  mode:      z.enum(['paper', 'live']),
});
type ConnectForm = z.infer<typeof connectSchema>;

function AlpacaPanel() {
  const { data: alpacaAccount, isLoading: acctLoading, error: acctError } = useGetAlpacaAccount();
  const { data: positions } = useListAlpacaPositions();
  const { data: orders }    = useListAlpacaOrders();
  const cancelOrder = useCancelAlpacaOrder();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'positions' | 'orders'>('positions');

  if (acctLoading) {
    return (
      <div className="p-6 border border-border bg-card text-center text-muted-foreground text-xs">
        CONNECTING TO ALPACA...
      </div>
    );
  }

  if (acctError || !alpacaAccount) return null;

  const equityChange = alpacaAccount.portfolioValue - alpacaAccount.cash;
  const isLive = alpacaAccount.mode === 'live';

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Account overview */}
      <div className="p-4 border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-up animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-primary">
              ALPACA {isLive ? 'LIVE' : 'PAPER'} ACCOUNT
            </span>
          </div>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 border',
            isLive
              ? 'bg-down/10 text-down border-down/30'
              : 'bg-up/10 text-up border-up/30',
          )}>
            {isLive ? '⚡ LIVE TRADING' : '🧪 PAPER TRADING'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">PORTFOLIO VALUE</div>
            <div className="font-bold text-lg">{formatPrice(alpacaAccount.portfolioValue)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">EQUITY</div>
            <div className="font-bold text-lg">{formatPrice(alpacaAccount.equity)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">BUYING POWER</div>
            <div className="font-bold text-lg text-primary">{formatPrice(alpacaAccount.buyingPower)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">CASH</div>
            <div className="font-bold text-lg">{formatPrice(alpacaAccount.cash)}</div>
          </div>
        </div>
      </div>

      {/* Tabs: Positions / Orders */}
      <div className="flex gap-0 border-b border-border">
        {(['positions', 'orders'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-xs font-bold tracking-widest border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'positions' ? 'POSITIONS' : 'ORDERS'}
            {t === 'positions' && positions && positions.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1">{positions.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'positions' && (
        <div className="flex flex-col gap-2">
          {!positions || positions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs border border-dashed border-border">
              NO OPEN POSITIONS
            </div>
          ) : positions.map(p => {
            const pnlPositive = p.unrealizedPl >= 0;
            return (
              <div key={p.symbol} className="p-3 border border-border bg-card flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 flex items-center justify-center text-[10px] font-bold border',
                    p.side === 'long' ? 'bg-up/10 text-up border-up/30' : 'bg-down/10 text-down border-down/30',
                  )}>
                    {p.side === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{p.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{p.qty} units · avg {formatPrice(p.avgEntryPrice)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-muted-foreground">CURRENT</div>
                    <div className="font-bold text-sm">{formatPrice(p.currentPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">MKT VALUE</div>
                    <div className="font-bold text-sm">{formatPrice(p.marketValue)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">UNREAL P&L</div>
                    <div className={cn('font-bold text-sm', pnlPositive ? 'text-up' : 'text-down')}>
                      {pnlPositive ? '+' : ''}{formatPrice(p.unrealizedPl)}
                      <span className="text-[10px] ml-1">({pnlPositive ? '+' : ''}{p.unrealizedPlPct.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'orders' && (
        <div className="flex flex-col gap-2">
          {!orders || orders.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs border border-dashed border-border">
              NO ORDERS
            </div>
          ) : orders.map(o => {
            const statusColor =
              o.status === 'filled'    ? 'text-up' :
              o.status === 'canceled'  ? 'text-muted-foreground' :
              o.status === 'rejected'  ? 'text-down' :
              o.status === 'new' || o.status === 'accepted' ? 'text-primary' :
              'text-muted-foreground';
            const canCancel = ['new', 'accepted', 'pending_new', 'partially_filled'].includes(o.status);
            return (
              <div key={o.id} className="p-3 border border-border bg-card flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 border uppercase',
                    o.side === 'buy'
                      ? 'bg-up/10 text-up border-up/30'
                      : 'bg-down/10 text-down border-down/30',
                  )}>
                    {o.side}
                  </span>
                  <div>
                    <div className="font-bold text-sm">{o.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {o.qty} {o.type.toUpperCase()}
                      {o.limitPrice ? ` @ ${formatPrice(o.limitPrice)}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn('text-xs font-bold uppercase', statusColor)}>{o.status}</div>
                    {o.filledAvgPrice && (
                      <div className="text-[10px] text-muted-foreground">filled @ {formatPrice(o.filledAvgPrice)}</div>
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(o.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  {canCancel && (
                    <button
                      onClick={() => {
                        if (!confirm(`Cancel this ${o.side.toUpperCase()} order for ${o.qty} ${o.symbol}?`)) return;
                        cancelOrder.mutate({ orderId: o.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAlpacaOrdersQueryKey() }),
                        });
                      }}
                      disabled={cancelOrder.isPending}
                      className="p-1.5 border border-border hover:bg-down/20 hover:text-down hover:border-down/40 transition-colors disabled:opacity-50"
                      title="Cancel order"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts } = useListAccounts();
  const connectAcc   = useConnectAccount();
  const disconnectAcc = useDisconnectAccount();

  const hasAlpaca = accounts?.some(a => a.exchange === 'alpaca' && a.status === 'active');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ConnectForm>({
    resolver: zodResolver(connectSchema),
    defaultValues: { mode: 'paper' },
  });

  const selectedMode = watch('mode');

  const onSubmit = (data: ConnectForm) => {
    connectAcc.mutate(
      { data: { exchange: 'alpaca', label: data.label, apiKey: data.apiKey, apiSecret: data.apiSecret, mode: data.mode } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAlpacaAccountQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAlpacaPositionsQueryKey() });
          reset();
        },
      },
    );
  };

  const handleDisconnect = (id: number) => {
    if (!confirm('Disconnect this account? Live positions will remain open on Alpaca.')) return;
    disconnectAcc.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlpacaAccountQueryKey() });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-mono max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-widest flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          CONNECTED ACCOUNTS
        </h1>
      </div>

      {/* Live Alpaca data panel — shown when connected */}
      {hasAlpaca && <AlpacaPanel />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Account list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">ACTIVE CONNECTIONS</h2>
          <div className="flex flex-col gap-3">
            {accounts?.length === 0 && (
              <div className="p-8 border border-dashed border-border text-center text-muted-foreground text-sm">
                NO ACCOUNTS CONNECTED. ADD YOUR ALPACA KEY TO ENABLE REAL TRADING.
              </div>
            )}
            {accounts?.map(acc => (
              <div key={acc.id} className="p-4 border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Exchange badge */}
                  <div className={cn(
                    'w-12 h-12 flex items-center justify-center shrink-0 border text-xs font-bold',
                    acc.status === 'active' ? 'bg-up/10 text-up border-up/30' :
                    acc.status === 'error'  ? 'bg-down/10 text-down border-down/30' :
                                             'bg-muted text-muted-foreground border-border',
                  )}>
                    AL
                  </div>
                  <div>
                    <div className="font-bold">{acc.label}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                      <span className="uppercase">{acc.exchange}</span>
                      <span>·</span>
                      <span className={cn(
                        'px-1.5 py-0.5 border text-[9px] font-bold flex items-center gap-1',
                        (acc as any).mode === 'live'
                          ? 'bg-down/10 text-down border-down/30'
                          : 'bg-primary/10 text-primary border-primary/30',
                      )}>
                        {(acc as any).mode === 'live'
                          ? <><ShieldCheck className="w-2.5 h-2.5" /> LIVE</>
                          : <><FlaskConical className="w-2.5 h-2.5" /> PAPER</>}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        {acc.status === 'active' && <CheckCircle className="w-3 h-3 text-up" />}
                        {acc.status === 'error'  && <AlertTriangle className="w-3 h-3 text-down" />}
                        <span className={cn(
                          acc.status === 'active' ? 'text-up' :
                          acc.status === 'error'  ? 'text-down' : '',
                        )}>
                          {acc.status.toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground mb-1">EQUITY</div>
                    <div className="font-bold">{acc.balance ? formatPrice(acc.balance) : '---'}</div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-border hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50 transition-colors text-xs"
                  >
                    <Unplug className="w-3 h-3" />
                    DISCONNECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect Alpaca form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">CONNECT ALPACA</h2>

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-0 border border-border">
            {(['paper', 'live'] as const).map(m => (
              <label
                key={m}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 cursor-pointer text-xs font-bold tracking-widest transition-colors',
                  selectedMode === m
                    ? m === 'live'
                      ? 'bg-down/15 text-down'
                      : 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50',
                )}
              >
                <input type="radio" {...register('mode')} value={m} className="sr-only" />
                {m === 'paper'
                  ? <FlaskConical className="w-5 h-5" />
                  : <ShieldCheck className="w-5 h-5" />}
                <span>{m === 'paper' ? 'PAPER TRADING' : 'LIVE TRADING'}</span>
                <span className="text-[9px] font-normal opacity-70">
                  {m === 'paper' ? 'paper-api.alpaca.markets' : 'api.alpaca.markets'}
                </span>
              </label>
            ))}
          </div>

          <div className="p-5 border border-border bg-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">ACCOUNT LABEL</label>
                <input
                  {...register('label')}
                  type="text"
                  placeholder="e.g. My Paper Account"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                {errors.label && <p className="text-down text-[10px] mt-1">{errors.label.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">API KEY ID</label>
                <input
                  {...register('apiKey')}
                  type="text"
                  placeholder="PKXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs"
                  autoComplete="off"
                />
                {errors.apiKey && <p className="text-down text-[10px] mt-1">{errors.apiKey.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">SECRET KEY</label>
                <input
                  {...register('apiSecret')}
                  type="password"
                  placeholder="••••••••••••••••••••"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs"
                  autoComplete="new-password"
                />
                {errors.apiSecret && <p className="text-down text-[10px] mt-1">{errors.apiSecret.message}</p>}
              </div>

              {connectAcc.error && (
                <div className="text-down text-[10px] p-2 bg-down/10 border border-down/30">
                  {(connectAcc.error as any)?.response?.data?.error ?? 'Connection failed. Check your keys.'}
                </div>
              )}

              <div className="pt-2 text-[10px] text-muted-foreground leading-relaxed border-t border-border">
                <AlertTriangle className="w-3 h-3 inline mb-0.5 mr-1" />
                {selectedMode === 'live'
                  ? 'LIVE mode uses real funds. Restrict keys to "Trading Only" — disable Withdrawals.'
                  : 'PAPER mode uses simulated funds. Safe for testing strategies without risk.'}
              </div>

              <div className="text-[10px] text-muted-foreground">
                Get your keys at{' '}
                <a
                  href="https://app.alpaca.markets/paper/dashboard/overview"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  app.alpaca.markets
                </a>
              </div>

              <button
                type="submit"
                disabled={connectAcc.isPending}
                className={cn(
                  'w-full py-2.5 text-sm font-bold tracking-widest transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2 border',
                  selectedMode === 'live'
                    ? 'bg-down/20 text-down border-down/50 hover:bg-down/30'
                    : 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30',
                )}
              >
                <Plus className="w-4 h-4" />
                {connectAcc.isPending ? 'VALIDATING...' : `CONNECT ${selectedMode.toUpperCase()}`}
              </button>
            </form>
          </div>

          {/* Info about Alpaca */}
          <div className="p-4 border border-border bg-card text-[10px] text-muted-foreground space-y-2">
            <div className="font-bold text-foreground text-xs mb-2">ALPACA SUPPORTS</div>
            <div className="flex items-start gap-2"><BarChart2 className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> Crypto: BTC, ETH, SOL, and 20+ pairs</div>
            <div className="flex items-start gap-2"><TrendingUp className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> US Stocks &amp; ETFs (market + limit orders)</div>
            <div className="flex items-start gap-2"><Clock className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> Extended-hours trading</div>
            <div className="flex items-start gap-2"><FlaskConical className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> Free paper trading with $100K virtual funds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
