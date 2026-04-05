import { z } from 'zod';

import { createNovaLiteModel, getTextContent } from '../bedrock';

const IntentSchema = z.object({
  intent: z
    .enum(['general', 'finance', 'creator'])
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
    lowered.includes('slack media') ||
    lowered.includes('publish')
  ) {
    return 'creator';
  }

  if (lowered.includes('coinbase') || lowered.includes('portfolio') || lowered.includes('balance')) {
    return 'finance';
  }

  return 'general';
}

export async function routerNode(state: any) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  const llm = createNovaLiteModel({ temperature: 0 });

  const response = await llm.invoke([
    {
      role: 'system',
      content: `You are an intent classifier for SimieBot.
Route each user request to exactly one node:
- general: Gmail, Calendar, user info, general assistant tasks
- finance: Coinbase and account-on-behalf-of-user finance workflows
- creator: Google Drive, Slack media intake, Amazon Nova edit planning, FFmpeg rendering, YouTube publishing

Return JSON only in the form {"intent":"general"}.`,
    },
    lastMessage,
  ]);

  const intent = extractIntent(getTextContent(response.content));

  return { activeNode: intent };
}
