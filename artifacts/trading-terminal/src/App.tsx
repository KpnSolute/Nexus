import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, ProtectedRoute } from '@/lib/auth';
import { Layout } from '@/components/layout';

import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Market from '@/pages/market';
import Trades from '@/pages/trades';
import Portfolio from '@/pages/portfolio';
import Accounts from '@/pages/accounts';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function ProtectedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/market/:symbol" component={Market} />
        <Route path="/trades" component={Trades} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <ProtectedRoute>
          <ProtectedRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/:rest*">
        <ProtectedRoute>
          <ProtectedRoutes />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
