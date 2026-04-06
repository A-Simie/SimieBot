import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const permissionGroups = [
  {
    provider: 'Google',
    rows: [
      { label: 'Gmail read', detail: 'Search messages and review inbox context', approval: 'Read only' },
      { label: 'Gmail draft', detail: 'Prepare draft replies before you decide to send', approval: 'Read / prepare' },
      { label: 'Gmail send', detail: 'Send email to a real recipient', approval: 'Approval required' },
      { label: 'Calendar read', detail: 'Read upcoming events and scheduling context', approval: 'Read only' },
      { label: 'Drive write', detail: 'Create or update Drive files', approval: 'Approval required' },
      { label: 'YouTube publish', detail: 'Upload or publish a video', approval: 'Approval required' },
    ],
  },
  {
    provider: 'GitHub',
    rows: [
      { label: 'Repository read', detail: 'List repositories and recent events', approval: 'Read only' },
      { label: 'File modification', detail: 'Create or update repository files', approval: 'Approval required' },
    ],
  },
  {
    provider: 'Slack',
    rows: [
      { label: 'Channel read', detail: 'List accessible channels', approval: 'Read only' },
      { label: 'Message post', detail: 'Post to a Slack channel on your behalf', approval: 'Approval required' },
    ],
  },
];

const securityPillars = [
  {
    title: 'Connected-account scopes',
    body: 'Provider access is requested per provider and per use case instead of one broad shared token.',
  },
  {
    title: 'Approval boundaries',
    body: 'High-stakes send, write, and publish actions pause until you approve them in the Auth0 flow.',
  },
  {
    title: 'Clear provider separation',
    body: 'Google, GitHub, Slack, and YouTube flows stay separated so one provider does not silently grant another.',
  },
];

const protectedActions = [
  { icon: 'mail', label: 'Gmail send', detail: 'Approval required before send completes' },
  { icon: 'edit_note', label: 'Drive write', detail: 'Approval required before file changes continue' },
  { icon: 'code', label: 'GitHub modify', detail: 'Approval required before repository files are updated' },
  { icon: 'smart_display', label: 'YouTube publish', detail: 'Approval required before upload or publish proceeds' },
];

export default async function SecurityPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Permissions &amp; Security.</h2>
            <p className="max-w-3xl text-[#414755]">
              Review how SimieBot accesses connected accounts, which actions are read-only, and which flows stay
              behind explicit approval before anything changes externally.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="rounded-xl bg-white p-8 md:col-span-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center text-[#0058bc]">
                  <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                    gpp_good
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Security Model</span>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {securityPillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-xl bg-[#f9f9f9] p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#717786]">{pillar.title}</p>
                    <p className="text-sm leading-relaxed text-[#1a1c1c]">{pillar.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-[#f3f3f3] p-6">
                <h3 className="text-lg font-bold text-[#1a1c1c]">Approval model</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#414755]">
                  Reads like Gmail search, Calendar access, Slack channel listing, and GitHub event review can run with
                  scoped provider access. Sends, writes, and publishing actions require approval before SimieBot
                  continues.
                </p>
              </div>
            </section>

            <section className="flex flex-col rounded-xl bg-white p-8 md:col-span-4">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">verified_user</span>
                <span className="text-sm font-bold uppercase tracking-widest">Protected actions</span>
              </div>

              <div className="space-y-4">
                {protectedActions.map((action) => (
                  <div key={action.label} className="rounded-xl bg-[#f9f9f9] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0058bc]/5">
                        <span className="material-symbols-outlined text-lg text-[#0058bc]">{action.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1c1c]">{action.label}</p>
                        <p className="text-xs text-[#414755]">{action.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <Link
                  href="/accounts"
                  className="flex items-center text-sm font-bold text-[#0058bc] transition-transform hover:translate-x-1"
                >
                  Review linked accounts
                  <span className="material-symbols-outlined ml-1 text-sm">chevron_right</span>
                </Link>
              </div>
            </section>

            <section className="rounded-xl bg-[#f3f3f3] p-8 md:col-span-12">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#1a1c1c]">Provider Permission Matrix</h4>
                <p className="mt-1 text-sm text-[#414755]">
                  Human-readable access boundaries for the real connected services currently wired into SimieBot.
                </p>
              </div>

              <div className="space-y-6">
                {permissionGroups.map((group) => (
                  <section key={group.provider} className="rounded-xl bg-white p-6">
                    <h5 className="text-lg font-bold text-[#1a1c1c]">{group.provider}</h5>
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#ececec]">
                      {group.rows.map((row) => (
                        <div
                          key={row.label}
                          className="grid gap-2 border-b border-[#ececec] px-4 py-4 last:border-b-0 md:grid-cols-[1.3fr_2fr_180px]"
                        >
                          <div className="text-sm font-semibold text-[#1a1c1c]">{row.label}</div>
                          <div className="text-sm text-[#414755]">{row.detail}</div>
                          <div className="text-sm font-medium text-[#0058bc]">{row.approval}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
