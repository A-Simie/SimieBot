import { z } from 'zod';

import { createNovaLiteModel, getTextContent } from '../bedrock';

const IntentSchema = z.object({
  intent: z
    .enum(['general', 'creator'])
    .describe('The specialized node to route the user request to.'),
});

function extractIntent(raw: string): z.infer<typeof IntentSchema>['intent'] {
  try {
    const parsed = IntentSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data.intent;
    }
  } catch {}

  const lowered = raw.toLowerCase();
  if (
    lowered.includes('youtube') ||
    lowered.includes('ffmpeg') ||
    lowered.includes('video') ||
    lowered.includes('drive') ||
    lowered.includes('publish')
  ) {
    return 'creator';
  }

  return 'general';
}

const TOOL_HINT_TO_NODE: Record<string, 'general' | 'creator'> = {
  gmail: 'general',
  calendar: 'general',
  github: 'general',
  slack: 'general',
  search: 'general',
  calculator: 'general',
  profile: 'general',
  drive: 'creator',
  youtube: 'creator',
  creator: 'creator',
};

function getMessageTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === 'string') {
          return part;
        }

        return typeof part?.text === 'string' ? part.text : '';
      })
      .join(' ');
  }

  return '';
}

function extractToolHint(message: unknown): string | null {
  const text = getMessageTextContent((message as { content?: unknown } | null)?.content ?? '');
  const match = text.match(/(^|\s)@([a-zA-Z]+)/);
  if (!match?.[2]) {
    return null;
  }

  const normalized = match[2].toLowerCase();
  return normalized in TOOL_HINT_TO_NODE ? normalized : null;
}

export async function routerNode(state: any) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  const toolHint = extractToolHint(lastMessage);

  if (toolHint === 'gmail' || toolHint === 'calendar' || toolHint === 'github' || toolHint === 'slack' || toolHint === 'search' || toolHint === 'calculator' || toolHint === 'profile') {
    return {
      activeNode: TOOL_HINT_TO_NODE[toolHint],
      toolHint,
    };
  }

  const llm = createNovaLiteModel({ temperature: 0 });

  const response = await llm.invoke([
    {
      role: 'system',
      content: `You are an intent classifier for SimieBot.
Route each user request to exactly one node:
- general: Gmail, Calendar, GitHub, Slack channels, user info, general assistant tasks
- creator: Google Drive, Amazon Nova edit planning, FFmpeg rendering, YouTube publishing

Return JSON only in the form {"intent":"general"}.`,
    },
    lastMessage,
  ]);

  const intent = extractIntent(getTextContent(response.content));

  return {
    activeNode: toolHint === 'youtube' || toolHint === 'creator' ? 'creator' : intent,
    toolHint,
  };
}
