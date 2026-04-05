import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { ChatWindow } from '@/components/chat-window';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const userName = session.user?.name || 'Operator';
  const EmptyState = (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-secondary">
        <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_16px_rgba(0,227,253,0.8)]" />
        Secure actions across connected accounts
      </div>

      <h1 className="mt-8 max-w-4xl font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl md:text-6xl">
        One chat to work across Gmail, Calendar, Drive, YouTube, and future Coinbase flows.
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
        Ask SimieBot to read email, check your schedule, or plan a creator workflow. Sensitive actions stay
        behind Auth0 authorization so the assistant acts on your behalf without becoming reckless.
      </p>

      <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Gmail</p>
          <p className="mt-2 text-sm text-on-surface-variant">Search mail, summarize important messages, and draft replies.</p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Calendar</p>
          <p className="mt-2 text-sm text-on-surface-variant">Understand your day and prepare approval-aware follow-up actions.</p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Creator</p>
          <p className="mt-2 text-sm text-on-surface-variant">Plan Drive to Nova to FFmpeg to YouTube workflows with secure account access.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-3rem)] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(134,173,255,0.16),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(0,227,253,0.08),transparent_24%),linear-gradient(180deg,#0a0e14_0%,#0b1016_100%)]">
      <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-6xl flex-col px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Operator session</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-on-surface sm:text-3xl">
              Welcome back, {userName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant sm:text-base">
              Chat is the main workspace now. Ask SimieBot to help with Gmail, Calendar, profile context,
              or creator workflows without digging through placeholder panels.
            </p>
          </div>
          <div className="hidden rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-right shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Security model</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">Auth0 connected accounts</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <ChatWindow
            endpoint={`${process.env.APP_BASE_URL}/api/chat`}
            placeholder={`Ask SimieBot anything, ${userName.split(' ')[0] || userName}...`}
            emptyStateComponent={EmptyState}
          />
        </div>
      </div>
    </div>
  );
}
