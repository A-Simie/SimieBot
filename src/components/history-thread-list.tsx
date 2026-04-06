'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Search, Sparkles, Trash2 } from 'lucide-react';

import { deleteChatThread, getChatThreads, type ChatThread } from '@/lib/supabase';
import { cn } from '@/utils/cn';

type HistoryGroup = {
  label: string;
  threads: ChatThread[];
};

function getGroupLabel(dateString: string) {
  const updatedAt = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (updatedAt >= startOfToday) {
    return 'Today';
  }

  if (updatedAt >= startOfYesterday) {
    return 'Yesterday';
  }

  if (updatedAt.getFullYear() === now.getFullYear() && updatedAt.getMonth() === now.getMonth()) {
    return 'Earlier this month';
  }

  return updatedAt.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}

function getThreadPreview(title: string) {
  return `Continue the thread "${title || 'Untitled Conversation'}" in chat.`;
}

function getThreadIcon(title: string) {
  const lowered = title.toLowerCase();

  if (lowered.includes('github') || lowered.includes('repo') || lowered.includes('issue')) {
    return 'code';
  }

  if (lowered.includes('video') || lowered.includes('youtube') || lowered.includes('creator')) {
    return 'movie';
  }

  if (lowered.includes('mail') || lowered.includes('gmail')) {
    return 'mail';
  }

  if (lowered.includes('calendar')) {
    return 'calendar_month';
  }

  if (lowered.includes('summary') || lowered.includes('analysis')) {
    return 'summarize';
  }

  return 'chat_bubble';
}

function formatDateMeta(dateString: string) {
  const updatedAt = new Date(dateString);
  return updatedAt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryThreadList({ userId }: { userId?: string }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get('threadId');

  useEffect(() => {
    let active = true;

    async function loadThreads() {
      if (!userId) {
        setThreads([]);
        setLoading(false);
        return;
      }

      const data = await getChatThreads(userId);
      if (!active) return;
      setThreads(data);
      setLoading(false);
    }

    void loadThreads();

    return () => {
      active = false;
    };
  }, [userId]);

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return threads;

    return threads.filter((thread) => thread.title.toLowerCase().includes(normalized));
  }, [query, threads]);

  const groupedThreads = useMemo<HistoryGroup[]>(() => {
    const order: string[] = [];
    const groups = new Map<string, ChatThread[]>();

    for (const thread of filteredThreads) {
      const label = getGroupLabel(thread.updated_at);
      if (!groups.has(label)) {
        groups.set(label, []);
        order.push(label);
      }
      groups.get(label)!.push(thread);
    }

    return order.map((label) => ({ label, threads: groups.get(label) ?? [] }));
  }, [filteredThreads]);

  const handleDelete = async (threadId: string) => {
    setDeletingId(threadId);
    const success = await deleteChatThread(threadId);
    if (success) {
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    }
    setDeletingId(null);
  };

  if (!userId) {
    return (
      <div className="rounded-[1rem] border border-[#ececec] bg-white p-6 text-sm text-[#717786] shadow-sm">
        Sign in to view your saved conversations.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1c1c]">Conversation History</h2>
          <p className="mt-1 text-sm text-[#717786]">
            Review past sessions, search saved thread titles, and reopen anything in the live chat workspace.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717786]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search threads..."
            className="w-full rounded-xl border border-transparent bg-[#f3f3f3] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#dbe7ff] focus:ring-2 focus:ring-[#0058bc]/10"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      ) : groupedThreads.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto mb-4 h-8 w-8 text-[#c1c6d7]" />
          <p className="text-sm font-medium text-[#414755]">
            {query ? 'No saved threads match that search.' : 'No saved conversations yet.'}
          </p>
          <p className="mt-2 text-sm text-[#717786]">
            {query ? 'Try a different keyword.' : 'Start a chat and SimieBot will keep your thread history here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedThreads.map((group) => (
            <section key={group.label} className="space-y-3">
              <div className="px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#717786]">{group.label}</p>
              </div>

              <div className="space-y-3">
                {group.threads.map((thread) => {
                  const isActive = activeThreadId === thread.id;
                  const title = thread.title || 'Untitled Conversation';

                  return (
                    <div
                      key={thread.id}
                      className={cn(
                        'group relative flex items-center gap-4 rounded-xl p-4 transition-all',
                        isActive
                          ? 'border border-[#dbe7ff] bg-white shadow-[0_4px_12px_rgba(0,88,188,0.04)]'
                          : 'hover:bg-[#f3f3f3]',
                      )}
                    >
                      <Link href={`/comm?threadId=${thread.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            isActive ? 'bg-[#eef4ff] text-[#0058bc]' : 'bg-[#e2e2e2] text-[#717786]',
                          )}
                        >
                          <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                            {getThreadIcon(title)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold text-[#1a1c1c]">{title}</h3>
                            {isActive ? (
                              <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-medium uppercase tracking-tight text-[#0058bc]">
                                Active now
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[#717786]">{formatDateMeta(thread.updated_at)}</span>
                            )}
                          </div>
                          <p className="truncate text-xs text-[#414755]">{getThreadPreview(title)}</p>
                          <p className="mt-1 text-[10px] text-[#717786]">Updated {formatDateMeta(thread.updated_at)}</p>
                        </div>
                      </Link>

                      <div className={cn('shrink-0 transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                        <button
                          type="button"
                          onClick={() => void handleDelete(thread.id)}
                          disabled={deletingId === thread.id}
                          className="rounded-lg p-2 text-[#ba1a1a] transition-colors hover:bg-[#ffdad6]/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {isActive ? <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#0058bc]" /> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="hidden md:block">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/40 bg-[#f3f3f3]/80 p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#4e5e6c]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#414755]">Saved Threads</span>
              </div>
              <div className="h-4 w-px bg-[#c1c6d7]/50" />
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#4e5e6c]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#414755]">
                  {threads.length} recorded
                </span>
              </div>
            </div>

            <p className="text-[11px] italic text-[#717786]">
              Saved thread titles stay available here so you can reopen past conversations quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
