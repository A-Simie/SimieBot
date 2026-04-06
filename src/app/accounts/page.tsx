import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

type ProviderKey = 'google' | 'github' | 'slack' | 'youtube';

function getPrimaryProvider(sub?: string | null): ProviderKey | null {
  const provider = sub?.split('|')[0];

  switch (provider) {
    case 'google-oauth2':
      return 'google';
    case 'github':
      return 'github';
    case 'sign-in-with-slack':
      return 'slack';
    default:
      return null;
  }
}

function getProviderState(provider: ProviderKey, primaryProvider: ProviderKey | null) {
  if (provider === 'youtube') {
    return primaryProvider === 'google'
      ? { label: 'Available via Google', tone: 'connected' as const }
      : { label: 'Needs Google access', tone: 'pending' as const };
  }

  if (provider === primaryProvider) {
    return { label: 'Connected', tone: 'connected' as const };
  }

  return { label: 'Connect on demand', tone: 'pending' as const };
}

const statusClasses = {
  connected: 'bg-[#667685]/10 text-[#414755]',
  pending: 'bg-[#e2e2e2]/50 text-[#414755]',
};

const accountCards: Array<{
  key: ProviderKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaLabel: string;
  href: string;
  primary?: boolean;
}> = [
  {
    key: 'google',
    title: 'Google',
    description:
      'Used for Gmail, Calendar, Drive, and YouTube-related access when those workflows are requested.',
    icon: <span className="material-symbols-outlined text-3xl text-blue-600">mail</span>,
    ctaLabel: 'Use Google tools in chat',
    href: '/comm',
  },
  {
    key: 'github',
    title: 'GitHub',
    description:
      'Used for repository listing, GitHub event review, and file modification flows when you request them.',
    icon: <span className="material-symbols-outlined text-3xl">terminal</span>,
    ctaLabel: 'Use GitHub tools in chat',
    href: '/comm',
  },
  {
    key: 'slack',
    title: 'Slack',
    description:
      'Used for channel discovery and Slack posting actions when SimieBot needs access to your workspace.',
    icon: <span className="material-symbols-outlined text-3xl">forum</span>,
    ctaLabel: 'Use Slack tools in chat',
    href: '/comm',
  },
  {
    key: 'youtube',
    title: 'YouTube',
    description:
      'Used for creator publishing flows. In the current app, YouTube access is requested through Google authorization.',
    icon: <span className="material-symbols-outlined text-3xl text-red-600">play_circle</span>,
    ctaLabel: 'Open creator workflow',
    href: '/creator',
  },
];

const trustRows = [
  {
    title: 'Provider boundaries',
    body: 'Each provider is requested through its own connected-account scopes. Google access does not imply GitHub or Slack access.',
  },
  {
    title: 'Approval gates',
    body: 'Sensitive write and publish actions still require approval before SimieBot continues.',
  },
  {
    title: 'Add providers later',
    body: 'Starting with one sign-in method does not block using other providers later when you trigger those workflows.',
  },
];

export default async function AccountsPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const primaryProvider = getPrimaryProvider(session.user.sub);

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] px-6 pb-24 pt-20 md:px-12 md:pt-12 lg:px-16">
        <div className="mx-auto mb-12 max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-[#1a1c1c]">Connected Accounts</h2>
              <p className="max-w-2xl text-lg text-[#414755]">
                Add more providers to expand SimieBot&apos;s reach across your workflow. Access is requested through
                real provider-specific authorization, not shared blanket permissions.
              </p>
            </div>

            <Link
              href="/comm"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0058bc]/10 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add More Providers
            </Link>
          </div>
        </div>

        <div className="mx-auto mb-8 max-w-6xl">
          <div className="flex items-start gap-4 rounded-xl border border-[#c1c6d7]/10 bg-[#f3f3f3] p-4">
            <span className="material-symbols-outlined mt-0.5 text-[#0058bc]">info</span>
            <p className="text-sm leading-relaxed text-[#414755]">
              Connecting multiple providers allows SimieBot to work across more of your real workflow.{' '}
              <span className="font-semibold text-[#1a1c1c]">
                Signing in with one provider doesn&apos;t limit adding others.
              </span>{' '}
              Additional provider access is requested when you use the related feature.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {accountCards.map((card) => {
            const state = getProviderState(card.key, primaryProvider);

            return (
              <div
                key={card.key}
                className="flex h-full flex-col rounded-xl border border-transparent bg-white p-6 transition-all duration-300 hover:border-[#c1c6d7]/20 hover:shadow-2xl hover:shadow-[#0058bc]/5"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f3f3]">
                    {card.icon}
                  </div>

                  <div className={`flex items-center gap-2 rounded-md px-3 py-1 ${statusClasses[state.tone]}`}>
                    <span className={`h-2 w-2 rounded-full ${state.tone === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{state.label}</span>
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold">{card.title}</h3>
                <p className="mb-8 flex-1 text-sm text-[#414755]">{card.description}</p>

                <Link
                  href={card.href}
                  className={`w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                    state.tone === 'connected'
                      ? 'bg-[#f3f3f3] text-[#0058bc] hover:bg-[#e8e8e8]'
                      : 'bg-[#0058bc] text-white hover:bg-[#0070eb]'
                  }`}
                >
                  {card.ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#414755]">Privacy &amp; Trust Ledger</h4>

          <div className="overflow-hidden rounded-xl bg-[#f3f3f3]">
            <div className="grid grid-cols-1 divide-y divide-[#c1c6d7]/20 md:grid-cols-3 md:divide-x md:divide-y-0">
              {trustRows.map((row) => (
                <div key={row.title} className="p-6">
                  <span className="mb-2 block text-[10px] font-bold uppercase text-[#414755]">{row.title}</span>
                  <p className="text-sm leading-relaxed text-[#1a1c1c]">{row.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
