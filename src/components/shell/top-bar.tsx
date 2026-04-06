'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserButton from '@/components/auth0/user-button';

interface TopBarProps {
  user?: any;
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isSignIn = pathname === '/signin';
  const isWorkspace = ['/comm', '/history', '/accounts', '/security', '/creator', '/profile'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const authHref = '/signin';
  const chatHref = user ? '/comm' : authHref;
  const workspaceMeta: Record<string, { title: string; subtitle: string }> = {
    '/comm': { title: 'Current Session', subtitle: 'Chat workspace' },
    '/history': { title: 'Current Session', subtitle: 'Conversation history' },
    '/accounts': { title: 'Current Session', subtitle: 'Connected accounts' },
    '/security': { title: 'Current Session', subtitle: 'Permissions and security' },
    '/creator': { title: 'Current Session', subtitle: 'Creator workflow' },
    '/profile': { title: 'Current Session', subtitle: 'Profile overview' },
  };
  const currentMeta =
    Object.entries(workspaceMeta).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ??
    workspaceMeta['/comm'];

  return (
    <header
      id="simiebot-topbar"
      className={`fixed top-0 z-50 w-full backdrop-blur-xl ${
        isLanding || isSignIn || isWorkspace
          ? 'border-b border-black/5 bg-white/80 shadow-sm'
          : 'border-b border-white/5 bg-slate-950/75'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-2xl sm:h-8 sm:w-8 ${
                isLanding || isSignIn || isWorkspace
                  ? 'border border-[#dbe7ff] bg-white shadow-sm'
                  : 'border border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isLanding || isSignIn || isWorkspace ? 'text-[#0058bc]' : 'text-primary'
                }`}
              >
                smart_toy
              </span>
            </div>
            <div className="min-w-0">
              <p
                className={`truncate font-headline text-[15px] font-extrabold tracking-tight sm:text-base ${
                  isLanding || isSignIn || isWorkspace ? 'text-slate-900' : 'text-on-surface'
                }`}
              >
                SimieBot
              </p>
              <p
                className={`hidden text-[10px] uppercase tracking-[0.22em] sm:block ${
                  isLanding || isSignIn || isWorkspace ? 'text-[#414755]' : 'text-on-surface-variant'
                }`}
              >
                Secure connected-account assistant
              </p>
            </div>
          </Link>

          {!isWorkspace && (
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={chatHref}
                className={`text-sm font-semibold tracking-tight ${isLanding || isSignIn ? 'text-[#0058bc]' : 'text-primary'}`}
              >
                Chat
              </Link>
              <Link
                href={chatHref}
                className={`rounded-xl px-2 py-1 text-sm tracking-tight transition-colors ${
                  isLanding || isSignIn ? 'text-slate-500 hover:bg-slate-50' : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                History
              </Link>
              <Link
                href={isLanding ? '#creator-workflow' : '/#creator-workflow'}
                className={`rounded-xl px-2 py-1 text-sm tracking-tight transition-colors ${
                  isLanding || isSignIn ? 'text-slate-500 hover:bg-slate-50' : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                Creator Workflow
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isWorkspace ? (
            <div className="hidden items-center space-x-4 md:flex">
              <span className="text-sm font-bold tracking-tight text-slate-900">{currentMeta.title}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">{currentMeta.subtitle}</span>
            </div>
          ) : isLanding && !user ? (
            <Link
              href={authHref}
              className="inline-flex items-center rounded-full bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(0,88,188,0.18)]"
            >
              Sign In
            </Link>
          ) : (
            <div
              className={`hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] sm:block ${
                isLanding || isSignIn
                  ? 'border border-[#dbe7ff] bg-white text-[#0058bc]'
                  : 'border border-white/10 bg-white/5 text-secondary'
              }`}
            >
              LangGraph + Auth0
            </div>
          )}

          {user && (
            <div className={`flex items-center ${isLanding || isSignIn || isWorkspace ? 'text-slate-900' : 'text-on-surface'}`}>
              <UserButton user={user} logoutUrl="/auth/logout" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
