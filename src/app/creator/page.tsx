import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const steps = [
  { title: 'Drive source discovery', body: 'List recent Drive video assets and choose a source file.' },
  { title: 'Nova planning', body: 'Generate a structured edit plan from the staged source video.' },
  { title: 'FFmpeg rendering', body: 'Render the approved segment plan into a final output.' },
  { title: 'YouTube publish', body: 'Upload the final video with approval before publish continues.' },
];

export default async function CreatorPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1c1c]">Creator Workflow</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#717786]">
            This is the real creator path currently implemented in SimieBot: Drive to Nova to FFmpeg to YouTube,
            orchestrated from chat.
          </p>
        </div>

        <div className="rounded-[1.25rem] bg-[#0f172a] p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
          <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#adc6ff]">
            <span className="material-symbols-outlined">account_tree</span>
            Current creator path
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {['Drive', 'Nova', 'FFmpeg', 'YouTube'].map((label, index) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                <p className="mt-3 text-lg font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <div key={step.title} className="rounded-[1rem] border border-[#ececec] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1a1c1c]">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#414755]">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1rem] bg-[#f3f3f3] p-6">
          <h2 className="text-lg font-semibold text-[#1a1c1c]">Run it from chat</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#414755]">
            Ask SimieBot to list your recent Drive video assets, prepare a short vertical edit, or publish the final
            result to YouTube once you are ready.
          </p>
          <Link
            href="/comm"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,88,188,0.14)]"
          >
            Open creator chat
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
