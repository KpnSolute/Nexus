import React from 'react';
import { Link } from 'wouter';
import { Activity, Zap, GitBranch, BarChart3, Shield, ArrowRight, ChevronRight } from 'lucide-react';

const BROKERS = ['Coinbase', 'Binance', 'Kraken', 'Bybit', 'Alpaca'];

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Multi-Broker Unified',
    description: 'Connect Coinbase, Binance, Kraken, Bybit, and Alpaca from a single terminal. One login, every exchange.',
    accent: '#3B82F6',
  },
  {
    icon: Zap,
    title: 'Price-Triggered Automations',
    description: 'Define rules — "buy 0.1 BTC when price drops below $80K" — and let Tradora execute them the moment the market moves.',
    accent: '#F59E0B',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Portfolio',
    description: 'Live position aggregation across all your connected brokers. See your true exposure at a glance.',
    accent: '#10B981',
  },
];

const STEPS = [
  { n: '01', label: 'Create your account', sub: 'Register in seconds. No KYC required on the terminal level.' },
  { n: '02', label: 'Connect your brokers', sub: 'Paste your API keys. Tradora validates and stores them securely.' },
  { n: '03', label: 'Trade or automate', sub: 'Use the live market terminal or set up price-triggered automation rules.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-widest text-sm">TRADORA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest">
                SIGN IN
              </button>
            </Link>
            <Link href="/register">
              <button className="text-xs bg-primary text-primary-foreground px-4 py-2 tracking-widest hover:bg-primary/90 transition-colors">
                GET STARTED
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(to right, #3B82F6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-border bg-card px-4 py-1.5 text-[10px] tracking-widest text-muted-foreground mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            MULTI-BROKER ALGORITHMIC TRADING — LIVE
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[0.9] mb-6">
            TRADE<br />
            <span className="text-primary">SMARTER.</span><br />
            EVERYWHERE.
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Tradora connects all your crypto brokers under one terminal. Set price-triggered
            automations, monitor live P&amp;L, and execute trades across Coinbase, Binance, Kraken,
            and Bybit — simultaneously.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-all">
                INITIALIZE TERMINAL
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 border border-border text-foreground px-8 py-3 text-xs font-bold tracking-widest hover:bg-card transition-colors">
                SIGN IN
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Broker badges */}
          <div className="mt-14 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[10px] text-muted-foreground tracking-widest mr-2">CONNECTED TO</span>
            {BROKERS.map(b => (
              <span key={b} className="border border-border bg-card text-[10px] px-3 py-1 text-muted-foreground tracking-wider">
                {b.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal preview mockup */}
        <div className="relative z-10 mt-20 w-full max-w-5xl mx-auto">
          <div className="border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-card/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 text-[10px] text-muted-foreground tracking-widest">TRADORA TERMINAL — LIVE</span>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3 text-[11px]">
              {[
                { sym: 'BTC-USDT', price: '97,842.10', chg: '+2.41%', up: true },
                { sym: 'ETH-USDT', price: '3,521.88', chg: '+1.83%', up: true },
                { sym: 'SOL-USDT', price: '192.44', chg: '-0.62%', up: false },
              ].map(t => (
                <div key={t.sym} className="border border-border bg-background/50 p-3">
                  <div className="text-muted-foreground mb-1 tracking-widest">{t.sym}</div>
                  <div className="text-base font-bold text-foreground">${t.price}</div>
                  <div className={t.up ? 'text-green-400' : 'text-red-400'}>{t.chg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] tracking-widest text-primary mb-3">// PLATFORM FEATURES</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need.<br />Nothing you don't.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="border border-border bg-card p-6 group hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 border border-border flex items-center justify-center mb-5 group-hover:border-primary/40 transition-colors">
                  <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                </div>
                <h3 className="font-bold tracking-wide mb-3 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] tracking-widest text-primary mb-3">// QUICKSTART</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Up and trading in minutes.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-4 left-full w-full h-px border-t border-dashed border-border -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-primary/20 mb-4 font-mono">{s.n}</div>
                  <h3 className="font-bold text-sm tracking-wide mb-2">{s.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="py-16 px-6 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide mb-1">Non-custodial. Always.</div>
              <div className="text-xs text-muted-foreground">Tradora never holds your funds. API keys are stored encrypted. You stay in control.</div>
            </div>
          </div>
          <Link href="/register">
            <button className="shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors">
              START FREE <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest">TRADORA</span>
          </div>
          <div className="text-[10px] text-muted-foreground tracking-widest">
            MULTI-BROKER ALGORITHMIC TRADING TERMINAL
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors tracking-widest">SIGN IN</Link>
            <Link href="/register" className="hover:text-foreground transition-colors tracking-widest">REGISTER</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
