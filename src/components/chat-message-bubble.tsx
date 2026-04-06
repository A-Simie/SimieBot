import Image from 'next/image';
import { type AIMessage, type Message } from '@langchain/langgraph-sdk';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';

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
    <div className="mb-2 rounded-2xl border border-[#c1c6d7]/20 bg-[#f9f9f9] p-3">
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Loader2 className="h-3 w-3 animate-spin text-[#0058bc]" />
        ) : (
          <CheckCircle className="h-3 w-3 text-emerald-600" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#717786]">
          {isRunning ? `Using ${toolLabel}` : `${toolLabel} active`}
        </span>
      </div>
    </div>
  );
}

export function ChatMessageBubble(props: { message: Message; allMessages?: Message[] }) {
  const toolCalls = props.message.type === 'ai' ? props.message.tool_calls || [] : [];

  const getMessageContent = (message: Message): string => {
    let rawContent = '';
    if (typeof message.content === 'string') {
      rawContent = message.content;
    } else if (Array.isArray(message.content)) {
      rawContent = message.content
        .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
        .filter((text) => text !== '')
        .join('\n');
    }

    if (rawContent.includes('---DOC_CONTEXT_END---')) {
      return rawContent.split('---DOC_CONTEXT_END---').pop()?.trim() || '';
    }

    return rawContent;
  };

  const content = getMessageContent(props.message);
  const hasContent = content.length > 0;
  const hasToolCalls = toolCalls.length > 0;
  const hasToolResults =
    hasToolCalls &&
    props.allMessages &&
    toolCalls.some((toolCall) =>
      props.allMessages!.some((msg) => msg.type === 'tool' && (msg as any).tool_call_id === toolCall.id),
    );
  const isRunning = hasToolCalls && !hasToolResults;

  if (!(['human', 'ai'].includes(props.message.type) && (hasContent || hasToolCalls))) {
    return null;
  }

  const isHuman = props.message.type === 'human';

  return (
    <div className={cn('mb-6 sm:mb-8 flex w-full flex-col animate-fade-in-up', isHuman ? 'items-end' : 'items-start')}>
      <div className={cn('group flex max-w-[95%] gap-3 sm:gap-4 sm:max-w-[85%]', isHuman ? 'flex-row-reverse' : 'flex-row')}>
        {!isHuman && (
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1.25rem] border border-[#dbe7ff] bg-white text-[#0058bc] shadow-sm transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            <span className="material-symbols-outlined text-sm sm:text-[20px]">smart_toy</span>
          </div>
        )}

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div
            className={cn(
              'relative rounded-[1.4rem] sm:rounded-[1.75rem] border px-4 py-3 sm:px-5 sm:py-4 transition-all overflow-hidden break-words min-w-0',
              isHuman
                ? 'rounded-tr-md sm:rounded-tr-lg border-[#0058bc]/20 bg-gradient-to-br from-[#0058bc] to-[#0070eb] text-white font-medium shadow-[0_20px_50px_rgba(0,88,188,0.18)]'
                : 'rounded-tl-md sm:rounded-tl-lg border-[#e8e8e8] bg-white text-[#1a1c1c] shadow-[0_12px_30px_rgba(0,88,188,0.05)]',
            )}
          >
            {!isHuman && (
              <div className="absolute inset-0 -z-10 rounded-full bg-[#eef4ff] blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            )}

            {hasToolCalls && (
              <div className="mb-4 space-y-3 not-prose">
                {toolCalls.map((toolCall) => (
                  <ToolCallDisplay key={toolCall.id} toolCall={toolCall} isRunning={isRunning} />
                ))}
              </div>
            )}

            {isHuman && Array.isArray(props.message.content) && props.message.content.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-primary-foreground/10">
                {props.message.content.map((part: any, index: number) => {
                  if (part.type === 'image_url') {
                    return (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-primary-foreground/20">
                        <Image
                          src={part.image_url.url}
                          alt="Attachment"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover hover:scale-110 transition-transform cursor-pointer"
                          width={96}
                          height={96}
                          unoptimized
                          onClick={() => window.open(part.image_url.url, '_blank')}
                        />
                      </div>
                    );
                  }

                  if (part.type === 'text' && typeof part.text === 'string' && part.text.includes('[DOC ATTACHMENT:')) {
                    const match = part.text.match(/\[DOC ATTACHMENT: (.*?)\]/);
                    const filename = match ? match[1] : 'Document';
                    return (
                      <div key={index} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
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
              <div
                className={cn(
                  'chat-message-bubble prose prose-sm max-w-full whitespace-pre-wrap leading-relaxed',
                  isHuman ? 'prose-invert text-white font-medium' : 'text-[#1a1c1c]',
                )}
              >
                <MemoizedMarkdown content={content} id={props.message.id ?? ''} />
              </div>
            )}
          </div>

          <div className={cn('flex items-center gap-2 px-2', isHuman ? 'justify-end' : 'justify-start')}>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-on-surface-variant/40">
              {isHuman ? 'You' : 'SimieBot'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
