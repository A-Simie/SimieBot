'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { ArrowDown, ArrowUp, LoaderCircle } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';

import { TokenVaultInterruptHandler } from '@/components/TokenVaultInterruptHandler';
import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="mx-auto flex w-full max-w-full min-w-0 flex-col space-y-3 pb-6 sm:max-w-4xl sm:pb-12">
      {messages.map((m) => (
        <ChatMessageBubble key={m.id} message={m} allMessages={messages} />
      ))}
    </div>
  );
}

function ScrollToBottom({ className }: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <Button 
      variant="outline" 
      className={cn('rounded-full border border-white/10 bg-slate-950/80 text-primary shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all hover:bg-slate-900', className)} 
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4 mr-2" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Jump to latest</span>
    </Button>
  );
}

function ChatInput({
  onSubmit,
  value,
  onChange,
  loading,
  placeholder,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onSubmit(e);
      }}
      className="flex w-full flex-col px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 animate-fade-in-up sm:p-4"
    >
      <div className="mx-auto flex w-full max-w-full min-w-0 flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-slate-950/75 p-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:max-w-4xl sm:rounded-[1.75rem] sm:p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 sm:h-10 sm:w-10 sm:rounded-2xl">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
          <input
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="min-w-0 flex-1 bg-transparent border-none px-1 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/45 sm:py-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_0_24px_rgba(134,173,255,0.35)] transition-all active:scale-95 disabled:opacity-50 sm:h-11 sm:w-11 sm:rounded-2xl"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}

function StickyToBottomContent({
  content,
  footer,
}: {
  content: ReactNode;
  footer?: ReactNode;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: '100%', height: '100%' }}
      className="relative grid h-full min-h-[60dvh] min-w-0 grid-rows-[1fr,auto] sm:min-h-[72vh]"
    >
      <div ref={context.contentRef} className="h-full min-w-0 px-2 py-3 sm:px-6 sm:py-6">
        {content}
      </div>
      {footer}
    </div>
  );
}

export function ChatWindow({
  endpoint,
  emptyStateComponent,
  placeholder,
}: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  emoji?: string;
}) {
  const [threadId, setThreadId] = useQueryState('threadId');
  const [input, setInput] = useState('');
  const chat = useStream({
    apiUrl: endpoint,
    assistantId: 'agent',
    threadId,
    onThreadId: setThreadId,
    onError: (e: any) => {
      console.error('Chat error:', e);
      toast.error('Error processing neural uplink', { description: e.message });
    },
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading || !input.trim()) return;
    chat.submit(
      { messages: [{ type: 'human', content: input }] },
      {
        optimisticValues: (prev) => ({
          messages: [...((prev?.messages as []) ?? []), { type: 'human', content: input, id: 'temp' }],
        }),
      },
    );
    setInput('');
  }

  function resumeInterruptedRun() {
    chat.submit(null, {
      multitaskStrategy: 'enqueue',
    });
  }

  return (
    <div className="relative h-full min-h-[60dvh] min-w-0 overflow-hidden bg-transparent sm:min-h-[72vh]">
      <StickToBottom>
        <StickyToBottomContent
          content={
            chat.messages.length === 0 ? (
              <div className="h-full flex flex-col">{emptyStateComponent}</div>
            ) : (
              <>
                <ChatMessages messages={chat.messages} />
                <div className="mx-auto w-full max-w-full min-w-0 pb-6 sm:max-w-4xl sm:pb-10">
                  <TokenVaultInterruptHandler interrupt={chat.interrupt} onFinish={resumeInterruptedRun} />
                </div>
              </>
            )
          }
          footer={
            <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#0b1016] via-[#0b1016]/96 to-transparent pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-3 sm:pb-6 sm:pt-6">
              <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />

              <div className="mx-auto mb-3 flex max-w-full min-w-0 flex-wrap gap-2 px-2 pb-1 sm:mb-4 sm:max-w-4xl sm:flex-nowrap sm:overflow-x-auto sm:px-6 no-scrollbar">
                {['Find my latest unread email', 'What is on my calendar today?', 'Summarize my profile', 'Plan a Drive to YouTube workflow'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="max-w-full rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary transition-all hover:border-primary/30 hover:bg-white/[0.08] sm:whitespace-nowrap sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <ChatInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={sendMessage}
                loading={chat.isLoading}
                placeholder={placeholder ?? 'Ask SimieBot to help with Gmail, Calendar, or creator workflows...'}
              />
            </div>
          }
        />
      </StickToBottom>
    </div>
  );
}
