import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const activityRows = [
  {
    label: 'Connected-account access',
    body: 'Provider access requests are triggered when a workflow needs Google, GitHub, Slack, or YouTube capabilities.',
  },
  {
    label: 'Approval events',
    body: 'High-stakes send, write, and publish actions pause for approval before SimieBot continues.',
  },
  {
    label: 'Chat history sync',
    body: 'Thread metadata is stored for history continuity and replay into the chat workspace.',
  },
];

const recentStates = [
  { title: 'Gmail send approvals', detail: 'Protected by approval flow before delivery', status: 'Protected' },
  { title: 'Creator publish path', detail: 'Drive to Nova to FFmpeg to YouTube is available from chat', status: 'Available' },
  { title: 'Slack and GitHub writes', detail: 'Available only when approval is granted', status: 'Protected' },
];

export default async function ActivityPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Workspace Activity.</h2>
            <p className="max-w-3xl text-[#414755]">
              This view summarizes the current product activity model instead of pretending to be a full immutable audit
              console. For permission boundaries, use the security view.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="rounded-xl bg-white p-8 md:col-span-7">
              <h3 className="text-lg font-bold text-[#1a1c1c]">Current activity model</h3>
              <div className="mt-6 space-y-4">
                {activityRows.map((row) => (
                  <div key={row.label} className="rounded-xl bg-[#f9f9f9] p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#717786]">{row.label}</p>
                    <p className="text-sm leading-relaxed text-[#1a1c1c]">{row.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-white p-8 md:col-span-5">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">task_alt</span>
                <span className="text-sm font-bold uppercase tracking-widest">Operational state</span>
              </div>
              <div className="space-y-4">
                {recentStates.map((item) => (
                  <div key={item.title} className="rounded-xl bg-[#f9f9f9] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#1a1c1c]">{item.title}</p>
                      <span className="rounded bg-[#eef4ff] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0058bc]">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#414755]">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/security"
                  className="flex items-center text-sm font-bold text-[#0058bc] transition-transform hover:translate-x-1"
                >
                  Open permissions &amp; security
                  <span className="material-symbols-outlined ml-1 text-sm">chevron_right</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
