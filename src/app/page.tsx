import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { ChatWindow } from '@/components/chat-window';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const userName = session.user?.name || 'Operator';
  const EmptyState = (
    <div className="flex h-full flex-col items-center justify-start px-3 py-8 text-center sm:justify-center sm:px-4 sm:py-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-secondary sm:px-4 sm:text-[10px] sm:tracking-[0.26em]">
        <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_16px_rgba(0,227,253,0.8)]" />
        Secure actions across connected accounts
      </div>

      <h1 className="mt-6 max-w-4xl text-balance font-headline text-[2rem] font-black leading-[1.02] tracking-tight text-on-surface sm:mt-8 sm:text-5xl md:text-6xl">
        One chat to work across Gmail, Calendar, Drive, YouTube, and future Coinbase flows.
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant sm:mt-5 sm:text-lg sm:leading-7">
        Ask SimieBot to read email, check your schedule, or plan a creator workflow. Sensitive actions stay
        behind Auth0 authorization so the assistant acts on your behalf without becoming reckless.
      </p>

      <div className="mt-6 grid w-full max-w-4xl gap-3 sm:mt-8 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Gmail</p>
          <p className="mt-2 text-sm text-on-surface-variant">Search mail, summarize important messages, and draft replies.</p>
        </div>
        <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Calendar</p>
          <p className="mt-2 text-sm text-on-surface-variant">Understand your day and prepare approval-aware follow-up actions.</p>
        </div>
        <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Creator</p>
          <p className="mt-2 text-sm text-on-surface-variant">Plan Drive to Nova to FFmpeg to YouTube workflows with secure account access.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(134,173,255,0.16),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(0,227,253,0.08),transparent_24%),linear-gradient(180deg,#0a0e14_0%,#0b1016_100%)]">
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col px-3 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Operator session</p>
            <h2 className="mt-2 text-pretty font-headline text-lg font-black tracking-tight text-on-surface sm:text-3xl">
              Welcome back, {userName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
              Chat is the main workspace now. Ask SimieBot to help with Gmail, Calendar, profile context,
              or creator workflows without digging through placeholder panels.
            </p>
          </div>
          <div className="w-full rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:w-fit sm:rounded-3xl sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Security model</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">Auth0 connected accounts</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[1.25rem] border border-white/8 bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:rounded-[2rem]">
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
