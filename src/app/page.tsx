import Link from 'next/link';

import { auth0 } from '@/lib/auth0';

const providerCards = [
  { icon: 'mail', label: 'Google', accent: 'text-blue-600' },
  { icon: 'code', label: 'GitHub', accent: 'text-slate-900' },
  { icon: 'forum', label: 'Slack', accent: 'text-violet-600' },
  { icon: 'smart_display', label: 'YouTube', accent: 'text-red-600' },
];

const workflowSteps = [
  {
    icon: 'link',
    title: '1. Link your accounts',
    body: 'Start with Google, GitHub, or Slack and connect the others later from your account workspace.',
  },
  {
    icon: 'chat_bubble',
    title: '2. Work through chat',
    body: 'Ask SimieBot to read email, check Calendar, search GitHub activity, draft messages, or prepare creator tasks in plain English.',
  },
  {
    icon: 'verified',
    title: '3. Approve sensitive actions',
    body: 'Write and publish actions stay behind explicit approval so you remain the final authority before anything changes externally.',
    emphasized: true,
  },
];

const creatorBullets = [
  'Drive-sourced creator workflows',
  'Amazon Nova planning on staged source video',
  'FFmpeg rendering before YouTube publishing',
];

const approvalRows = [
  {
    icon: 'send',
    title: 'Send Gmail message',
    body: 'Approval required before email is sent',
    accent: 'bg-blue-50 text-blue-700',
  },
  {
    icon: 'edit_note',
    title: 'Write Google Drive file',
    body: 'Approval required before Drive content changes',
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    icon: 'code',
    title: 'Modify GitHub file',
    body: 'Approval required before repo content is updated',
    accent: 'bg-slate-100 text-slate-700',
  },
  {
    icon: 'smart_display',
    title: 'Publish YouTube video',
    body: 'Approval required before publish completes',
    accent: 'bg-red-50 text-red-700',
  },
];

