'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', href: '/' },
  { icon: 'hub', label: 'Workspace', href: '/hub' },
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
      className="fixed left-0 top-0 h-full flex flex-col items-center py-10 z-[60] bg-[#0d1117] border-r border-white/5 w-20 shadow-[20px_0_40px_rgba(0,0,0,0.4)]"
    >
      <div className="flex flex-col gap-12">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 group transition-all duration-300 relative",
                active
                  ? "text-primary scale-110"
                  : "text-on-surface-variant/40 hover:text-on-surface hover:scale-105"
              )}
            >
              {active && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full blur-[2px] shadow-[0_0_12px_rgba(134,173,255,0.8)]" />
              )}
              <span className={cn(
                "material-symbols-outlined text-2xl transition-all",
                active ? "drop-shadow-[0_0_10px_rgba(134,173,255,0.5)]" : ""
              )}>
                {item.icon}
              </span>
              <span className="font-headline text-[9px] font-black uppercase tracking-[0.2em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
