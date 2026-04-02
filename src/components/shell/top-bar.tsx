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
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-12 bg-slate-950/60 backdrop-blur-xl shadow-neo-extrusion"
    >
      <Link href="/" className="text-lg font-black tracking-tighter text-blue-400 font-headline hover:opacity-80 transition-opacity">
        SimieBot
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500">
          <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
            <span className="material-symbols-outlined text-lg">notifications_active</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">Notifications</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
            <span className="material-symbols-outlined text-lg">terminal</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">System Log</span>
          </button>
        </div>

        {user && (
          <div className="flex items-center text-on-surface">
            <UserButton user={user} logoutUrl="/auth/logout" />
          </div>
        )}
      </div>
    </header>
  );
}
