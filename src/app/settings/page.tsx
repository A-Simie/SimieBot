import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const settingsRows = [
  {
    title: 'Workspace appearance',
    body: 'The current product UI is standardized around the new light editorial design system.',
  },
  {
    title: 'Approval flow',
    body: 'Sensitive external actions continue to route through the Auth0 approval boundary.',
  },
  {
    title: 'Thread history',
    body: 'Conversation titles and timestamps remain available in the history workspace for continuity.',
  },
];

export default async function SettingsPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Workspace Settings.</h2>
            <p className="max-w-3xl text-[#414755]">
              Settings in the current app are intentionally minimal. The focus is on connected accounts, permissions,
              history, and approval-aware workflows rather than decorative controls.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="rounded-xl bg-white p-8 md:col-span-8">
              <h3 className="text-lg font-bold text-[#1a1c1c]">Current workspace defaults</h3>
              <div className="mt-6 space-y-4">
                {settingsRows.map((row) => (
                  <div key={row.title} className="rounded-xl bg-[#f9f9f9] p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#717786]">{row.title}</p>
                    <p className="text-sm leading-relaxed text-[#1a1c1c]">{row.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-white p-8 md:col-span-4">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">tune</span>
                <span className="text-sm font-bold uppercase tracking-widest">Configuration</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-[#f9f9f9] p-4">
                  <p className="text-sm font-bold text-[#1a1c1c]">Connected-account first</p>
                  <p className="mt-2 text-xs text-[#414755]">Provider access is granted when needed instead of up front.</p>
                </div>
                <div className="rounded-xl bg-[#f9f9f9] p-4">
                  <p className="text-sm font-bold text-[#1a1c1c]">Chat-first workspace</p>
                  <p className="mt-2 text-xs text-[#414755]">Core actions are run from chat rather than scattered admin panels.</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/accounts"
                  className="block rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Manage connected accounts
                </Link>
                <Link
                  href="/security"
                  className="block rounded-xl bg-[#f3f3f3] px-5 py-3 text-center text-sm font-semibold text-[#0058bc]"
                >
                  Review permissions
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
