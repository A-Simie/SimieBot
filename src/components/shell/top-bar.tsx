'use client';

import Link from 'next/link';
import UserButton from '@/components/auth0/user-button';

interface TopBarProps {
  user?: any;
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header
      id="simiebot-topbar"
      className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
            <span className="material-symbols-outlined text-[18px] text-primary">smart_toy</span>
          </div>
          <div className="min-w-0">
            <p className="font-headline text-base font-extrabold tracking-tight text-on-surface">SimieBot</p>
            <p className="hidden text-[10px] uppercase tracking-[0.22em] text-on-surface-variant sm:block">
              Secure connected-account assistant
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary sm:block">
            LangGraph + Auth0
          </div>
          {user && (
            <div className="flex items-center text-on-surface">
              <UserButton user={user} logoutUrl="/auth/logout" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
