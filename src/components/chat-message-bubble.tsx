import { type Message, type AIMessage } from '@langchain/langgraph-sdk';
import { Loader2, CheckCircle, Info } from 'lucide-react';

import { cn } from '@/utils/cn';
import { MemoizedMarkdown } from './memoized-markdown';

// --- Specialized Component Imports ---
import { ResearchCard } from './generative-ui/research-card';
import { CryptoRiskGauge } from './generative-ui/crypto-risk-gauge';
import { VideoTimeline } from './generative-ui/video-timeline';
import { PreflightLedger } from './generative-ui/preflight-ledger';
import { HITLApproval } from './generative-ui/hitl-approval';
import { BibliographyLedger } from './generative-ui/bibliography-ledger';

function ToolCallDisplay({ 
  toolCall, 
  isRunning,
  messageContent 
}: { 
  toolCall: NonNullable<AIMessage['tool_calls']>[0]; 
  isRunning: boolean;
  messageContent?: string;
}) {
  return (
    <div className="bg-surface-container-lowest/50 neo-intrusion rounded-[1rem] p-3 mb-2 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {isRunning ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <CheckCircle className="w-3 h-3 text-secondary" />
        )}
        <span className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
          {isRunning ? `Neural Processing: ${toolCall.name}` : `Execution Complete: ${toolCall.name}`}
        </span>
      </div>

      {toolCall.args && Object.keys(toolCall.args).length > 0 && (
        <div className="mb-2">
          <div className="bg-black/20 rounded px-2 py-1.5 text-[10px] font-mono border border-white/5 text-primary/70 overflow-hidden text-ellipsis">
            {JSON.stringify(toolCall.args)}
          </div>
        </div>
      )}
      
      {messageContent && !isRunning && (
        <div className="bg-secondary/5 rounded px-2 py-1.5 text-[10px] border border-secondary/10">
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
  
  // --- SimieBot Generative UI Detection ---
  // We check if the content contains a specific JSON marker for rich components
  const renderRichComponent = () => {
    try {
      const match = content.match(/\[SIMIE_COMPONENT:(.*?)\]/);
      if (match) {
        const { type, data } = JSON.parse(match[1]);
        switch (type) {
          case 'research-card': return <ResearchCard {...data} />;
          case 'crypto-risk': return <CryptoRiskGauge {...data} />;
          case 'video-timeline': return <VideoTimeline {...data} />;
          case 'preflight-ledger': return <PreflightLedger {...data} />;
          case 'hitl-approval': return <HITLApproval {...data} />;
          case 'bibliography-ledger': return <BibliographyLedger {...data} />;
          default: return null;
        }
      }
    } catch (e) {
      console.warn('Failed to parse rich component:', e);
    }
    return null;
  };

  const richComponent = renderRichComponent();
  const displayContent = richComponent ? content.replace(/\[SIMIE_COMPONENT:.*?\]/, '').trim() : content;
  
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
  
  if (!(['human', 'ai'].includes(props.message.type) && (hasContent || hasToolCalls || richComponent))) {
    return null;
  }

  const isHuman = props.message.type === 'human';

  return (
    <div className={cn('flex flex-col mb-6 w-full animate-fade-in-up', isHuman ? 'items-end' : 'items-start')}>
      <div className={cn(
        'flex gap-3 max-w-[85%]',
        isHuman ? 'flex-row-reverse' : 'flex-row'
      )}>
        {!isHuman && (
          <div className="w-8 h-8 rounded-full bg-surface-container-high neo-extrusion border border-white/5 flex items-center justify-center shrink-0 mt-1">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'px-4 py-3 rounded-[1.25rem] shadow-neo-extrusion border border-white/5',
              isHuman 
                ? 'bg-primary text-on-primary rounded-tr-none font-medium' 
                : 'bg-surface-container-low text-on-surface rounded-tl-none'
            )}
          >
            {hasToolCalls && (
              <div className="space-y-2 mb-3 not-prose">
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
            
            {richComponent && <div className="mb-3">{richComponent}</div>}
            
            {hasContent && (
              <div className={cn(
                'chat-message-bubble whitespace-pre-wrap prose prose-sm max-w-none',
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
            <span className="text-[8px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
              {isHuman ? 'Operator' : 'SimieBot Intelligence'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}