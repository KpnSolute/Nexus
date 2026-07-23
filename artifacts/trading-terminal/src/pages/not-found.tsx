import React from 'react';
import { Link } from 'wouter';
import { Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 font-mono text-center">
      <Activity className="w-16 h-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold tracking-widest text-foreground">404</h1>
      <p className="text-muted-foreground">SYSTEM NODE NOT FOUND</p>
      <Link href="/dashboard" className="mt-4 px-6 py-2 border border-border hover:bg-muted transition-colors text-sm font-bold">
        RETURN TO TERMINAL
      </Link>
    </div>
  );
}