export default async function LandingPage() {
  const session = await auth0.getSession();
  const primaryHref = session ? '/comm' : '/signin';
  const primaryLabel = session ? 'Open Workspace' : 'Get Started';

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#f9f9f9] text-[#1a1c1c]">
      <main className="pt-14">
        <section className="relative overflow-hidden px-6 pb-28 pt-24">
          <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(0,112,235,0.18),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f9f9f9_72%)]" />

          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-3 py-1 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#0058bc]">verified_user</span>
              <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#414755]">
                Approval-aware connected accounts
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-[#1a1c1c] md:text-7xl">
              SimieBot: the secure
              <br />
              connected-account assistant.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-[#414755]">
              Work across Gmail, Calendar, Drive, GitHub, Slack, and creator workflows with clear account boundaries
              and explicit approval for sensitive actions.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-8 py-4 text-base font-bold text-white shadow-[0_18px_50px_rgba(0,88,188,0.24)] transition-transform duration-200 hover:-translate-y-0.5 md:w-auto"
              >
                <span className="material-symbols-outlined">terminal</span>
                {primaryLabel}
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#eeeeee] px-8 py-4 text-base font-bold text-[#0058bc] transition-colors hover:bg-[#e8e8e8] md:w-auto"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-4xl">
            <div className="grid grid-cols-2 gap-6 rounded-[1.25rem] border border-[#e8e8e8] bg-[#f3f3f3] p-8 shadow-sm md:grid-cols-4">
              {providerCards.map((provider) => (
                <div
                  key={provider.label}
                  className="flex flex-col items-center justify-center gap-3 rounded-[1rem] border border-[#f1f1f1] bg-white p-6 shadow-sm"
                >
                  <span className={`material-symbols-outlined text-4xl ${provider.accent}`}>{provider.icon}</span>
                  <span className="text-sm font-bold text-[#414755]">{provider.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#f3f3f3] px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="mb-2 text-3xl font-black tracking-tight text-[#1a1c1c]">How it works</h2>
              <p className="font-medium text-[#414755]">A simple operating model for secure cross-account work.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.title}
                  className={`flex h-full flex-col rounded-[1.25rem] bg-white p-8 shadow-sm ${
                    step.emphasized ? 'border-2 border-[#dbe7ff]' : 'border border-[#ececec]'
                  }`}
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4ff]">
                    <span className="material-symbols-outlined text-[#0058bc]">{step.icon}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-[#1a1c1c]">{step.title}</h3>
                  <p className="leading-relaxed text-[#414755]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="creator-workflow" className="px-6 py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-[#0f172a] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>

                <div className="space-y-4 text-sm text-slate-400">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="material-symbols-outlined text-xs">folder_open</span>
                    drive/latest_source_video.mp4
                  </div>
                  <div className="h-1 w-3/4 rounded bg-slate-800" />
                  <div className="h-1 w-1/2 rounded bg-slate-800" />

                  <div className="mt-10 flex items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-200">
                      Drive
                    </div>
                    <span className="material-symbols-outlined text-[#86adff]">arrow_forward</span>
                    <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-200">
                      Nova
                    </div>
                    <span className="material-symbols-outlined text-[#86adff]">arrow_forward</span>
                    <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-200">
                      FFmpeg
                    </div>
                    <span className="material-symbols-outlined text-[#86adff]">arrow_forward</span>
                    <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-200">
                      YouTube
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <div className="rounded-full bg-[#0058bc] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
                      Ready for approval
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(134,173,255,0.22),transparent_32%)]" />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className="mb-4 block text-sm font-bold uppercase tracking-[0.2em] text-[#0058bc]">
                Source to output
              </span>
              <h2 className="mb-6 text-4xl font-black tracking-tight text-[#1a1c1c]">
                Streamline the creator workflow you actually have
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[#414755]">
                SimieBot can discover video from Drive, plan edits with Amazon Nova, render with FFmpeg, and prepare
                a YouTube publish step inside one conversational thread.
              </p>

              <ul className="space-y-4">
                {creatorBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0058bc]">check_circle</span>
                    <span className="font-medium text-[#1a1c1c]">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="approval-model" className="border-y border-[#e8e8e8] bg-white px-6 py-24">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-[#1a1c1c]">
              Sensitive actions require your approval. Always.
            </h2>
            <p className="font-medium text-[#414755]">
              SimieBot can read and prepare work, but high-stakes changes stay behind explicit approval before anything
              is sent, modified, or published.
            </p>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.25rem] border border-[#e8e8e8] bg-[#f3f3f3] shadow-sm">
            <div className="flex items-center justify-between bg-[#e8e8e8] p-6">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#414755]">Approval model</span>
              <span className="material-symbols-outlined text-[#0058bc]">security</span>
            </div>

            <div className="divide-y divide-[#e2e2e2]">
              {approvalRows.map((row) => (
                <div key={row.title} className="flex items-center justify-between bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${row.accent}`}>
                      <span className="material-symbols-outlined">{row.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1a1c1c]">{row.title}</h4>
                      <p className="text-xs text-[#414755]">{row.body}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0058bc]">
                    Approval required
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#eef4ff] p-4 text-center">
              <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#4e5e6c]">
                <span className="material-symbols-outlined text-xs">lock</span>
                Connected-account access with explicit approval boundaries
              </p>
            </div>
          </div>
        </section>

        <footer className="bg-[#f9f9f9] px-6 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">SimieBot</span>
              <span className="text-xs font-medium text-[#414755]">Secure connected-account assistant</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <Link className="text-sm font-medium text-[#414755] transition-colors hover:text-[#0058bc]" href={primaryHref}>
                Chat
              </Link>
              <Link className="text-sm font-medium text-[#414755] transition-colors hover:text-[#0058bc]" href="#how-it-works">
                How it works
              </Link>
              <Link className="text-sm font-medium text-[#414755] transition-colors hover:text-[#0058bc]" href="#creator-workflow">
                Creator workflow
              </Link>
              <Link className="text-sm font-medium text-[#414755] transition-colors hover:text-[#0058bc]" href="#approval-model">
                Approval model
              </Link>
            </div>

            <div className="flex gap-4">
              <Link
                href={primaryHref}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f3f3] text-[#414755] transition-colors hover:bg-[#e8e8e8]"
              >
                <span className="material-symbols-outlined text-lg">terminal</span>
              </Link>
              <Link
                href="#approval-model"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f3f3] text-[#414755] transition-colors hover:bg-[#e8e8e8]"
              >
                <span className="material-symbols-outlined text-lg">security</span>
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
