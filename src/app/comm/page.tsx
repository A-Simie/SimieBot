import { redirect } from 'next/navigation';

import { ChatWindow } from '@/components/chat-window';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

export default async function CommPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const firstName = session.user?.name?.split(' ')[0] || 'there';

  const EmptyState = (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-12 px-6 py-12">
      <section className="flex flex-col items-start space-y-4 pt-10">
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#1a1c1c] md:text-5xl">
          Hello, {firstName}.
          <br />
          <span className="text-[#717786]">How can I help you today?</span>
        </h2>
      </section>

      <div className="rounded-xl border-l-4 border-[#0058bc] bg-white p-6 shadow-[0_20px_40px_rgba(0,88,188,0.04)]">
        <div className="flex space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#0058bc]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1a1c1c]">Approval boundary</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#414755]">
              SimieBot can prepare and route work across Gmail, Slack, GitHub, Drive, and YouTube, but sending,
              writing, and publishing actions stay behind approval before anything changes externally.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0058bc]">
            Latest analysis
          </span>
          <h4 className="mb-2 text-lg font-bold leading-tight text-[#1a1c1c]">Cross-account workspace</h4>
          <p className="text-sm text-[#414755]">
            Ask SimieBot to search Gmail, check Calendar, review GitHub activity, or summarize Slack channel context in
            one thread.
          </p>
        </div>

        <div className="rounded-xl bg-[#f3f3f3] p-6">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#4e5e6c]">
            System status
          </span>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h4 className="text-lg font-bold leading-tight text-[#1a1c1c]">Creator pipeline ready</h4>
          </div>
          <p className="mt-2 text-sm text-[#414755]">
            Drive listing, Nova planning, FFmpeg rendering, and YouTube publish routing are all available from chat.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell>
      <div className="relative min-h-[calc(100dvh-3.5rem)]">
        <ChatWindow
          endpoint={`${process.env.APP_BASE_URL}/api/chat`}
          placeholder={`Hello ${firstName}, how can I help?`}
          emptyStateComponent={EmptyState}
          user={session.user}
          showHistorySidebar={false}
        />
      </div>
    </WorkspaceShell>
  );
}
