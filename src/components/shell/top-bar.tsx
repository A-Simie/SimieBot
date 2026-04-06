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
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl transition-all"
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex flex-col">
          <p className="font-headline text-lg font-black tracking-tighter text-white leading-none">SimieBot</p>
          <p className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mt-1">SECURE CONNECTED-ACCOUNT ASSISTANT</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary xl:block shadow-[0_0_15px_rgba(134,173,255,0.1)]">
            AUTH0 + LANGGRAPH
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <p className="text-[10px] font-bold text-white leading-none">{user.name}</p>
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">{user.email}</p>
                </div>
                <UserButton user={user} logoutUrl="/auth/logout" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
