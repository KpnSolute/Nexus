import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useListAccounts, 
  useConnectAccount, 
  useDisconnectAccount,
  getListAccountsQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, Unplug, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const connectSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  label: z.string().min(1, 'Label is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
});

type ConnectForm = z.infer<typeof connectSchema>;

export default function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts } = useListAccounts();
  const connectAcc = useConnectAccount();
  const disconnectAcc = useDisconnectAccount();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConnectForm>({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      exchange: 'binance'
    }
  });

  const onSubmit = (data: ConnectForm) => {
    connectAcc.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        reset();
      }
    });
  };

  const handleDisconnect = (id: number) => {
    if (confirm("Disconnect this account?")) {
      disconnectAcc.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 font-mono max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-widest flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          CONNECTED ACCOUNTS
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Account List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">ACTIVE CONNECTIONS</h2>
          
          <div className="flex flex-col gap-3">
            {accounts?.length === 0 && (
              <div className="p-8 border border-dashed border-border text-center text-muted-foreground text-sm">
                NO ACCOUNTS CONNECTED. ADD ONE TO ENABLE REAL TRADING.
              </div>
            )}
            
            {accounts?.map((acc) => (
              <div key={acc.id} className="p-4 border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center shrink-0 border",
                    acc.status === 'active' ? "bg-up/10 text-up border-up/30" : 
                    acc.status === 'error' ? "bg-down/10 text-down border-down/30" : 
                    "bg-muted text-muted-foreground border-border"
                  )}>
                    {acc.exchange.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{acc.label}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="uppercase">{acc.exchange}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {acc.status === 'active' && <CheckCircle className="w-3 h-3 text-up" />}
                        {acc.status === 'error' && <AlertTriangle className="w-3 h-3 text-down" />}
                        <span className={cn(
                          acc.status === 'active' ? "text-up" :
                          acc.status === 'error' ? "text-down" : ""
                        )}>{acc.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">BALANCE</div>
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

        {/* Connect Form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">NEW CONNECTION</h2>
          
          <div className="p-5 border border-border bg-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">EXCHANGE</label>
                <select 
                  {...register('exchange')}
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="binance">BINANCE</option>
                  <option value="coinbase">COINBASE</option>
                  <option value="kraken">KRAKEN PRO</option>
                  <option value="bybit">BYBIT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">LABEL</label>
                <input
                  {...register('label')}
                  type="text"
                  placeholder="e.g. Main Binance Account"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                {errors.label && <p className="text-down text-[10px] mt-1">{errors.label.message}</p>}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">API KEY</label>
                <input
                  {...register('apiKey')}
                  type="text"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs"
                />
                {errors.apiKey && <p className="text-down text-[10px] mt-1">{errors.apiKey.message}</p>}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">API SECRET</label>
                <input
                  {...register('apiSecret')}
                  type="password"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs"
                />
                {errors.apiSecret && <p className="text-down text-[10px] mt-1">{errors.apiSecret.message}</p>}
              </div>

              <div className="pt-2 text-[10px] text-muted-foreground leading-relaxed border-t border-border mt-4">
                <AlertTriangle className="w-3 h-3 inline mb-0.5 mr-1" />
                API keys are encrypted in transit. We recommend restricting keys to "Trading" and disabling "Withdrawal" permissions.
              </div>

              <button
                type="submit"
                disabled={connectAcc.isPending}
                className="w-full bg-primary/20 text-primary border border-primary/50 py-2.5 text-sm font-bold tracking-widest hover:bg-primary/30 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {connectAcc.isPending ? 'CONNECTING...' : 'CONNECT ACCOUNT'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
