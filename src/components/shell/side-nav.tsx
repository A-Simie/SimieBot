'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', href: '/' },
  { icon: 'hub', label: 'Workspace', href: '/comm' },
  { icon: 'account_balance_wallet', label: 'Finance', href: '/crypto' },
  { icon: 'subscriptions', label: 'Creator', href: '/media' },
  { icon: 'monitoring', label: 'Activity', href: '/activity' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      id="simiebot-sidenav"
      className="fixed left-0 top-0 h-full flex flex-col items-center py-8 z-40 bg-slate-900/60 backdrop-blur-2xl w-20 rounded-r-3xl shadow-sidebar pt-20"
    >
      <div className="flex flex-col gap-10">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 group transition-all duration-300
                ${active
                  ? 'text-blue-400 drop-shadow-[0_0_12px_rgba(74,140,255,0.8)] scale-110'
                  : 'text-slate-600 grayscale opacity-70 hover:opacity-100 hover:scale-105'
                }
              `}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="font-headline text-[8px] font-bold uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
