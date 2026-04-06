import { type Message, type AIMessage } from '@langchain/langgraph-sdk';
import { Loader2, CheckCircle, FileText, Image as ImageIcon } from 'lucide-react';

import { cn } from '@/utils/cn';
import { MemoizedMarkdown } from './memoized-markdown';

function ToolCallDisplay({ 
  toolCall, 
  isRunning,
}: { 
  toolCall: NonNullable<AIMessage['tool_calls']>[0]; 
  isRunning: boolean;
}) {
  const toolLabel = toolCall.name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="mb-2 rounded-2xl border border-white/8 bg-slate-950/60 p-3">
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ) : (
          <CheckCircle className="h-3 w-3 text-secondary" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          {isRunning ? `Using ${toolLabel}` : `${toolLabel} active`}
        </span>
      </div>
    </div>
  );
}

export function ChatMessageBubble(props: { message: Message; aiEmoji?: string; allMessages?: Message[] }) {
  const toolCalls = props.message.type === 'ai' ? props.message.tool_calls || [] : [];
  
  const getMessageContent = (message: Message): string => {
    let rawContent = '';
    if (typeof message.content === 'string') {
      rawContent = message.content;
    } else if (Array.isArray(message.content)) {
      rawContent = message.content
        .map((part: any) => (typeof part === 'string' ? part : (part as any).text || ''))
        .filter(text => text !== '')
        .join('\n');
    }

    // Hide technical document context if present
    if (rawContent.includes('---DOC_CONTEXT_END---')) {
      return rawContent.split('---DOC_CONTEXT_END---').pop()?.trim() || '';
    }
    return rawContent;
  };

  const content = getMessageContent(props.message);
  const displayContent = content;
  
  const hasContent = displayContent.length > 0;
  const hasToolCalls = toolCalls.length > 0;
  
  const hasToolResults = hasToolCalls && props.allMessages && toolCalls.some(toolCall => 
    props.allMessages!.some(msg => msg.type === 'tool' && (msg as any).tool_call_id === toolCall.id)
  );
  
  const isRunning = hasToolCalls && !hasToolResults;
  

  
  if (!(['human', 'ai'].includes(props.message.type) && (hasContent || hasToolCalls))) {
    return null;
  }

  const isHuman = props.message.type === 'human';

  return (
    <div className={cn('mb-8 flex w-full flex-col animate-fade-in-up', isHuman ? 'items-end' : 'items-start')}>
      <div className={cn(
        'group flex max-w-[95%] gap-4 sm:max-w-[85%]',
        isHuman ? 'flex-row-reverse' : 'flex-row'
      )}>
        {!isHuman && (
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.25rem] border border-primary/20 bg-primary/5 text-primary shadow-[0_10px_30px_rgba(134,173,255,0.15)] transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div
            className={cn(
              'relative rounded-[1.75rem] border px-5 py-4 transition-all overflow-hidden break-words min-w-0',
              isHuman 
                ? 'rounded-tr-lg border-primary/30 bg-gradient-to-br from-primary to-primary-container text-on-primary font-medium shadow-[0_20px_60px_rgba(134,173,255,0.25)]'
                : 'rounded-tl-lg border-white/10 bg-white/[0.04] text-on-surface backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.35)]'
            )}
          >
            {/* Ambient Background Glow for AI Messages */}
            {!isHuman && (
              <div className="absolute inset-0 -z-10 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {hasToolCalls && (
              <div className="mb-4 space-y-3 not-prose">
                {toolCalls.map((toolCall) => (
                  <ToolCallDisplay
                    key={toolCall.id}
                    toolCall={toolCall}
                    isRunning={isRunning}
                  />
                ))}
              </div>
            )}

            {/* Multimodal Attachments Preview (Human only) */}
            {isHuman && Array.isArray(props.message.content) && props.message.content.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-primary-foreground/10">
                {props.message.content.map((part: any, i: number) => {
                  if (part.type === 'image_url') {
                    return (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-primary-foreground/20">
                        <img 
                          src={part.image_url.url} 
                          alt="Attachment" 
                          className="w-24 h-24 object-cover hover:scale-110 transition-transform cursor-pointer"
                          onClick={() => window.open(part.image_url.url, '_blank')}
                        />
                      </div>
                    );
                  }
                  if (part.type === 'text' && part.text.includes('[DOC ATTACHMENT:')) {
                    const match = part.text.match(/\[DOC ATTACHMENT: (.*?)\]/);
                    const filename = match ? match[1] : 'Document';
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                        <FileText className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{filename}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {hasContent && (
              <div className={cn(
                'chat-message-bubble prose prose-sm max-w-full whitespace-pre-wrap leading-relaxed',
                isHuman ? 'prose-invert text-on-primary font-medium' : 'dark:prose-invert text-on-surface/95'
              )}>
                <MemoizedMarkdown 
                  content={
                    // For human messages with docs, hide the raw context until the unique separator
                    isHuman && content.includes('---DOC_CONTEXT_END---') 
                      ? content.split('---DOC_CONTEXT_END---').pop()?.trim() || content
                      : content
                  } 
                  id={props.message.id ?? ''} 
                />
              </div>
            )}
          </div>
          
          <div className={cn(
            'flex items-center gap-2 px-2',
            isHuman ? 'justify-end' : 'justify-start'
          )}>
             <span className="text-[9px] font-black uppercase tracking-[0.25em] text-on-surface-variant/40">
              {isHuman ? 'You' : 'SimieBot'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
