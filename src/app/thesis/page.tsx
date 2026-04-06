import Link from 'next/link';
import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

const researchModes = [
  {
    title: 'Document grounding',
    body: 'Upload PDF and DOCX files in chat so SimieBot can read and use their text in the conversation.',
  },
  {
    title: 'Web-backed research',
    body: 'Use web search when you need current facts or supporting references during a research thread.',
  },
  {
    title: 'Thread continuity',
    body: 'Save and reopen research conversations from history when you want to continue later.',
  },
];

export default async function ThesisPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-[#f9f9f9] pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#1a1c1c]">Research Workspace.</h2>
            <p className="max-w-3xl text-[#414755]">
              SimieBot&apos;s research mode is grounded in uploaded documents, web search, and persistent thread history
              rather than a separate fictional analysis engine.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="rounded-xl bg-white p-8 md:col-span-8">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">summarize</span>
                <span className="text-sm font-bold uppercase tracking-widest">Research workflow</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {researchModes.map((mode) => (
                  <div key={mode.title} className="rounded-xl bg-[#f9f9f9] p-5">
                    <p className="mb-2 text-sm font-bold text-[#1a1c1c]">{mode.title}</p>
                    <p className="text-xs leading-relaxed text-[#414755]">{mode.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-[#f3f3f3] p-6">
                <h3 className="text-lg font-bold text-[#1a1c1c]">How to use it</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#414755]">
                  Open chat, upload a PDF or DOCX, then ask SimieBot to summarize, compare, or extract key points. Use
                  web search when the topic depends on current information.
                </p>
              </div>
            </section>

            <section className="rounded-xl bg-white p-8 md:col-span-4">
              <div className="mb-6 flex items-center text-[#0058bc]">
                <span className="material-symbols-outlined mr-2">find_in_page</span>
                <span className="text-sm font-bold uppercase tracking-widest">Available inputs</span>
              </div>

              <div className="space-y-4">
                {[
                  'PDF documents',
                  'DOCX documents',
                  'Image attachments',
                  'Web search results',
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-[#f9f9f9] p-4 text-sm font-medium text-[#1a1c1c]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/comm"
                  className="block rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Open chat workspace
                </Link>
                <Link
                  href="/history"
                  className="block rounded-xl bg-[#f3f3f3] px-5 py-3 text-center text-sm font-semibold text-[#0058bc]"
                >
                  Review saved research threads
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
