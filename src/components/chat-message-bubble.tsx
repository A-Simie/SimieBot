import { type Message, type AIMessage } from '@langchain/langgraph-sdk';
import { Loader2, CheckCircle } from 'lucide-react';

import { cn } from '@/utils/cn';
import { MemoizedMarkdown } from './memoized-markdown';

function ToolCallDisplay({ 
  toolCall, 
  isRunning,
  messageContent,
}: { 
  toolCall: NonNullable<AIMessage['tool_calls']>[0]; 
  isRunning: boolean;
  messageContent?: string;
}) {
  const toolLabel = toolCall.name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="mb-2 rounded-2xl border border-white/8 bg-slate-950/60 p-3">
      <div className="mb-2 flex items-center gap-2">
        {isRunning ? (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ) : (
          <CheckCircle className="h-3 w-3 text-secondary" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          {isRunning ? `Using ${toolLabel}` : `${toolLabel} complete`}
        </span>
      </div>

      {toolCall.args && Object.keys(toolCall.args).length > 0 && (
        <div className="rounded-xl border border-white/6 bg-black/20 px-2 py-1.5 text-[10px] font-mono text-primary/75">
          {JSON.stringify(toolCall.args)}
        </div>
      )}
      
      {messageContent && !isRunning && (
        <div className="mt-2 rounded-xl border border-secondary/10 bg-secondary/5 px-2 py-1.5 text-[10px]">
          <span className="text-secondary/80">
            {messageContent.length > 100 ? `${messageContent.substring(0, 100)}...` : messageContent}
          </span>
        </div>
      )}
    </div>
  );
}

export function ChatMessageBubble(props: { message: Message; aiEmoji?: string; allMessages?: Message[] }) {
  const toolCalls = props.message.type === 'ai' ? props.message.tool_calls || [] : [];
  
  const getMessageContent = (message: Message): string => {
    if (typeof message.content === 'string') return message.content;
    if (Array.isArray(message.content)) {
      return message.content
        .map(part => (typeof part === 'string' ? part : (part as any).text || ''))
        .join('');
    }
    return '';
  };

  const content = getMessageContent(props.message);
  const displayContent = content;
  
  const hasContent = displayContent.length > 0;
  const hasToolCalls = toolCalls.length > 0;
  
  const hasToolResults = hasToolCalls && props.allMessages && toolCalls.some(toolCall => 
    props.allMessages!.some(msg => msg.type === 'tool' && (msg as any).tool_call_id === toolCall.id)
  );
  
  const isRunning = hasToolCalls && !hasToolResults;
  
  const getToolResultContent = () => {
    if (!hasToolCalls || !props.allMessages) return '';
    for (const toolCall of toolCalls) {
      const toolResult = props.allMessages.find(msg => 
        msg.type === 'tool' && (msg as any).tool_call_id === toolCall.id
      );
      if (toolResult) return getMessageContent(toolResult);
    }
    return '';
  };
  
  const toolResultContent = getToolResultContent();
  
  if (!(['human', 'ai'].includes(props.message.type) && (hasContent || hasToolCalls))) {
    return null;
  }

  const isHuman = props.message.type === 'human';

  return (
    <div className={cn('mb-6 flex w-full flex-col animate-fade-in-up', isHuman ? 'items-end' : 'items-start')}>
      <div className={cn(
        'flex max-w-[92%] gap-3 sm:max-w-[85%]',
        isHuman ? 'flex-row-reverse' : 'flex-row'
      )}>
        {!isHuman && (
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'rounded-[1.4rem] border px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.22)]',
              isHuman 
                ? 'rounded-tr-md border-primary/20 bg-primary text-on-primary font-medium'
                : 'rounded-tl-md border-white/8 bg-white/[0.045] text-on-surface backdrop-blur-sm'
            )}
          >
            {hasToolCalls && (
              <div className="mb-3 space-y-2 not-prose">
                {toolCalls.map((toolCall) => (
                  <ToolCallDisplay
                    key={toolCall.id}
                    toolCall={toolCall}
                    isRunning={isRunning}
                    messageContent={toolResultContent}
                  />
                ))}
              </div>
            )}

            {hasContent && (
              <div className={cn(
                'chat-message-bubble prose prose-sm max-w-none whitespace-pre-wrap',
                isHuman ? 'prose-invert text-on-primary' : 'dark:prose-invert text-on-surface/90'
              )}>
                <MemoizedMarkdown content={displayContent} id={props.message.id ?? ''} />
              </div>
            )}
          </div>
          
          <div className={cn(
            'flex items-center gap-1 px-1',
            isHuman ? 'justify-end' : 'justify-start'
          )}>
            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
              {isHuman ? 'You' : 'SimieBot'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
