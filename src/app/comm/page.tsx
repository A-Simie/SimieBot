import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { ChatWindow } from '@/components/chat-window';

export default async function CommPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const EmptyState = (
    <div className="flex flex-col items-center justify-center pt-20">
      <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary animate-pulse">hub</span>
      </div>
      <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Communication Hub</h2>
      <p className="text-on-surface-variant text-sm text-center max-w-md">
        Start a conversation with SimieBot. Ask it to work with Gmail, Calendar, profile context, or plan a Drive-to-YouTube creator flow.
      </p>
    </div>
  );

  return (
    <div className="h-full relative">
      <ChatWindow
        endpoint={`${process.env.APP_BASE_URL}/api/chat`}
        emoji="🤖"
        placeholder={`Hello ${session?.user?.name}, I'm SimieBot. How can I assist you?`}
        emptyStateComponent={EmptyState}
      />
    </div>
  );
}
