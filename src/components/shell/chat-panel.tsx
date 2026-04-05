'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useQueryState } from 'nuqs';
import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { TokenVaultInterruptHandler } from '@/components/TokenVaultInterruptHandler';

function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col w-full pb-4 space-y-4">
      {messages.map((m) => (
        <ChatMessageBubble key={m.id} message={m} aiEmoji="🤖" allMessages={messages} />
      ))}
    </div>
  );
}

function StickyContent({ content, footer }: { content: React.ReactNode; footer: React.ReactNode }) {
  const context = useStickToBottomContext();
  return (
    <div ref={context.scrollRef} style={{ width: '100%', height: '100%' }} className="grid grid-rows-[1fr,auto]">
      <div ref={context.contentRef}>{content}</div>
      {footer}
    </div>
  );
}

interface ChatPanelProps {
  endpoint: string;
  userName?: string;
}

export function ChatPanel({ endpoint, userName }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useQueryState('threadId');
  const [input, setInput] = useState('');

  const chat = useStream({
    apiUrl: endpoint,
    assistantId: 'agent',
    threadId,
    onThreadId: setThreadId,
    onError: (e: any) => {
      console.error('Chat error:', e);
      toast.error('Error processing request', { description: e.message });
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
    <>
      {/* Floating Chat Toggle */}
      <button
        id="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-14 right-6 z-[60] w-12 h-12 rounded-full
          bg-gradient-to-br from-primary to-primary-container
          flex items-center justify-center
          shadow-glow-blue hover:shadow-[0_0_24px_rgba(134,173,255,0.6)]
          active:scale-95 transition-all duration-200
          ${isOpen ? 'rotate-45' : ''}
        `}
      >
        <span className="material-symbols-outlined text-on-primary text-xl">
          {isOpen ? 'close' : 'chat'}
        </span>
      </button>

      {/* Chat Panel Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Panel */}
      <div
        id="chat-panel"
        className={`
          fixed top-12 right-0 z-[56] h-[calc(100vh-5.5rem)]
          w-full max-w-[480px]
          bg-surface-container-low/95 backdrop-blur-2xl
          border-l border-white/5
          shadow-neo-strong
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Panel Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container-high neo-extrusion flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold text-on-surface">SimieBot Intelligence</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-dim animate-pulse" />
                <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">
                  Neural Link Active
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <StickToBottom>
            <StickyContent
              content={
                <div className="px-4 py-4">
                  {chat.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
                          auto_awesome
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm">
                        {userName ? `Hello ${userName}, how can I assist?` : 'How can I assist you?'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <ChatMessages messages={chat.messages} />
                      <TokenVaultInterruptHandler
                        interrupt={chat.interrupt}
                        onFinish={resumeInterruptedRun}
                      />
                    </>
                  )}
                </div>
              }
              footer={
                <div className="px-4 pb-4 pt-2">
                  {/* Suggestion Pills */}
                  <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                    {['Check email', 'Plan YouTube publish', 'What is on my calendar?'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                        }}
                        className="px-3 py-1.5 bg-surface-container-high neo-extrusion rounded-full text-[10px] font-bold text-primary border-t border-white/10 hover:scale-105 transition-transform whitespace-nowrap"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage}>
                    <div className="flex items-center gap-3 bg-surface-container-low neo-intrusion rounded-full p-2 pr-3 border border-white/5">
                      <button type="button" className="p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                      </button>
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message to SimieBot..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50"
                        autoFocus
                      />
                      <div className="flex gap-2 items-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-lg cursor-pointer hover:text-primary transition-colors">
                          mic
                        </span>
                        <button
                          type="submit"
                          disabled={chat.isLoading}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-glow-blue active:scale-95 transition-all disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {chat.isLoading ? 'hourglass_top' : 'send'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              }
            />
          </StickToBottom>
        </div>
      </div>
    </>
  );
}
