'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  History, 
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { supabase, type ChatThread, getChatThreads, deleteChatThread } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface HistorySidebarProps {
  userId: string;
  currentThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function HistorySidebar({
  userId,
  currentThreadId,
  onThreadSelect,
  isOpen,
  setIsOpen
}: HistorySidebarProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadThreads() {
      if (!userId) return;
      const data = await getChatThreads(userId);
      setThreads(data);
      setLoading(false);
    }
    loadThreads();

    // Subscribe to changes in real-time
    const channel = supabase
      .channel('history-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads' },
        (payload) => {
          // Robust client-side filtering for IDs with special characters (like Auth0 pipes '|')
          const newUserId = (payload.new as any)?.user_id;
          const oldUserId = (payload.old as any)?.user_id;
          
          if (newUserId === userId || oldUserId === userId) {
            loadThreads();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }

    const success = await deleteChatThread(id);
    if (success) {
      setDeletingId(null);
      if (currentThreadId === id) {
        router.push('/hub');
      }
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleNewChat = () => {
    router.push('/hub');
    if (onThreadSelect) onThreadSelect('');
  };

  return (
    <>
      {/* Mobile Toggle */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-20 z-40 md:hidden bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl"
          onClick={() => setIsOpen(true)}
        >
          <PanelLeftOpen className="w-5 h-5 text-primary" />
        </Button>
      )}

      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-slate-950/90 backdrop-blur-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 h-[calc(100vh-3.5rem)]",
          !isOpen && "-translate-x-full md:hidden"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/5 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Chat History</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="md:hidden">
            <PanelLeftClose className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-2 shrink-0">
          <Button
            variant="ghost"
            asChild
            className="w-full flex items-center justify-start gap-3 rounded-xl hover:bg-white/5 text-on-surface-variant hover:text-on-surface font-bold transition-all py-5"
          >
            <Link href="/">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            onClick={handleNewChat}
            className="w-full flex items-center justify-start gap-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface font-bold transition-all py-5"
          >
            <Plus className="w-4 h-4 text-primary" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1 pb-4">
          {loading ? (
            <div className="flex flex-col gap-2 p-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-full bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-8 h-8 text-white/5 mx-auto mb-3" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant leading-relaxed">No conversations found.</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => router.push(`/hub?threadId=${thread.id}`)}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl p-3 transition-all hover:bg-white/5 cursor-pointer",
                  currentThreadId === thread.id ? "bg-white/10 border border-white/10 shadow-lg shadow-black/20" : "",
                  deletingId === thread.id ? "bg-red-500/5 border-red-500/20" : ""
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MessageSquare className={cn("w-4 h-4 shrink-0", currentThreadId === thread.id ? "text-primary" : "text-on-surface-variant")} />
                  <span className={cn(
                    "truncate text-sm font-medium transition-colors",
                    currentThreadId === thread.id ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"
                  )}>
                    {thread.title || 'Untitled Conversation'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {deletingId === thread.id ? (
                    <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                      <button
                        onClick={handleCancelDelete}
                        className="p-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-2"
                      >
                        No
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, thread.id)}
                        className="p-1 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors bg-red-500/10 rounded-lg px-2"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(e, thread.id)}
                      className="hidden shrink-0 group-hover:flex hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Synced</span>
          </div>
        </div>
      </aside>
    </>
  );
}
