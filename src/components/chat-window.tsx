'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import {
  ArrowDown,
  ArrowUp,
  Calculator,
  Calendar as CalendarIcon,
  FileText,
  Github,
  Globe,
  Image as ImageIcon,
  Loader2,
  LoaderCircle,
  Mail,
  Plus,
  Search,
  Slack,
  Sliders,
  X,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';

import { TokenVaultInterruptHandler } from '@/components/TokenVaultInterruptHandler';
import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { CreatorLoading, ThesisLoading } from '@/components/generative-ui/node-status';
import { HistorySidebar } from '@/components/history-sidebar';
import { Button } from '@/components/ui/button';
import { upsertChatThread } from '@/lib/supabase';
import { cn } from '@/utils/cn';

const AVAILABLE_TOOLS = [
  { id: 'gmail', name: 'Gmail', icon: Mail, color: 'text-red-500' },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon, color: 'text-blue-500' },
  { id: 'drive', name: 'Drive', icon: Globe, color: 'text-sky-600' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-slate-700' },
  { id: 'slack', name: 'Slack', icon: Slack, color: 'text-purple-500' },
  { id: 'search', name: 'Search', icon: Search, color: 'text-cyan-600' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-slate-500' },
];

function ChatMessages({ messages, isLoading }: { messages: Message[]; isLoading: boolean }) {
  const lastMessage = messages[messages.length - 1];
  const lastHumanText =
    lastMessage?.type === 'human'
      ? typeof lastMessage.content === 'string'
        ? lastMessage.content
        : Array.isArray(lastMessage.content)
          ? lastMessage.content
              .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
              .join(' ')
          : ''
      : '';
  const lowered = lastHumanText.toLowerCase();
  const isResearching = isLoading && (lowered.includes('research') || lowered.includes('find') || lowered.includes('thesis'));
  const isCreatorFlow = isLoading && !isResearching && (lowered.includes('video') || lowered.includes('youtube') || lowered.includes('drive'));
  const isThinking = isLoading && !isResearching && !isCreatorFlow;

  return (
    <div className="mx-auto flex w-full max-w-full min-w-0 flex-col space-y-3 pb-6 sm:max-w-4xl sm:space-y-6 sm:pb-12">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} allMessages={messages} />
      ))}

      {isResearching && (
        <div className="px-4 py-2">
          <ThesisLoading />
        </div>
      )}

      {isCreatorFlow && (
        <div className="px-4 py-2">
          <CreatorLoading />
        </div>
      )}

      {isThinking && (
        <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.25rem] border border-[#dbe7ff] bg-white text-[#0058bc] shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div className="relative flex items-center gap-3 rounded-[1.75rem] rounded-tl-lg border border-[#ececec] bg-white px-5 py-4 text-xs font-bold uppercase tracking-widest text-[#717786] shadow-sm">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0058bc] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0058bc] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0058bc] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
}

function ScrollToBottom({ className }: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;

  return (
    <Button
      variant="outline"
      className={cn(
        'rounded-full border border-[#c1c6d7]/30 bg-white text-[#0058bc] shadow-[0_12px_30px_rgba(0,88,188,0.08)] transition-all hover:bg-[#f3f3f3]',
        className,
      )}
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
  onToolSelect,
  files,
  onFilesSelect,
  onFileRemove,
  parsingFiles,
  placeholder,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onToolSelect: (toolName: string) => void;
  files: File[];
  onFilesSelect: (files: FileList) => void;
  onFileRemove: (index: number) => void;
  parsingFiles: string[];
  placeholder?: string;
}) {
  const [showTools, setShowTools] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [fileFilter, setFileFilter] = useState('image/*,.pdf,.docx');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowMentions(value.endsWith('@'));
  }, [value]);

  const handleMentionClick = (toolName: string) => {
    onChange({ target: { value: value.slice(0, -1) + `@${toolName} ` } } as React.ChangeEvent<HTMLInputElement>);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2">
          {files.map((file, index) => {
            const isParsing = parsingFiles.includes(file.name);
            const stableKey = `${file.name}-${file.size}-${file.lastModified}`;
            return (
              <div
                key={stableKey}
                className={cn(
                  'group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all animate-in zoom-in duration-200',
                  isParsing
                    ? 'border-[#dbe7ff] bg-[#eef4ff]'
                    : 'border-[#c1c6d7]/20 bg-white shadow-sm hover:border-[#dbe7ff]',
                )}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-3.5 w-3.5 text-[#0058bc]" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-[#4e5e6c]" />
                  )}
                  {isParsing && <Loader2 className="ml-0.5 h-3 w-3 animate-spin text-[#0058bc]" />}
                </div>
                <span className="max-w-[120px] truncate text-[10px] font-bold uppercase leading-none tracking-widest text-[#414755]">
                  {file.name}
                </span>
                {!isParsing && (
                  <button
                    type="button"
                    onClick={() => onFileRemove(index)}
                    className="w-4 h-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-1 shadow-sm shrink-0"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showMentions && (
        <div className="absolute bottom-full left-4 z-20 mb-4 w-64 animate-in slide-in-from-bottom-2 rounded-2xl border border-[#c1c6d7]/30 bg-white p-2 shadow-[0_18px_40px_rgba(0,88,188,0.08)]">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#717786]">Select Tool</p>
          <div className="space-y-1">
            {AVAILABLE_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleMentionClick(tool.name)}
                className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#f3f3f3]"
              >
                <tool.icon className={cn('w-4 h-4', tool.color)} />
                <span className="text-sm font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showAddMenu && (
        <div className="absolute bottom-full left-4 z-20 mb-4 flex w-48 animate-in slide-in-from-bottom-2 flex-col rounded-2xl border border-[#c1c6d7]/30 bg-white p-2 shadow-[0_18px_40px_rgba(0,88,188,0.08)]">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#717786]">Add Context</p>
          <button
            type="button"
            onClick={() => {
              setFileFilter('.pdf,.docx');
              setShowAddMenu(false);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f3f3f3]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f3f3] transition-colors group-hover:bg-[#eef4ff]">
              <FileText className="h-4 w-4 text-[#4e5e6c]" />
            </div>
            <span className="text-xs font-bold text-[#1a1c1c]">PDF or Docs</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFileFilter('image/*');
              setShowAddMenu(false);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f3f3f3]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f3f3] transition-colors group-hover:bg-[#eef4ff]">
              <ImageIcon className="h-4 w-4 text-[#0058bc]" />
            </div>
            <span className="text-xs font-bold text-[#1a1c1c]">Media (Image)</span>
          </button>
        </div>
      )}

      {showTools && (
        <div className="absolute bottom-full left-4 z-20 mb-4 grid w-[calc(100%-2rem)] animate-in slide-in-from-bottom-4 grid-cols-2 gap-2 rounded-3xl border border-[#c1c6d7]/30 bg-white p-4 shadow-[0_18px_40px_rgba(0,88,188,0.08)] sm:w-[480px] sm:grid-cols-4">
          {AVAILABLE_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                onToolSelect(tool.name);
                setShowTools(false);
              }}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-[#f3f3f3]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-[#f3f3f3] transition-all group-hover:border-[#dbe7ff] group-hover:bg-[#eef4ff]">
                <tool.icon className={cn('w-5 h-5', tool.color)} />
              </div>
              <span className="text-[10px] font-bold text-[#717786] group-hover:text-[#1a1c1c]">{tool.name}</span>
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="relative flex w-full items-center gap-2 rounded-[1rem] border border-[#c1c6d7]/20 bg-white p-2 shadow-[0_10px_30px_rgba(0,88,188,0.06)] transition-all"
      >
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept={fileFilter}
            onChange={(e) => e.target.files && onFilesSelect(e.target.files)}
          />
          <button
            type="button"
            onClick={() => setShowAddMenu((prev) => !prev)}
            title="Add Context"
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all active:scale-95',
              showAddMenu
                ? 'bg-[#eef4ff] text-[#0058bc]'
                : 'bg-[#f3f3f3] text-[#717786] hover:bg-[#eeeeee] hover:text-[#1a1c1c]',
            )}
          >
            {showAddMenu ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowTools((prev) => !prev)}
            className={cn(
              'flex h-11 px-4 shrink-0 items-center justify-center gap-2 rounded-2xl transition-all active:scale-95',
              showTools
                ? 'border border-[#dbe7ff] bg-[#eef4ff] text-[#0058bc]'
                : 'border border-transparent bg-[#f3f3f3] text-[#717786] hover:bg-[#eeeeee] hover:text-[#1a1c1c]',
            )}
          >
            {showTools ? <X className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Tools</span>
          </button>
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={files.length > 0 ? 'Add a message about your files...' : placeholder ?? "Upload images, PDF, DOCX or use '@'..."}
          className="min-w-0 flex-1 border-none bg-transparent px-2 py-3 text-sm text-[#1a1c1c] outline-none placeholder:text-[#717786]"
        />

        <button
          type="submit"
          disabled={loading || parsingFiles.length > 0 || (!value.trim() && files.length === 0)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#0070eb] text-white shadow-[0_10px_24px_rgba(0,88,188,0.18)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {loading || parsingFiles.length > 0 ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}

function StickyToBottomContent({ content, footer }: { content: ReactNode; footer?: ReactNode }) {
  const context = useStickToBottomContext();

  return (
    <div ref={context.scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar min-w-0 w-full">
      <div ref={context.contentRef} className="min-h-full w-full min-w-0">
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
  user,
  showHistorySidebar = true,
}: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  user?: { sub?: string; name?: string; email?: string } | null;
  showHistorySidebar?: boolean;
}) {
  const [threadId, setThreadId] = useQueryState('threadId');
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [parsingFiles, setParsingFiles] = useState<string[]>([]);
  const initializedRef = useRef<string | null>(null);

  const chat = useStream({
    apiUrl: endpoint,
    assistantId: 'agent',
    threadId: threadId || undefined,
    onThreadId: setThreadId,
    onError: (error: any) => {
      console.error('[Stream Error]', error);
      toast.error('AI Stream Error', { description: error.message || 'The connection was interrupted.' });
    },
  });

  const extractThreadTitle = (content: unknown): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const textPart = content.find((part: any) => part?.type === 'text');
      if (textPart?.text) {
        const cleanText = textPart.text.includes('---DOC_CONTEXT_END---')
          ? textPart.text.split('---DOC_CONTEXT_END---').pop()?.trim()
          : textPart.text;
        return cleanText || 'New Chat';
      }
    }
    return 'New Chat';
  };

  useEffect(() => {
    if (threadId && user?.sub && chat.messages.length > 0 && threadId !== initializedRef.current) {
      initializedRef.current = threadId;
      const firstContent = chat.messages[0]?.content;
      const title = extractThreadTitle(firstContent);

      void upsertChatThread({
        id: threadId,
        user_id: user.sub,
        title: title.slice(0, 60),
        updated_at: new Date().toISOString(),
      });
    }
  }, [chat.messages, threadId, user?.sub]);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading || parsingFiles.length > 0 || (!input.trim() && attachedFiles.length === 0)) return;

    const currentInput = input;
    const currentFiles = [...attachedFiles];

    try {
      const contentBlocks: any[] = [{ type: 'text', text: currentInput }];

      for (const file of currentFiles) {
        if (file.type.startsWith('image/')) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          contentBlocks.push({
            type: 'image_url',
            image_url: { url: base64 },
          });
          continue;
        }

        if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
          setParsingFiles((prev) => [...prev, file.name]);
          const formData = new FormData();
          formData.append('file', file);

          try {
            const parseRes = await fetch('/api/parse-document', {
              method: 'POST',
              body: formData,
            });

            if (!parseRes.ok) {
              const errorData = await parseRes.json().catch(() => ({ error: `Failed to parse ${file.name}` }));
              throw new Error(errorData.error || `Failed to parse ${file.name}`);
            }

            const { text } = await parseRes.json();
            contentBlocks[0].text = `[DOC ATTACHMENT: ${file.name}]\n${text}\n\n---DOC_CONTEXT_END---\n\n${contentBlocks[0].text}`;
          } finally {
            setParsingFiles((prev) => prev.filter((name) => name !== file.name));
          }
        }
      }

      const hasImages = currentFiles.some((file) => file.type.startsWith('image/'));
      const finalContent = hasImages
        ? contentBlocks
        : contentBlocks
            .map((block) => block.text)
            .filter(Boolean)
            .join('\n\n');

      setInput('');
      setAttachedFiles([]);

      chat.submit(
        { messages: [{ type: 'human', content: finalContent as any }] },
        {
          optimisticValues: (prev) => ({
            messages: [...((prev?.messages as []) ?? []), { type: 'human', content: finalContent as any, id: 'temp' }],
          }),
        },
      );
    } catch (error: any) {
      toast.error('Processing failed', { description: error.message, duration: 5000 });
    }
  }

  function resumeInterruptedRun() {
    chat.submit(null, {
      multitaskStrategy: 'enqueue',
    });
  }

  const handleFilesSelect = (files: FileList) => {
    const newFiles = Array.from(files);

    if (attachedFiles.length + newFiles.length > 3) {
      toast.error('Attachment limit reached', { description: 'You can attach up to 3 items per message.' });
      return;
    }

    const tooLargeDoc = newFiles.find(
      (file) => (file.type === 'application/pdf' || file.name.endsWith('.docx')) && file.size > 5 * 1024 * 1024,
    );

    if (tooLargeDoc) {
      toast.error('File exceeds 5MB limit', { description: tooLargeDoc.name });
      return;
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent">
      {showHistorySidebar ? (
        <HistorySidebar
          userId={user?.sub}
          currentThreadId={threadId || undefined}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      ) : null}

      <div className="relative flex-1 h-full min-h-[60dvh] min-w-0 overflow-hidden bg-transparent sm:min-h-[72vh]">
        <StickToBottom className="flex h-full min-h-0 flex-col">
          <StickyToBottomContent
            content={
              chat.messages.length === 0 ? (
                <div className="h-full flex flex-col">{emptyStateComponent}</div>
              ) : (
                <>
                  <div className="mx-auto w-full min-w-0 px-2 py-3 sm:px-6 sm:py-6">
                    <ChatMessages messages={chat.messages} isLoading={chat.isLoading} />
                  </div>
                  <div className="mx-auto w-full max-w-full min-w-0 px-2 pb-6 sm:max-w-4xl sm:px-6 sm:pb-10">
                    <TokenVaultInterruptHandler interrupt={chat.interrupt} onFinish={resumeInterruptedRun} />
                  </div>
                </>
              )
            }
            footer={
              <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9]/96 to-transparent pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-3 sm:pb-6 sm:pt-6">
                <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />

                <div className="mx-auto mb-3 flex max-w-full min-w-0 flex-wrap gap-2 px-2 pb-1 sm:mb-4 sm:max-w-4xl sm:flex-nowrap sm:overflow-x-auto sm:px-6 no-scrollbar">
                  {['Find my latest unread email', 'What is on my calendar today?', 'Summarize my profile', 'Plan a Drive to YouTube workflow'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="max-w-full rounded-md border border-[#c1c6d7]/20 bg-white px-2.5 py-1.5 text-[9px] font-medium text-[#414755] transition-all hover:bg-[#f3f3f3] sm:whitespace-nowrap sm:px-3 sm:py-2 sm:text-[10px]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <ChatInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onSubmit={sendMessage}
                  loading={chat.isLoading}
                  onToolSelect={(toolName) => setInput(`@${toolName} `)}
                  files={attachedFiles}
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={(index) => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                  parsingFiles={parsingFiles}
                  placeholder={placeholder ?? 'Ask SimieBot to help with Gmail, Calendar, or creator workflows...'}
                />
              </div>
            }
          />
        </StickToBottom>
      </div>
    </div>
  );
}
