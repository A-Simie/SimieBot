import { redirect } from 'next/navigation';

import { HistoryThreadList } from '@/components/history-thread-list';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { auth0 } from '@/lib/auth0';

export default async function HistoryPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <WorkspaceShell>
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <HistoryThreadList userId={session.user.sub} />
      </div>
    </WorkspaceShell>
  );
}
