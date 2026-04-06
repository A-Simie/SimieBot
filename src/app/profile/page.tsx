import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';
import { getIdentityProviderKey, getIdentityProviderName } from '@/lib/identity';

function getAvatarFallback(user: { name?: string | null; given_name?: string | null; family_name?: string | null }) {
  if (user.given_name && user.family_name) {
    return `${user.given_name[0]}${user.family_name[0]}`;
  }

  const name = user.name?.trim();
  if (!name) return 'SB';

  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

type ServiceStatus = {
  name: string;
  status: string;
  tone: 'active' | 'pending';
  icon: string;
};

function getServiceStatuses(provider: ReturnType<typeof getIdentityProviderKey>): ServiceStatus[] {
  return [
    {
      name: 'GitHub',
      status: provider === 'github' ? 'Active connection' : 'Connect on demand',
      tone: provider === 'github' ? 'active' : 'pending',
      icon: 'terminal',
    },
    {
      name: 'Google Workspace',
      status: provider === 'google' ? 'Active connection' : 'Connect on demand',
      tone: provider === 'google' ? 'active' : 'pending',
      icon: 'mail',
    },
    {
      name: 'Slack',
      status: provider === 'slack' ? 'Active connection' : 'Connect on demand',
      tone: provider === 'slack' ? 'active' : 'pending',
      icon: 'forum',
    },
    {
      name: 'YouTube',
      status: provider === 'google' ? 'Available via Google' : 'Needs Google access',
      tone: provider === 'google' ? 'active' : 'pending',
      icon: 'play_circle',
    },
  ];
}

const securityRows = [
  {
    icon: 'gpp_good',
    title: 'Approval gates active',
    body: 'Sensitive send, write, and publish actions stay behind approval before they continue.',
  },
  {
    icon: 'history_edu',
    title: 'Permission ledger',
    body: 'Your permission boundaries are documented in the security view and grouped by provider.',
  },
];

const permissionCards = [
  {
    icon: 'mail',
    title: 'Gmail send',
    body: 'Requires approval before SimieBot sends a real message.',
    tone: 'active',
  },
  {
    icon: 'edit_note',
    title: 'Drive write',
    body: 'Requires approval before files are created or updated.',
    tone: 'active',
  },
  {
    icon: 'code',
    title: 'GitHub modify',
    body: 'Requires approval before repository files are changed.',
    tone: 'active',
  },
  {
    icon: 'smart_display',
    title: 'YouTube publish',
    body: 'Requires approval before a video is uploaded or published.',
    tone: 'active',
  },
];

export default async function ProfilePage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const providerName = getIdentityProviderName(session.user.sub);
  const providerKey = getIdentityProviderKey(session.user.sub);
  const services = getServiceStatuses(providerKey);
  const joinedDisplay = session.user.updated_at
    ? new Date(session.user.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Current session';

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Account Overview.</h2>
            <p className="max-w-2xl text-[#414755]">
              Review your identity, provider access posture, linked workflow surfaces, and the approval boundaries that
              keep SimieBot acting within your control.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="relative overflow-hidden rounded-xl bg-white p-8 md:col-span-8">
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20 rounded-full ring-1 ring-[#c1c6d7]/20">
                    <AvatarImage src={session.user.picture} alt={session.user.name ?? 'Profile'} />
                    <AvatarFallback className="bg-[#eef4ff] text-lg font-bold text-[#0058bc]">
                      {getAvatarFallback(session.user)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-2xl font-bold text-[#1a1c1c]">{session.user.name}</h3>
                    <p className="font-medium text-[#414755]">{session.user.email ?? 'No email available'}</p>
                    <div className="mt-3 flex w-fit items-center rounded-md bg-[#f3f3f3] px-3 py-1">
                      <span
                        className="material-symbols-outlined mr-2 text-sm text-[#0058bc]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified_user
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#414755]">
                        Signed in with {providerName}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/accounts"
                  className="rounded-xl bg-[#f3f3f3] px-4 py-2 text-sm font-semibold text-[#0058bc] transition-colors hover:bg-[#e8e8e8]"
                >
                  Manage Access
                </Link>
              </div>

              <div className="relative z-10 mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f9f9f9] px-4 py-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#717786]">Status</p>
                  <p className="text-lg font-bold text-[#0058bc]">Workspace Ready</p>
                </div>
                <div className="rounded-xl bg-[#f9f9f9] px-4 py-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#717786]">Primary Provider</p>
                  <p className="text-lg font-bold text-[#1a1c1c]">{providerName}</p>
                </div>
                <div className="rounded-xl bg-[#f9f9f9] px-4 py-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#717786]">Profile Updated</p>
                  <p className="text-lg font-bold text-[#1a1c1c]">{joinedDisplay}</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col rounded-xl bg-white p-8 md:col-span-4">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center text-[#0058bc]">
                  <span
                    className="material-symbols-outlined mr-2"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    gpp_good
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Security Summary</span>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                  Safe
                </span>
              </div>

              <div className="space-y-6">
                {securityRows.map((row) => (
                  <div key={row.title} className="flex items-start">
                    <span className="material-symbols-outlined mr-3 text-xl text-[#717786]">{row.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a1c1c]">{row.title}</p>
                      <p className="text-xs text-[#414755]">{row.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <Link
                  href="/security"
                  className="flex items-center text-sm font-bold text-[#0058bc] transition-transform hover:translate-x-1"
                >
                  View Permissions
                  <span className="material-symbols-outlined ml-1 text-sm">chevron_right</span>
                </Link>
              </div>
            </section>

            <section className="rounded-xl bg-[#f3f3f3] p-8 md:col-span-12">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h4 className="mb-1 text-xl font-bold text-[#1a1c1c]">Linked Accounts Summary</h4>
                  <p className="text-sm text-[#414755]">
                    Monitor which provider surfaces are currently ready and where SimieBot will request access on demand.
                  </p>
                </div>

                <Link
                  href="/accounts"
                  className="rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Manage Connected Accounts
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className={`flex items-center rounded-xl bg-white p-5 transition-shadow hover:shadow-sm ${
                      service.tone === 'pending' ? 'border border-dashed border-[#c1c6d7]/30' : ''
                    }`}
                  >
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9f9f9]">
                      <span
                        className={`material-symbols-outlined text-xl ${
                          service.name === 'GitHub'
                            ? 'text-slate-800'
                            : service.name === 'Google Workspace'
                              ? 'text-blue-500'
                              : service.name === 'Slack'
                                ? 'text-indigo-600'
                                : 'text-red-600'
                        }`}
                      >
                        {service.icon}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="leading-tight text-sm font-bold text-[#1a1c1c]">{service.name}</p>
                      <p
                        className={`text-[11px] font-bold uppercase tracking-tighter ${
                          service.tone === 'active' ? 'text-emerald-600' : 'text-[#717786]'
                        }`}
                      >
                        {service.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-[#f3f3f3] p-8 md:col-span-12">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-lg font-bold text-[#1a1c1c]">Permission Ledger</h4>
                <span className="text-xs font-medium text-[#717786]">Current policy snapshot</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {permissionCards.map((card) => (
                  <div key={card.title} className="flex items-center justify-between rounded-xl bg-white p-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-[#0058bc]/5">
                        <span className="material-symbols-outlined text-lg text-[#0058bc]">{card.icon}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-[#1a1c1c]">{card.title}</span>
                        <span className="block text-xs text-[#414755]">{card.body}</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0058bc]">
                      Protected
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="mt-20 flex flex-col items-center justify-between border-t-0 pt-8 opacity-50 md:flex-row">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-tight">SimieBot</span>
              <span className="text-[10px] font-medium uppercase tracking-widest">Connected workspace</span>
            </div>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link href="/security" className="text-[10px] font-bold uppercase tracking-wider">
                Permissions
              </Link>
              <Link href="/accounts" className="text-[10px] font-bold uppercase tracking-wider">
                Accounts
              </Link>
              <Link href="/history" className="text-[10px] font-bold uppercase tracking-wider">
                History
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </WorkspaceShell>
  );
}
