import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { ChatWindow } from '@/components/chat-window';

export default async function HubPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const user = session.user;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0e14]">
      <ChatWindow
        endpoint={`${process.env.APP_BASE_URL}/api/chat`}
        user={user}
      />
    </div>
  );
}
