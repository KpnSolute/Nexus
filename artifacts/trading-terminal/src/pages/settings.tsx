import React from 'react';
import { useAuth } from '@/lib/auth';
import { useUpdateTradingMode, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, ShieldAlert, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const updateMode = useUpdateTradingMode();

  const handleToggleMode = (mode: 'paper' | 'real') => {
    if (mode === user?.tradingMode) return;

    if (mode === 'real') {
      if (!confirm("WARNING: Switching to REAL mode will use connected exchange accounts and real funds. Are you sure?")) {
        return;
      }
    }

    updateMode.mutate({ data: { mode } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 font-mono max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-widest flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" />
          SYSTEM SETTINGS
        </h1>
      </div>

      {/* Trading Mode Toggle */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">TRADING ENVIRONMENT</h2>
        
        <div className="p-6 border border-border bg-card flex flex-col gap-6">
          
          <div className="flex bg-input border border-border p-1 relative">
            <button
              onClick={() => handleToggleMode('paper')}
              disabled={updateMode.isPending}
              className={cn(
                "flex-1 py-4 text-center font-bold tracking-widest transition-all z-10 flex flex-col items-center gap-2",
                user?.tradingMode === 'paper' ? "text-up" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-6 h-6" />
              PAPER TRADING
            </button>
            <button
              onClick={() => handleToggleMode('real')}
              disabled={updateMode.isPending}
              className={cn(
                "flex-1 py-4 text-center font-bold tracking-widest transition-all z-10 flex flex-col items-center gap-2",
                user?.tradingMode === 'real' ? "text-down" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldAlert className="w-6 h-6" />
              REAL FUNDS
            </button>

            {/* Active background slider */}
            <div className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] transition-all duration-300 pointer-events-none",
              user?.tradingMode === 'paper' ? "left-1 bg-up/10 border border-up/30" : "left-[calc(50%+2px)] bg-down/10 border border-down/30"
            )} />
          </div>

          {user?.tradingMode === 'real' ? (
            <div className="p-4 border border-down/50 bg-down/10 text-down text-sm flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold mb-1">REAL TRADING ACTIVE</div>
                <div className="text-down/80 text-xs leading-relaxed">
                  Orders placed will be routed to your connected exchange accounts and executed with real funds. 
                  Double check order quantities and prices. Market orders may experience slippage.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-up/50 bg-up/10 text-up text-sm flex gap-3">
              <BookOpen className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold mb-1">PAPER TRADING ACTIVE</div>
                <div className="text-up/80 text-xs leading-relaxed">
                  Orders are simulated using real-time market data but no real funds are at risk.
                  Use this environment to test strategies and build familiarity with the terminal.
                </div>
              </div>
            </div>
          )}

          {/* Note about Alpaca mode */}
          <div className="text-[10px] text-muted-foreground border-t border-border pt-4 leading-relaxed">
            <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" />
            This toggle controls the default paper/real environment for <strong>internal trades</strong>.
            If you have connected an Alpaca account, orders on the market page are routed through Alpaca's own paper or live mode,
            regardless of this setting.{' '}
            <Link href="/accounts" className="text-primary hover:underline inline-flex items-center gap-0.5">
              Manage Alpaca <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">OPERATOR INFO</h2>
        <div className="p-4 border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">USERNAME</div>
              <div className="font-bold text-lg">{user?.username}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">SYSTEM ID</div>
              <div className="font-mono text-muted-foreground">OP-{user?.id.toString().padStart(4, '0')}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">JOINED</div>
              <div className="font-mono text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---'}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
