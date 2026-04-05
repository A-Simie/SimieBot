'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { ArrowDown, LoaderCircle } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';

import { TokenVaultInterruptHandler } from '@/components/TokenVaultInterruptHandler';
import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col max-w-[768px] mx-auto pb-12 w-full space-y-2">
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
      className={cn('shadow-glow-blue bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all rounded-full', className)} 
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4 mr-2" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Neural Sync</span>
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
      className="flex w-full flex-col p-4 animate-fade-in-up"
    >
      <div className="bg-surface-container-low/80 backdrop-blur-xl neo-intrusion border border-white/5 rounded-[2rem] flex flex-col gap-2 max-w-[768px] w-full mx-auto p-2 pr-3 shadow-neo-strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high neo-extrusion border border-white/5 flex items-center justify-center shrink-0 ml-1">
            <span className="material-symbols-outlined text-primary text-sm">attachment</span>
          </div>
          <input
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="flex-1 bg-transparent border-none outline-none p-4 text-on-surface placeholder:text-on-surface-variant/40 font-body text-sm"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-lg">mic</span>
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-glow-blue active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-xl">send</span>
              )}
            </button>
          </div>
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
      className="grid grid-rows-[1fr,auto] relative"
    >
      <div ref={context.contentRef} className="py-8 px-4 h-full">
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
    <div className="h-full relative overflow-hidden bg-background">
      <StickToBottom>
        <StickyToBottomContent
          content={
            chat.messages.length === 0 ? (
              <div className="h-full flex flex-col">{emptyStateComponent}</div>
            ) : (
              <>
                <ChatMessages messages={chat.messages} />
                <div className="max-w-[768px] mx-auto pb-12 w-full">
                  <TokenVaultInterruptHandler interrupt={chat.interrupt} onFinish={resumeInterruptedRun} />
                </div>
              </>
            )
          }
          footer={
            <div className="sticky bottom-0 pb-8 px-4 w-full">
              <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />
              
              {/* Suggestion Pills */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar max-w-[768px] mx-auto">
                {['Find my latest unread email', 'Check today on my calendar', 'Plan a YouTube publish flow', 'Summarize my profile'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="px-3 py-1.5 bg-surface-container-high/50 neo-extrusion border border-white/5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest hover:scale-105 transition-transform"
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
                placeholder={placeholder ?? 'Neural prompt input...'}
              />
            </div>
          }
        />
      </StickToBottom>
    </div>
  );
}
