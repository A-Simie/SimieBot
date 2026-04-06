'use client';

import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  Plus,
  Mail,
  Calendar as CalendarIcon,
  Github,
  Slack,
  Video,
  Search,
  Calculator,
  Sliders,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  PanelLeft,
  X,
  Globe,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';

import { TokenVaultInterruptHandler } from '@/components/TokenVaultInterruptHandler';
import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { HistorySidebar } from '@/components/history-sidebar';
import { upsertChatThread } from '@/lib/supabase';
import { ThesisLoading, CreatorLoading } from '@/components/generative-ui/node-status';

const AVAILABLE_TOOLS = [
  { id: 'gmail', name: 'Gmail', icon: Mail, color: 'text-red-400', description: 'Read and send emails' },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon, color: 'text-blue-400', description: 'Manage your schedule' },
  { id: 'drive', name: 'Drive', icon: Globe, color: 'text-primary', description: 'Access cloud files' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-white', description: 'Check repositories' },
  { id: 'slack', name: 'Slack', icon: Slack, color: 'text-purple-400', description: 'Check messages' },
  { id: 'serp', name: 'Search', icon: Search, color: 'text-secondary', description: 'Search the web' },
  { id: 'calc', name: 'Calculator', icon: Calculator, color: 'text-on-surface-variant', description: 'Do math' },
];

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
}) {
  const [showTools, setShowTools] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileFilter, setFileFilter] = useState("image/*,.pdf,.docx");

  useEffect(() => {
    if (value.endsWith('@')) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [value]);

  const handleMentionClick = (toolName: string) => {
    const newValue = value.slice(0, -1) + `@${toolName} `;
    onChange({ target: { value: newValue } } as any);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4">
      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2">
          {files.map((file, i) => {
            const isParsing = parsingFiles.includes(file.name);
            // Use a stable key to prevent blinking/re-rendering issues
            const stableKey = `${file.name}-${file.size}-${file.lastModified}`;
            return (
              <div key={stableKey} className={cn(
                "group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all animate-in zoom-in duration-200",
                isParsing ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/10 shadow-sm hover:border-white/20"
              )}>
                <div className="flex items-center gap-1.5 shrink-0">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-primary/60" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-secondary/60" />
                  )}
                  {isParsing && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary ml-0.5" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant max-w-[120px] truncate uppercase tracking-widest leading-none">
                  {file.name}
                </span>
                {!isParsing && (
                  <button
                    onClick={() => onFileRemove(i)}
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

      {/* Tool Mentions */}
      {showMentions && (
        <div className="absolute bottom-full left-4 mb-4 w-64 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Select Tool</p>
          <div className="space-y-1">
            {AVAILABLE_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleMentionClick(tool.name)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <tool.icon className={cn("w-4 h-4", tool.color)} />
                <span className="text-sm font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Context Menu */}
      {showAddMenu && (
        <div className="absolute bottom-full left-4 mb-4 flex flex-col w-48 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Add Context</p>
          <button
            onClick={() => {
              setFileFilter(".pdf,.docx");
              setShowAddMenu(false);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FileText className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-xs font-bold text-on-surface/90">PDF or Docs</span>
          </button>
          <button
            onClick={() => {
              setFileFilter("image/*");
              setShowAddMenu(false);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ImageIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-bold text-on-surface/90">Media (Image)</span>
          </button>
        </div>
      )}

      {/* Grid Tool Menu */}
      {showTools && (
        <div className="absolute bottom-full left-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 w-[calc(100%-2rem)] sm:w-[480px] rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {AVAILABLE_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                onToolSelect(tool.name);
                setShowTools(false);
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 border border-transparent transition-all">
                <tool.icon className={cn("w-5 h-5", tool.color)} />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-on-surface">{tool.name}</span>
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="relative flex w-full items-center gap-2 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-1.5">
          {/* Add Context Button */}
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
            onClick={() => setShowAddMenu(!showAddMenu)}
            title="Add Context (PDF, Docs, Image)"
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all active:scale-95",
              showAddMenu ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface"
            )}
          >
            {showAddMenu ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>

          {/* Tools Menu Button */}
          <button
            type="button"
            onClick={() => setShowTools(!showTools)}
            className={cn(
              "flex h-11 px-4 shrink-0 items-center justify-center gap-2 rounded-2xl transition-all active:scale-95",
              showTools ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface border border-transparent"
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
          placeholder={files.length > 0 ? "Add a message about your files..." : "Upload Images, PDF, DOCX (Max 5MB) or use '@'..." }
          className="min-w-0 flex-1 bg-transparent border-none px-2 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/40"
        />

        <button
          type="submit"
          disabled={loading || parsingFiles.length > 0 || (!value.trim() && files.length === 0)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(134,173,255,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {loading || parsingFiles.length > 0 ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}

function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading: boolean }) {
  const lastMessage = messages[messages.length - 1];
  const isResearching = isLoading && lastMessage?.type === 'human' && (lastMessage.content.toString().toLowerCase().includes('research') || lastMessage.content.toString().toLowerCase().includes('find') || lastMessage.content.toString().toLowerCase().includes('thesis'));
  const isThinking = isLoading && lastMessage?.type === 'human' && !isResearching;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-6 pb-12 min-w-0 overflow-x-hidden">
      {messages.map((m) => (
        <ChatMessageBubble key={m.id} message={m} allMessages={messages} />
      ))}

      {isResearching && (
        <div className="px-4 py-2">
          <ThesisLoading />
        </div>
      )}

      {isThinking && (
        <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.25rem] border border-primary/20 bg-primary/5 text-primary shadow-[0_10px_30px_rgba(134,173,255,0.15)] animate-pulse">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative rounded-[1.75rem] rounded-tl-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface/50 backdrop-blur-xl flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Thinking...
            </div>
          </div>
        </div>
      )}
    </div>
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
      className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar min-w-0 w-full"
    >
      <div ref={context.contentRef} className="min-h-full w-full min-w-0">
        {content}
      </div>
      {footer}
    </div>
  );
}

export function ChatWindow({ endpoint, user }: { endpoint: string; user: any }) {
  const [threadId, setThreadId] = useQueryState('threadId');
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const initializedRef = useRef<string | null>(null);

  const chat = useStream({
    apiUrl: endpoint,
    assistantId: 'agent',
    threadId: threadId || undefined,
    onThreadId: setThreadId,
    onError: (e: any) => {
      console.error('[Stream Error]', e);
      toast.error('AI Stream Error', { description: e.message || 'The connection was interrupted.' });
    },
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [parsingFiles, setParsingFiles] = useState<string[]>([]);

  const extractThreadTitle = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const textPart = content.find(p => p.type === 'text');
      if (textPart) {
        // Skip technical attachment text if possible
        const cleanText = textPart.text.includes('---DOC_CONTEXT_END---') 
          ? textPart.text.split('---DOC_CONTEXT_END---').pop()?.trim() 
          : textPart.text;
        return cleanText || 'New Chat';
      }
    }
    return 'New Chat';
  };

  // Supabase Thread Management
  useEffect(() => {
    if (threadId && user?.sub && chat.messages.length > 0) {
      if (threadId !== initializedRef.current) {
        initializedRef.current = threadId;
        const firstMsgContent = chat.messages[0]?.content;
        const title = extractThreadTitle(firstMsgContent);
        
        upsertChatThread({
          id: threadId,
          user_id: user.sub,
          title: title.slice(0, 40),
          updated_at: new Date().toISOString()
        });
      }
    }
  }, [threadId, user?.sub, chat.messages]);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading || parsingFiles.length > 0 || (!input.trim() && attachedFiles.length === 0)) return;

    const currentInput = input;
    const currentFiles = [...attachedFiles];
    
    try {
      // Process files for multimodal/context injection
      const contentBlocks: any[] = [{ type: 'text', text: currentInput }];

      for (const file of currentFiles) {
        if (file.type.startsWith('image/')) {
          // No parsing needed for images, but convert to base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          contentBlocks.push({
            type: 'image_url',
            image_url: { url: base64 }
          });
        } else if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
          // Tracking per-file parsing status
          setParsingFiles(prev => [...prev, file.name]);
          
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            const parseRes = await fetch('/api/parse-document', {
              method: 'POST',
              body: formData
            });
            
            if (!parseRes.ok) {
              const errorData = await parseRes.json();
              throw new Error(errorData.error || `Failed to parse ${file.name}`);
            }
            
            const { text } = await parseRes.json();
            contentBlocks[0].text = `[DOC ATTACHMENT: ${file.name}]\n${text}\n\n---DOC_CONTEXT_END---\n\n${contentBlocks[0].text}`;
            setParsingFiles(prev => prev.filter(name => name !== file.name));
          } catch (err: any) {
            setParsingFiles(prev => prev.filter(name => name !== file.name));
            throw err; // Re-throw to handle in outer catch
          }
        }
      }

      // Optimized formatting to avoid contentBlockIndex streaming bug in stable SDK
      const hasImages = attachedFiles.some(f => f.type.startsWith('image/'));
      const finalContent = hasImages 
        ? contentBlocks 
        : contentBlocks.map(b => b.text).filter(Boolean).join('\n\n');

      setInput('');
      setAttachedFiles([]);

      chat.submit(
        { messages: [{ type: 'human', content: finalContent as any }] },
        {
          optimisticValues: (prev) => ({
            messages: [...((prev?.messages as []) ?? []), { 
              type: 'human', 
              content: finalContent as any,
              id: 'temp' 
            }],
          }),
        }
      );
    } catch (err: any) {
      toast.error('Processing failed', { 
        description: err.message,
        duration: 5000 
      });
    }
  }

  const handleFilesSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    
    if (attachedFiles.length + newFiles.length > 3) {
      toast.error('Attachment limit reached', { description: 'You can attach up to 3 items per message.' });
      return;
    }

    // Validate PDF size (5MB as per user request)
    const exceedsLimit = newFiles.find(f => (f.type === 'application/pdf' || f.name.endsWith('.docx')) && f.size > 5 * 1024 * 1024);
    if (exceedsLimit) {
      toast.error('File exceeds 5MB limit', { description: exceedsLimit.name });
      return;
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleToolSelect = (toolName: string) => {
    setInput(`@${toolName} `);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <HistorySidebar
        userId={user?.sub}
        currentThreadId={threadId || undefined}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 relative flex flex-col min-w-0 bg-[#0a0e14]">
        <StickToBottom className="flex-1 min-h-0 flex flex-col">
          <StickyToBottomContent
            content={
              <div className="mx-auto w-full px-4 pt-20 pb-8">
                {chat.messages.length === 0 ? (
                  <div className="flex h-[75vh] items-center justify-center text-center">
                    <div className="max-w-md animate-in fade-in zoom-in duration-700">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(134,173,255,0.2)]">
                        <MessageSquare className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-3xl font-black font-headline tracking-tighter mb-4 text-white">How can I help?</h2>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                        Ask me anything or use the tools below to manage your Gmail, Calendar, Drive, or GitHub.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Check my emails', 'What’s on my calendar?'].map(s => (
                          <button key={s} onClick={() => setInput(s)} className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChatMessages messages={chat.messages} isLoading={chat.isLoading} />
                )}
              </div>
            }
          />

          <div className="shrink-0 pb-10 pt-4 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/90 to-transparent">
             {/* Quick Actions / Fast Words */}
             <div className="flex flex-wrap justify-center gap-2 mb-6 px-4 animate-in fade-in slide-in-from-bottom-2">
               {[
                 { label: "Read my latest email", icon: Mail },
                 { label: "Summarize my day", icon: CalendarIcon },
                 { label: "Check GitHub activity", icon: Github },
                 { label: "Plan creator workflow", icon: MessageSquare }
               ].map((s) => (
                 <button
                   key={s.label}
                   onClick={() => setInput(s.label)}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-all active:scale-95"
                 >
                   <s.icon className="w-3 h-3 text-primary/60" />
                   {s.label}
                 </button>
               ))}
             </div>

             <ChatInput
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
                onSubmit={sendMessage}
                loading={chat.isLoading}
                onToolSelect={handleToolSelect}
                files={attachedFiles}
                onFilesSelect={handleFilesSelect}
                onFileRemove={handleFileRemove}
                parsingFiles={parsingFiles}
              />
          </div>
        </StickToBottom>
      </main>
    </div>
  );
}
