import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const mediaSteps = [
  { title: 'Source selection', body: 'Choose a Drive asset from chat before staging it into the creator workflow.' },
  { title: 'Nova planning', body: 'Generate a structured edit plan from the staged source video.' },
  { title: 'FFmpeg render', body: 'Render the planned output with validated timings and progress reporting.' },
  { title: 'YouTube publish', body: 'Publish only after approval when you explicitly choose to upload.' },
];

export default async function MediaPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Creator Media Workspace.</h2>
            <p className="max-w-3xl text-[#414755]">
              Media handling in SimieBot is orchestration-first. Use chat to select source assets, plan edits, render
              outputs, and move to YouTube publishing when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="rounded-xl bg-white p-8 md:col-span-7">
              <div className="rounded-xl bg-[#0f172a] p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>

                <div className="space-y-4">
                  <p className="font-mono text-sm text-slate-300">drive/latest_source_video.mp4</p>
                  <div className="h-1 w-3/4 rounded bg-slate-800" />
                  <div className="h-1 w-1/2 rounded bg-slate-800" />
                  <div className="mt-8 flex items-center justify-center gap-3 text-center">
                    {['Drive', 'Nova', 'FFmpeg', 'YouTube'].map((label, index) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
                          {label}
                        </div>
                        {index < 3 ? <span className="material-symbols-outlined text-[#86adff]">arrow_forward</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-8 md:col-span-5">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">movie</span>
                <span className="text-sm font-bold uppercase tracking-widest">Current path</span>
              </div>
              <div className="space-y-4">
                {mediaSteps.map((step) => (
                  <div key={step.title} className="rounded-xl bg-[#f9f9f9] p-4">
                    <p className="text-sm font-bold text-[#1a1c1c]">{step.title}</p>
                    <p className="mt-2 text-xs text-[#414755]">{step.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/creator"
                  className="block rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Open creator workflow
                </Link>
                <Link
                  href="/comm"
                  className="block rounded-xl bg-[#f3f3f3] px-5 py-3 text-center text-sm font-semibold text-[#0058bc]"
                >
                  Run from chat
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
