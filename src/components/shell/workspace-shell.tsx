'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

const navItems = [
  { href: '/comm', label: 'Chat', icon: 'chat_bubble' },
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/accounts', label: 'Connected Accounts', icon: 'hub' },
  { href: '/security', label: 'Permissions & Security', icon: 'security' },
  { href: '/creator', label: 'Creator Workflow', icon: 'account_tree' },
  { href: '/profile', label: 'Profile', icon: 'person' },
];

const mobileItems = [
  { href: '/comm', label: 'Chat', icon: 'chat_bubble' },
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/accounts', label: 'Accounts', icon: 'hub' },
  { href: '/profile', label: 'Profile', icon: 'person' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] bg-[#f9f9f9] text-[#1a1c1c]">
      <aside className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 flex-col space-y-2 border-r border-[#ececec] bg-[#f9fafb] px-4 py-8 md:flex">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-black tracking-tight text-slate-900">SimieBot</h1>
          <p className="text-xs font-medium tracking-tight text-slate-500">Secure connected workspace</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-2 text-sm transition-all',
                  active
                    ? 'border-r-2 border-[#0058bc] font-bold text-[#0058bc]'
                    : 'font-medium text-slate-500 hover:bg-slate-100',
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-200/60 pt-6">
          <a
            href="/auth/logout"
            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      <main className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col md:ml-64">
        <div className="flex-1 pb-20 md:pb-0">{children}</div>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-100 bg-white/90 backdrop-blur-xl md:hidden">
          {mobileItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1',
                  active ? 'text-[#0058bc]' : 'text-slate-400',
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className={cn('text-[10px]', active ? 'font-bold' : 'font-medium')}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
